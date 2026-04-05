"""
Triage endpoints:
  POST /triage/start    — create session, return first question
  POST /triage/followup — get next question (or [DONE])
  POST /triage/finalize — score + save + return full result
  GET  /triage/case/{id} — saved result (guest cases by unguessable id, owned cases by token)
"""

import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services.triage_engine import LLM_FLAG_CHOICES, score_text
from app.services.i18n_triage import (
    critical_visit_prep,
    finalize_fallback_explanation,
    first_question,
    language_name_for_prompt,
    normalize_lang,
)
from app.services.llm_service import generate_followup_question, explain_triage, chat
from app.services.provider_ranker import rank_care_options
from app.services.reminder_service import schedule_reminder
from app.core.auth import get_supabase, optional_user_id

router = APIRouter()
logger = logging.getLogger("bridgecare.triage")


class UserProfile(BaseModel):
    age_range: Optional[str] = None
    zip: Optional[str] = None
    insurance_status: Optional[str] = None
    language: Optional[str] = "en"
    mode: Optional[str] = "guided"


class StartRequest(BaseModel):
    profile: UserProfile = UserProfile()


class MessageItem(BaseModel):
    role: str
    content: str


class FollowupRequest(BaseModel):
    session_id: str
    messages: list[MessageItem]
    profile: Optional[UserProfile] = None


class FinalizeRequest(BaseModel):
    session_id: str
    messages: list[MessageItem]
    profile: Optional[UserProfile] = None


@router.post("/triage/start")
async def start_triage(req: StartRequest):
    session_id = str(uuid.uuid4())
    mode = req.profile.mode or "guided"
    lang = normalize_lang(req.profile.language)
    first_q = first_question(mode, lang)

    return {"session_id": session_id, "first_question": first_q}


@router.post("/triage/followup")
async def triage_followup(req: FollowupRequest):
    messages = [{"role": m.role, "content": m.content} for m in req.messages]
    user_turns = sum(1 for m in req.messages if m.role == "user")
    prof = req.profile if req.profile is not None else UserProfile()
    mode = prof.mode or "guided"
    lang = normalize_lang(prof.language)
    lang_name = language_name_for_prompt(prof.language)
    progress = min(80, user_turns * 20)

    question, is_done = await generate_followup_question(
        messages,
        mode=mode,
        progress=progress,
        language=lang,
        language_name=lang_name,
    )

    return {
        "reply": question,
        "done": is_done,
        "progress": progress,
    }


@router.post("/triage/finalize")
async def finalize_triage(req: FinalizeRequest, user_id: Optional[str] = Depends(optional_user_id)):
    user_msgs = [m.content for m in req.messages if m.role == "user"]
    all_user_text = " ".join(user_msgs)
    chief_complaint = " ".join(user_msgs[:3])[:300]

    prof = req.profile if req.profile is not None else UserProfile()
    lang = normalize_lang(prof.language)
    lang_name = language_name_for_prompt(prof.language)

    # 1. Deterministic scoring — on everything the user said, not just the displayed complaint
    score = score_text(all_user_text)
    # Backstop for phrasings no list catches ("an elephant on my chest", "I don't want to keep living"),
    # in any language. The LLM may only pick items from a fixed list; the rules score those items,
    # and the result can only raise urgency, never lower it.
    try:
        picked = await chat(
            [{"role": "user", "content": (
                "Which of these does the person say they are experiencing now? "
                f"{'; '.join(LLM_FLAG_CHOICES)}.\n"
                "Pick an item only if the text clearly says it, in any wording or language. "
                "Don't add severity they didn't state (a fever is not a high fever unless they say so). "
                "Ignore anything they deny. "
                "Reply with only the matching items separated by ';', or NONE.\n\n"
                f"Text: {all_user_text}"
            )}],
            system="You are a careful medical triage assistant.",
        )
        kept = [p.strip().lower() for p in picked.split(";") if p.strip().lower() in LLM_FLAG_CHOICES]
        flagged = score_text("; ".join(kept))
        if flagged.score > score.score:
            score = flagged
    except Exception:
        logger.warning("Red-flag backstop unavailable; using phrase-list scoring only")

    # 2. Rank care options by insurance status
    insurance = prof.insurance_status or "unknown"
    ranked_options = rank_care_options(score, insurance_status=insurance)

    # 3. Generate AI explanation
    try:
        explanation = await explain_triage(
            chief_complaint=chief_complaint,
            urgency_level=score.urgency_level,
            red_flags=score.red_flags,
            care_option=ranked_options[0]["type"] if ranked_options else "self-care",
            language=lang,
            language_name=lang_name,
        )
    except Exception:
        explanation = finalize_fallback_explanation(
            score.urgency_level, score.urgency_label, prof.language
        )

    # 4. Generate visit prep
    visit_prep = await _generate_visit_prep(
        chief_complaint,
        score.urgency_level,
        ranked_options,
        language_name=lang_name,
        lang_code=lang,
    )

    # 5. Save to Supabase (always — user_id optional for guest sessions)
    case_id = str(uuid.uuid4())
    try:
        supabase = get_supabase()
        row = {
            "id": case_id,
            "chief_complaint": chief_complaint,
            "urgency_level": score.urgency_level,
            "urgency_label": score.urgency_label,
            "score": score.score,
            "explanation": explanation,
            "red_flags": score.red_flags,
            "care_options": ranked_options,
            "cost_estimate": score.cost_estimate,
            "follow_up_in": score.follow_up_in,
            "warning_signs": score.warning_signs,
            "visit_prep": visit_prep,
        }
        if user_id:
            row["user_id"] = user_id
        supabase.table("cases").insert(row).execute()
        if user_id:
            schedule_reminder(supabase, user_id, case_id, score.urgency_level, chief_complaint)
    except Exception:
        logger.exception("Case save failed (result still returned to the user)")

    return {
        "case_id": case_id,
        "triage": {
            "urgency_level": score.urgency_level,
            "urgency_label": score.urgency_label,
            "score": score.score,
            "red_flags": score.red_flags,
            "explanation": explanation,
            "care_options": ranked_options,
            "cost_estimate": score.cost_estimate,
            "follow_up_in": score.follow_up_in,
            "chief_complaint": chief_complaint,
            "warning_signs": score.warning_signs,
            "visit_prep": visit_prep,
        },
    }


@router.get("/triage/case/{case_id}")
async def get_case(case_id: str, user_id: Optional[str] = Depends(optional_user_id)):
    try:
        uuid.UUID(case_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="Case not found")
    try:
        rows = get_supabase().table("cases").select("*").eq("id", case_id).limit(1).execute().data
    except Exception:
        logger.exception("Case lookup failed")
        raise HTTPException(status_code=503, detail="Saved results are temporarily unavailable")
    # Guest cases are readable by whoever holds the random id (the results link);
    # cases tied to an account only by that account. Same 404 either way so ids can't be probed.
    if not rows or (rows[0].get("user_id") and rows[0]["user_id"] != user_id):
        raise HTTPException(status_code=404, detail="Case not found")
    return rows[0]


async def _generate_visit_prep(
    complaint: str,
    urgency: str,
    options: list[dict],
    language_name: str = "English",
    lang_code: str = "en",
) -> dict:
    if urgency in ("critical",):
        return critical_visit_prep(lang_code, complaint)

    try:
        prompt = f"""Generate a brief visit prep guide for this patient. 
Chief complaint: {complaint}
Urgency: {urgency}
Care type: {options[0]['type'] if options else 'doctor visit'}

Write every string in the JSON in {language_name} (not English unless that is the target language).
Return JSON with keys: bring (list), say (list), ask (list), go_sooner_if (list).
Each list has 3-4 short items. Be specific to the complaint."""
        resp = await chat([{"role": "user", "content": prompt}], system="Return only valid JSON.")
        import json
        start = resp.find("{")
        end = resp.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(resp[start:end])
    except Exception:
        pass

    return {
        "bring": ["Insurance card or ID", "List of current medications", "Note of symptom timeline"],
        "say": [f"'{complaint}'", "'Here's how long it's been going on'", "'This is my severity rating'"],
        "ask": ["'What could be causing this?'", "'What should I watch for?'", "'When should I come back?'"],
        "go_sooner_if": ["Symptoms suddenly worsen", "Fever develops", "You feel significantly worse"],
    }
