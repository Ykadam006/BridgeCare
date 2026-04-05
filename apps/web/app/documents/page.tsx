"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { FileText, Upload, Trash2, Search, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Nav } from "@/components/shared/Nav";
import { SafetyBanner } from "@/components/shared/SafetyBanner";
import { documentsApi, type DocumentSource, type HealthDocument } from "@/lib/api";

/** Turns "[1][3]" markers in the answer into links to the matching source below. */
function Cited({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[\d+\])/g).map((part, i) => {
        const n = part.match(/^\[(\d+)\]$/)?.[1];
        return n ? (
          <a key={i} href={`#source-${n}`} className="font-semibold text-[#0077b6] underline" aria-label={`source ${n}`}>
            [{n}]
          </a>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        );
      })}
    </>
  );
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<HealthDocument[]>([]);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<{ answer: string; sources: DocumentSource[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => documentsApi.list().then(setDocs).catch((e) => setStatus(e.message));
  useEffect(() => {
    refresh();
  }, []);

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus(`Reading ${file.name}…`);
    try {
      const res = await documentsApi.upload(file);
      setStatus(`Added ${res.title} (${res.chunk_count} passages indexed).`);
      if (fileRef.current) fileRef.current.value = "";
      refresh();
    } catch (err) {
      setStatus((err as Error).message);
    }
    setUploading(false);
  }

  async function remove(id: string) {
    if (confirmId !== id) return setConfirmId(id);
    setConfirmId(null);
    try {
      await documentsApi.remove(id);
      setStatus("Document deleted.");
      refresh();
    } catch (err) {
      setStatus((err as Error).message);
    }
  }

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    if (question.trim().length < 3) return;
    setAsking(true);
    setAnswer(null);
    try {
      setAnswer(await documentsApi.ask(question.trim()));
    } catch (err) {
      setAnswer({ answer: (err as Error).message, sources: [] });
    }
    setAsking(false);
  }

  return (
    <div className="min-h-screen bg-[#f3fbfd]">
      <Nav />
      <main id="main-content" className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6" tabIndex={-1}>
        <h1 className="text-headline">Your health documents</h1>
        <p className="text-calm mt-1">
          Upload lab results, discharge notes or visit summaries, then ask questions. Answers cite the exact page they
          came from. Only you can see your documents.
        </p>

        <section className="surface mt-8 p-6" aria-labelledby="upload-heading">
          <h2 id="upload-heading" className="font-heading text-base font-bold text-[#03045e]">
            Add a document
          </h2>
          <form onSubmit={upload} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="doc-file" className="sr-only">
              Choose a PDF, .txt or .md file (up to 10 MB)
            </label>
            <input
              id="doc-file"
              ref={fileRef}
              type="file"
              accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
              className="text-sm text-[#374151] file:mr-3 file:rounded-full file:border-0 file:bg-[#90e0ef]/25 file:px-4 file:py-2 file:font-semibold file:text-[#03045e]"
              required
            />
            <button type="submit" className="btn-primary btn-sm sm:ml-auto" disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
              {uploading ? "Indexing…" : "Upload"}
            </button>
          </form>
          <p className="mt-2 text-xs text-[#6b7280]">PDF, .txt or .md up to 10 MB. Scanned images aren&apos;t supported yet.</p>
          <p role="status" aria-live="polite" className="mt-3 text-sm text-[#0077b6]">
            {status}
          </p>

          {docs.length > 0 && (
            <ul className="mt-4 divide-y divide-[#e5e7eb]" aria-label="Your documents">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-3">
                  <FileText className="h-5 w-5 shrink-0 text-[#0077b6]" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#111827]">{d.title}</p>
                    <p className="text-xs text-[#6b7280]">
                      {d.page_count ? `${d.page_count} pages · ` : ""}
                      {d.chunk_count} passages · {format(parseISO(d.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(d.id)}
                    onBlur={() => setConfirmId(null)}
                    className="btn-ghost btn-sm text-red-700"
                    aria-label={confirmId === d.id ? `Confirm deleting ${d.title}` : `Delete ${d.title}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    {confirmId === d.id ? "Confirm" : "Delete"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="surface mt-6 p-6" aria-labelledby="ask-heading">
          <h2 id="ask-heading" className="font-heading text-base font-bold text-[#03045e]">
            Ask about your documents
          </h2>
          <form onSubmit={ask} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="doc-question" className="sr-only">
              Your question
            </label>
            <input
              id="doc-question"
              className="input"
              placeholder="e.g. What was my last A1c and is it in range?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={1000}
            />
            <button type="submit" className="btn-primary shrink-0" disabled={asking || docs.length === 0}>
              {asking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Search className="h-4 w-4" aria-hidden />}
              Ask
            </button>
          </form>
          {docs.length === 0 && <p className="mt-2 text-xs text-[#6b7280]">Upload a document first.</p>}

          <div aria-live="polite">
            {answer && (
              <div className="mt-6">
                <p className="text-body whitespace-pre-line">
                  <Cited text={answer.answer} />
                </p>
                {answer.sources.length > 0 && (
                  <ol className="mt-5 space-y-3" aria-label="Sources">
                    {answer.sources.map((s) => (
                      <li key={s.n} id={`source-${s.n}`} className="surface-tinted p-4 text-sm scroll-mt-24">
                        <p className="font-semibold text-[#03045e]">
                          [{s.n}] {s.title}
                          {s.page ? `, page ${s.page}` : ""}
                        </p>
                        <p className="mt-1 text-[#374151]">{s.excerpt}…</p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>
        </section>

        <SafetyBanner variant="inline" className="mt-8" />
      </main>
    </div>
  );
}
