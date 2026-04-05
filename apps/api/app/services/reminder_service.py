"""
Reminder service — creates follow-up reminders in Supabase.
"""

import uuid
from datetime import datetime, timedelta
from typing import Optional
from supabase import Client


def schedule_reminder(
    supabase: Client,
    user_id: str,
    case_id: str,
    urgency_level: str,
    chief_complaint: str,
) -> Optional[str]:
    """Create a follow-up reminder. Returns reminder_id or None."""
    days_map = {"low": 5, "medium": 3, "high": 1, "critical": None}
    days = days_map.get(urgency_level)

    if days is None:
        return None  # Critical — don't schedule, they need immediate care

    due_at = (datetime.utcnow() + timedelta(days=days)).isoformat()
    complaint_short = chief_complaint[:80] if chief_complaint else "your recent symptoms"
    message = f"How are you feeling? You checked in {days} day{'s' if days > 1 else ''} ago about: {complaint_short}"

    reminder_id = str(uuid.uuid4())
    try:
        supabase.table("reminders").insert({
            "id": reminder_id,
            "user_id": user_id,
            "case_id": case_id,
            "message": message,
            "due_at": due_at,
            "done": False,
        }).execute()
        return reminder_id
    except Exception as e:
        print(f"[Reminder] Failed to create: {e}")
        return None
