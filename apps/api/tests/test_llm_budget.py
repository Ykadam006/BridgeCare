"""Run: .venv/bin/python -m tests.test_llm_budget   (no network: Claude + Supabase are stubbed)"""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from app.services import llm_service as L

MSGS = [{"role": "system", "content": "s"}, {"role": "user", "content": "hi"}]


def fake_claude():
    reply = SimpleNamespace(stop_reason="end_turn", content=[SimpleNamespace(type="text", text="ok")],
                            usage=SimpleNamespace(input_tokens=1_000, output_tokens=200))
    return SimpleNamespace(messages=SimpleNamespace(create=AsyncMock(return_value=reply)))


def db(spent, rpc_fails=False):
    sb = MagicMock()
    sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{"usd": spent}]
    if rpc_fails:
        sb.rpc.side_effect = RuntimeError("db down")
    else:
        sb.rpc.side_effect = lambda name, args: MagicMock(execute=lambda: SimpleNamespace(data=spent + args["p_usd"]))
    return sb


def run(spent, budget=100.0, rpc_fails=False):
    claude, sb = fake_claude(), db(spent, rpc_fails)
    with patch.object(L, "_claude", claude), patch.object(L, "_claude_spent", None), \
         patch.object(L, "get_supabase", return_value=sb), \
         patch.object(L.settings, "ANTHROPIC_BUDGET_USD", budget), \
         patch.object(L.settings, "ANTHROPIC_MODEL", "claude-haiku-4-5"):
        out = asyncio.run(L._anthropic(MSGS))
        return out, claude.messages.create.await_count, sb, L._claude_spent


def test_llm_budget():
    out, calls, sb, spent = run(spent=12.0)
    assert out == "ok" and calls == 1
    # Haiku: 1000 in * $1/M + 200 out * $5/M = $0.002
    assert abs(sb.rpc.call_args.args[1]["p_usd"] - 0.002) < 1e-12
    assert abs(spent - 12.002) < 1e-9

    out, calls, _, _ = run(spent=100.0)  # at the cap: Claude never called
    assert out is None and calls == 0

    out, calls, _, spent = run(spent=1.0, rpc_fails=True)  # can't record → stop using Claude
    assert out == "ok" and spent == float("inf")

    claude = fake_claude()  # can't read the ledger → never call unmetered
    sb = MagicMock()
    sb.table.side_effect = RuntimeError("db down")
    with patch.object(L, "_claude", claude), patch.object(L, "_claude_spent", None), \
         patch.object(L, "get_supabase", return_value=sb):
        try:
            asyncio.run(L._anthropic(MSGS))
            raise AssertionError("expected the ledger read to fail")
        except RuntimeError:
            pass
    assert claude.messages.create.await_count == 0


if __name__ == "__main__":
    test_llm_budget()
    print("ok")
