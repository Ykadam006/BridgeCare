from functools import lru_cache
from typing import Optional

from fastapi import Header, HTTPException
from supabase import Client, create_client

from app.core.config import settings


@lru_cache
def get_supabase() -> Client:
    """Service-role client: bypasses RLS, so every route must check ownership itself."""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def optional_user_id(authorization: Optional[str] = Header(None)) -> Optional[str]:
    """User id from `Authorization: Bearer <supabase access token>`; None for guests.

    Never trust a user_id sent in a request body — it's whatever the caller typed.
    """
    if not authorization:
        return None
    token = authorization.split(" ", 1)[-1].strip()
    try:
        res = get_supabase().auth.get_user(token)
    except Exception:
        res = None
    if not res or not res.user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return res.user.id


def require_user_id(authorization: Optional[str] = Header(None)) -> str:
    """Like optional_user_id, but guests get 401 (for health documents)."""
    user_id = optional_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Sign in to use your documents")
    return user_id
