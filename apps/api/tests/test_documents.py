"""Run: .venv/bin/python -m tests.test_documents   (loads the local embedding model; no network after first download)"""

from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi.testclient import TestClient

from app.core import auth
from app.main import app
from app.routes import documents as routes
from app.services.documents import CHUNK_WORDS, chunk_pages, embed, extract_pages


def tiny_pdf(pages: list[str]) -> bytes:
    """Minimal valid PDF, one line of Helvetica text per page (enough for pypdf to extract)."""
    n = len(pages)
    objs = ["<< /Type /Catalog /Pages 2 0 R >>",
            f"<< /Type /Pages /Kids [{' '.join(f'{3 + 2 * i} 0 R' for i in range(n))}] /Count {n} >>"]
    for i, text in enumerate(pages):
        stream = f"BT /F1 11 Tf 40 750 Td ({text}) Tj ET"
        objs.append(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents {4 + 2 * i} 0 R "
                    f"/Resources << /Font << /F1 {3 + 2 * n} 0 R >> >> >>")
        objs.append(f"<< /Length {len(stream)} >>\nstream\n{stream}\nendstream")
    objs.append("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    out, offsets = b"%PDF-1.4\n", []
    for i, o in enumerate(objs, 1):
        offsets.append(len(out))
        out += f"{i} 0 obj\n{o}\nendobj\n".encode()
    xref = len(out)
    out += f"xref\n0 {len(objs) + 1}\n0000000000 65535 f \n".encode()
    out += "".join(f"{o:010d} 00000 n \n" for o in offsets).encode()
    out += f"trailer << /Size {len(objs) + 1} /Root 1 0 R >>\nstartxref\n{xref}\n%%EOF".encode()
    return out


def test_documents():
    pdf = tiny_pdf(["Hemoglobin A1c 7.9 percent, above the diabetes target of 7.",
                    "LDL cholesterol 190 mg/dL. Start statin discussed with Dr Patel."])
    pages = extract_pages(pdf, "labs.pdf")
    assert [p for p, _ in pages] == [1, 2] and "A1c" in pages[0][1], pages

    chunks = chunk_pages(pages)
    assert [c["page"] for c in chunks] == [1, 2]  # chunks never cross pages, so citations name one page

    long = chunk_pages([(None, " ".join(f"w{i}" for i in range(400)))])
    assert all(len(c["content"].split()) <= CHUNK_WORDS for c in long)
    assert long[-1]["content"].endswith("w399")  # nothing dropped at the end

    # Semantic search picks the right page for a question that shares no exact words with it
    q, *docs = embed(["what was my blood sugar result", chunks[0]["content"], chunks[1]["content"]])
    sim = [sum(a * b for a, b in zip(q, d)) for d in docs]
    assert sim[0] > sim[1], sim

    for bad, name in [(b"\x89PNG....", "scan.png"), (b"\xff\xfe\x00bad", "notes.txt")]:
        try:
            extract_pages(bad, name)
            raise AssertionError(f"{name} should be rejected")
        except ValueError:
            pass

    c = TestClient(app)  # guests can't touch documents
    assert c.get("/documents").status_code == 401
    assert c.post("/documents/ask", json={"question": "what was my A1c?"}).status_code == 401

    # Routes with Supabase stubbed: the user always comes from the token, never the request
    inserts, rpc_args = [], {}
    sb = MagicMock()
    sb.auth.get_user.return_value = SimpleNamespace(user=SimpleNamespace(id="user-a"))
    sb.table.side_effect = lambda name: MagicMock(insert=lambda rows: inserts.append((name, rows)) or MagicMock())

    def rpc(name, args):
        rpc_args.update(args)
        return MagicMock(execute=lambda: SimpleNamespace(data=[
            {"document_id": "d1", "title": "labs.pdf", "page": 1, "content": "Hemoglobin A1c 7.9 percent", "similarity": 0.61},
            {"document_id": "d1", "title": "labs.pdf", "page": 2, "content": "LDL cholesterol 190", "similarity": 0.04},
        ]))
    sb.rpc.side_effect = rpc
    hdr = {"Authorization": "Bearer tok"}
    with patch.object(auth, "get_supabase", return_value=sb), patch.object(routes, "get_supabase", return_value=sb), \
         patch.object(routes, "chat", AsyncMock(return_value="Your A1c was 7.9% [1].")) as chat:
        r = c.post("/documents", files={"file": ("labs.pdf", pdf, "application/pdf")}, headers=hdr)
        assert r.status_code == 200 and r.json()["chunk_count"] == 2, r.text
        doc = next(rows for name, rows in inserts if name == "documents")
        chunks = next(rows for name, rows in inserts if name == "document_chunks")
        assert doc["user_id"] == "user-a" and doc["page_count"] == 2
        assert all(ch["user_id"] == "user-a" and len(ch["embedding"]) == 384 for ch in chunks)

        r = c.post("/documents/ask", json={"question": "what was my A1c?"}, headers=hdr).json()
        assert rpc_args["p_user_id"] == "user-a"
        assert [s["page"] for s in r["sources"]] == [1]  # below the 0.10 noise floor: dropped
        prompt = chat.await_args.args[0][0]["content"]
        assert "[1] labs.pdf, page 1" in prompt and "LDL" not in prompt

        big = c.post("/documents", files={"file": ("x.txt", b"a" * (10 * 1024 * 1024 + 1), "text/plain")}, headers=hdr)
        assert big.status_code == 413


if __name__ == "__main__":
    test_documents()
    print("ok")
