"""Run: .venv/bin/python -m tests.test_api_auth   (no network: Supabase + LLM are stubbed)"""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient

from app.core import auth
from app.main import app
from app.routes import triage

GUEST_CASE = "10000000-0000-0000-0000-000000000001"
A_CASE = "10000000-0000-0000-0000-000000000002"
CASES = {GUEST_CASE: {"id": GUEST_CASE, "user_id": None}, A_CASE: {"id": A_CASE, "user_id": "user-a"}}
INSERTS = []


def fake_supabase():
    sb = MagicMock()
    # Tokens are "tok-<user>"; anything else is rejected like an expired session.
    sb.auth.get_user.side_effect = lambda t: SimpleNamespace(user=SimpleNamespace(id=t[4:])) if t.startswith("tok-") else None

    def table(name):
        q = MagicMock()
        q.insert.side_effect = lambda row: INSERTS.append((name, row)) or MagicMock()
        q.select.return_value.eq.side_effect = lambda col, val: MagicMock(
            limit=lambda n: MagicMock(execute=lambda: SimpleNamespace(data=[CASES[val]] if val in CASES else []))
        )
        return q
    sb.table.side_effect = table
    return sb


def test_api_auth():
    sb = fake_supabase()
    c = TestClient(app)
    hdr = lambda user: {"Authorization": f"Bearer tok-{user}"}
    with patch.object(auth, "get_supabase", return_value=sb), patch.object(triage, "get_supabase", return_value=sb):
        assert c.get(f"/triage/case/{GUEST_CASE}").status_code == 200  # guest link works
        assert c.get(f"/triage/case/{A_CASE}").status_code == 404  # account case hidden from guests
        assert c.get(f"/triage/case/{A_CASE}", headers=hdr("user-b")).status_code == 404  # ...and other users
        assert c.get(f"/triage/case/{A_CASE}", headers=hdr("user-a")).status_code == 200
        assert c.get(f"/triage/case/{A_CASE}", headers={"Authorization": "Bearer junk"}).status_code == 401
        assert c.get("/triage/case/not-a-uuid").status_code == 404

        # finalize: user comes from the token; a user_id smuggled into the body is ignored
        with patch.object(triage, "chat", AsyncMock(side_effect=RuntimeError)), \
             patch.object(triage, "explain_triage", AsyncMock(return_value="ok")):
            body = {"session_id": "s", "user_id": "victim", "messages": [{"role": "user", "content": "rash"}]}
            c.post("/triage/finalize", json=body, headers=hdr("user-a"))
            cases = [row for table, row in INSERTS if table == "cases"]
            assert cases and cases[0]["user_id"] == "user-a", cases

            # all user turns are scored, not just the first three
            msgs = [{"role": "user", "content": t} for t in ["tired", "sore throat", "headache", "also chest pain"]]
            r = c.post("/triage/finalize", json={"session_id": "s", "messages": msgs}).json()
            assert r["triage"]["urgency_level"] == "critical", r["triage"]["urgency_level"]


if __name__ == "__main__":
    test_api_auth()
    print("ok")
