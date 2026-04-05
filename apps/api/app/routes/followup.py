import logging
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.core.auth import get_supabase, optional_user_id

router = APIRouter()
logger = logging.getLogger("bridgecare.followup")

SUMMARIES = {
    "better": "Great to hear you're feeling better!",
    "same": "Thanks for checking in. If no improvement in another 2-3 days, consider seeing a doctor.",
    "worse": "Please consider seeing a doctor today — don't wait if symptoms are worsening.",
}


class CheckinRequest(BaseModel):
    case_id: str
    got_care: Optional[bool] = None
    feeling: str  # "better" | "same" | "worse"
    notes: Optional[str] = None


@router.post("/followup/checkin")
async def followup_checkin(req: CheckinRequest, user_id: Optional[str] = Depends(optional_user_id)):
    summary = SUMMARIES.get(req.feeling, "Thanks for checking in.")
    if not user_id:
        return {"ok": True, "saved": False, "summary": summary}  # guests: nothing to attach it to

    saved = False
    try:
        supabase = get_supabase()
        owned = supabase.table("cases").select("id").eq("id", req.case_id).eq("user_id", user_id).execute().data
        if owned:
            supabase.table("followups").insert({
                "case_id": req.case_id,
                "user_id": user_id,
                "status": "completed",
                "got_care": req.got_care,
                "feeling": req.feeling,
                "notes": req.notes,
            }).execute()
            supabase.table("reminders").update({"done": True}).eq("case_id", req.case_id).eq("user_id", user_id).execute()
            saved = True
    except Exception:
        logger.exception("Follow-up save failed")

    return {"ok": True, "saved": saved, "summary": summary}
