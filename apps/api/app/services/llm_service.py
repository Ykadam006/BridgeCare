"""
Provider-agnostic LLM service.
Chain: Ollama → Claude → Groq → Google AI Studio (unconfigured ones are skipped)
"""

import httpx
import logging
from anthropic import AsyncAnthropic
from typing import Optional
from pathlib import Path
from app.core.auth import get_supabase
from app.core.config import settings

logger = logging.getLogger("bridgecare.llm")

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


def load_prompt(name: str) -> str:
    path = PROMPTS_DIR / f"{name}.txt"
    return path.read_text().strip() if path.exists() else ""


SYSTEM_PROMPT = load_prompt("safety") or """You are BridgeCare, a calm health navigation assistant for Gen Z.

Rules:
- NEVER diagnose, claim certainty, or decide urgency
- Keep responses under 120 words unless asked for detail
- Tone: warm, plain-language, "knowledgeable friend"
- When asking follow-up questions, ask ONE at a time
- If symptoms sound critical (chest pain, breathing issues), immediately tell them to call 911
- Urgency has already been determined by a rule engine — do not second-guess it
- End with: this is navigation, not medical advice"""


async def chat(messages: list[dict], system: Optional[str] = None) -> str:
    full_messages = [{"role": "system", "content": system or SYSTEM_PROMPT}, *messages]

    for provider_fn in [_ollama, _anthropic, _groq, _google_ai]:
        try:
            result = await provider_fn(full_messages)
            if result:
                logger.info(f"LLM response from {provider_fn.__name__}: {len(result)} chars")
                return result
        except Exception as e:
            logger.warning(f"{provider_fn.__name__} failed: {e}")

    raise RuntimeError("All AI providers failed")


async def explain_triage(
    chief_complaint: str,
    urgency_level: str,
    red_flags: list[str],
    care_option: str,
    language: str = "en",
    language_name: str = "English",
) -> str:
    summary_template = load_prompt("summary")
    prompt = summary_template.format(
        chief_complaint=chief_complaint,
        urgency_level=urgency_level,
        red_flags=", ".join(red_flags) if red_flags else "none",
        care_option=care_option,
    ) if summary_template else f"""Write a calm 2-3 sentence explanation for this triage result.

Symptom: {chief_complaint}
Urgency (set by rule engine): {urgency_level}
Red flags: {', '.join(red_flags) if red_flags else 'none'}
Recommended care: {care_option}

Second person ("your symptoms..."). Be honest, calm. No diagnosis. Under 60 words."""

    prompt = (
        f"{prompt}\n\n"
        f"Write your entire response ONLY in {language_name} (language code: {language}). "
        "Do not use English unless the target language is English."
    )

    try:
        return await chat([{"role": "user", "content": prompt}])
    except Exception:
        if language == "es":
            return (
                f"Tus síntomas se evaluaron con urgencia {urgency_level}. "
                f"Se recomienda: {care_option}."
            )
        return f"Your symptoms have been assessed as {urgency_level} urgency. {care_option} is recommended."


async def generate_followup_question(
    messages: list[dict],
    mode: str = "guided",
    progress: int = 0,
    language: str = "en",
    language_name: str = "English",
) -> tuple[str, bool]:
    """
    Generate the next follow-up question.
    Returns (question_text, is_done).
    is_done=True when enough info has been collected (typically after 3-5 turns).
    """
    followup_template = load_prompt("followups")
    context = followup_template or """You are collecting symptom information for a health triage.
Ask ONE focused follow-up question to gather missing information. 
Topics to cover: duration, severity, associated symptoms, medications, previous episodes.
After 4-5 user responses, respond with exactly: [DONE]"""

    lang_line = (
        f"The user's preferred language is {language_name} (code: {language}). "
        f"Your entire reply must be ONLY in {language_name} — one follow-up question, or [DONE]. "
        "Do not use English unless the target language is English."
    )
    history = [{"role": "user", "content": context}] + messages + [
        {
            "role": "user",
            "content": (
                f"Mode: {mode}. Progress: {progress}%.\n{lang_line}\n"
                "Ask the next question, or respond with exactly [DONE] if enough info."
            ),
        }
    ]

    try:
        response = await chat(history, system="You help gather health information concisely.")
        is_done = "[DONE]" in response or progress >= 80
        clean = response.replace("[DONE]", "").strip()
        fallback_more = (
            "¿Hay algo más que ayude a entender tu situación?"
            if language == "es"
            else "Is there anything else that would help me understand your situation?"
        )
        return clean or fallback_more, is_done
    except Exception:
        if language == "es":
            return "¿Puedes contarme cuándo empezó y qué tan intenso es?", False
        return "Can you tell me more about when this started and how severe it is?", False


# ─── Provider implementations ───────────────────────────────────────────────


async def _ollama(messages: list[dict]) -> Optional[str]:
    if not settings.OLLAMA_BASE_URL:
        return None
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(
            f"{settings.OLLAMA_BASE_URL}/api/chat",
            json={"model": settings.OLLAMA_MODEL, "messages": messages, "stream": False,
                  "options": {"temperature": 0.7, "num_predict": 300}},
        )
        r.raise_for_status()
        return r.json()["message"]["content"]


_claude = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY, timeout=30.0, max_retries=1) if settings.ANTHROPIC_API_KEY else None

# USD per 1M tokens (input, output). Unknown models are priced at the top tier so the budget errs safe.
CLAUDE_PRICES = {"claude-haiku-4-5": (1, 5), "claude-sonnet-5": (2, 10), "claude-opus-5": (5, 25)}
_claude_spent: Optional[float] = None  # running total, loaded from Supabase table llm_spend


def _claude_budget_left() -> bool:
    global _claude_spent
    if _claude_spent is None:  # a failed read raises → Claude is skipped, never used unmetered
        rows = get_supabase().table("llm_spend").select("usd").eq("provider", "anthropic").execute().data
        _claude_spent = float(rows[0]["usd"]) if rows else 0.0
    return _claude_spent < settings.ANTHROPIC_BUDGET_USD


def _record_claude_spend(input_tokens: int, output_tokens: int) -> None:
    global _claude_spent
    price_in, price_out = CLAUDE_PRICES.get(settings.ANTHROPIC_MODEL, (10, 50))
    cost = (input_tokens * price_in + output_tokens * price_out) / 1_000_000
    try:
        _claude_spent = float(get_supabase().rpc("add_llm_spend", {"p_provider": "anthropic", "p_usd": cost}).execute().data)
    except Exception:
        logger.exception("Couldn't record Claude spend; disabling Claude until restart")
        _claude_spent = float("inf")


async def _anthropic(messages: list[dict]) -> Optional[str]:
    # ponytail: check-then-call, so concurrent requests can overshoot the cap by a few calls
    # (~$0.003 each on Haiku). Set a hard spend limit in the Anthropic Console too.
    if not _claude or not _claude_budget_left():
        return None
    r = await _claude.messages.create(
        model=settings.ANTHROPIC_MODEL,
        max_tokens=600,  # replies are a few sentences; the visit-prep JSON is the longest (~300 tokens)
        system=next((m["content"] for m in messages if m["role"] == "system"), ""),
        messages=[m for m in messages if m["role"] != "system"],
    )
    _record_claude_spend(r.usage.input_tokens, r.usage.output_tokens)
    if r.stop_reason == "refusal":
        return None  # declined → next provider
    return "".join(b.text for b in r.content if b.type == "text")


async def _groq(messages: list[dict]) -> Optional[str]:
    if not settings.GROQ_API_KEY:
        return None
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
            json={"model": settings.GROQ_MODEL, "messages": messages, "max_tokens": 300, "temperature": 0.7},
        )
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]


async def _google_ai(messages: list[dict]) -> Optional[str]:
    if not settings.GOOGLE_AI_KEY:
        return None
    sys_msg = next((m["content"] for m in messages if m["role"] == "system"), "")
    contents = [{"role": "user" if m["role"] == "user" else "model", "parts": [{"text": m["content"]}]}
                for m in messages if m["role"] != "system"]
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GOOGLE_AI_MODEL}:generateContent",
            params={"key": settings.GOOGLE_AI_KEY},
            json={"system_instruction": {"parts": [{"text": sys_msg}]}, "contents": contents,
                  "generationConfig": {"maxOutputTokens": 1024, "temperature": 0.7}},  # thinking counts toward this
        )
        r.raise_for_status()
        parts = r.json()["candidates"][0]["content"].get("parts", [])
        return "".join(p.get("text", "") for p in parts if not p.get("thought"))
