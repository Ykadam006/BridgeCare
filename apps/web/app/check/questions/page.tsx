"use client";

import { Suspense, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Send, ArrowLeft, Heart, AlertTriangle, RotateCcw } from "lucide-react";
import { useCheckSession } from "@/hooks/useCheckSession";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { SafetyBanner } from "@/components/shared/SafetyBanner";
import { triageApi } from "@/lib/api";
import { getQuestionsUiStrings, isRtlLang } from "@/lib/check-i18n";
import { cn } from "@/lib/utils";
import { Nav } from "@/components/shared/Nav";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

const CRITICAL_KEYWORDS = [
  "chest pain", "can't breathe", "cannot breathe",
  "throat closing", "suicidal", "overdose",
  "unconscious", "not breathing", "stroke",
];

function hasCriticalKeyword(text: string): boolean {
  return CRITICAL_KEYWORDS.some((k) => text.toLowerCase().includes(k));
}

function QuestionsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symptomHint = searchParams.get("symptom");
  const { profile, messages: savedMsgs, session_id, addMessage, setSessionId, setCaseId, setStep, setTriageResult } = useCheckSession();

  const [messages, setMessages] = useState<Message[]>(
    savedMsgs.length
      ? savedMsgs.map((m, i) => ({ id: String(i), role: m.role, content: m.content }))
      : []
  );
  const [input, setInput] = useState(symptomHint || "");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCritical, setIsCritical] = useState(false);
  const [starting, setStarting] = useState(!session_id);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const triageProfile = useMemo(
    () => ({
      age_range: profile.age_range,
      zip: profile.zip,
      insurance_status: profile.insurance_status,
      language: profile.language,
      mode: profile.mode,
    }),
    [profile.age_range, profile.zip, profile.insurance_status, profile.language, profile.mode]
  );

  const ui = useMemo(() => getQuestionsUiStrings(profile.language), [profile.language]);
  const textDir = isRtlLang(profile.language) ? "rtl" : "ltr";

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Start session if needed
  useEffect(() => {
    if (!session_id && starting) {
      (async () => {
        try {
          const data = await triageApi.start({
            profile: {
              age_range: profile.age_range,
              zip: profile.zip,
              insurance_status: profile.insurance_status,
              language: profile.language,
              mode: profile.mode,
            },
          });
          setSessionId(data.session_id);
          const firstMsg: Message = {
            id: "welcome",
            role: "assistant",
            content: data.first_question,
          };
          setMessages([firstMsg]);
          addMessage({ role: "assistant", content: firstMsg.content });
        } catch {
          setMessages([{
            id: "fallback",
            role: "assistant",
            content: getQuestionsUiStrings(profile.language).fallbackWelcome,
          }]);
        } finally {
          setStarting(false);
          inputRef.current?.focus();
        }
      })();
    } else {
      setStarting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;
    const trimmed = text.trim();

    // Check for critical keywords — surface emergency warning immediately
    if (hasCriticalKeyword(trimmed)) {
      setIsCritical(true);
    }

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((m) => [...m, userMsg]);
    addMessage({ role: "user", content: trimmed });
    setInput("");
    setLoading(true);

    const allMessages = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    try {
      const currentSessionId = session_id || "temp";
      const data = await triageApi.followup({
        session_id: currentSessionId,
        messages: allMessages,
        profile: triageProfile,
      });

      const aiMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: data.reply };
      setMessages((m) => [...m, aiMsg]);
      addMessage({ role: "assistant", content: aiMsg.content });
      setProgress(data.progress || 0);

      // If done, finalize
      if (data.done) {
        setLoading(true);
        try {
          const result = await triageApi.finalize({
            session_id: currentSessionId,
            messages: [...allMessages, { role: "assistant", content: data.reply }],
            profile: triageProfile,
          });
          setCaseId(result.case_id);
          setTriageResult(result.triage);
          setStep("done");
          router.push(`/results/${result.case_id}`);
        } catch {
          setMessages((m) => [...m, {
            id: crypto.randomUUID(),
            role: "assistant",
            content: getQuestionsUiStrings(profile.language).finalizeWait,
          }]);
          setTimeout(() => router.push("/results/demo"), 1500);
        }
      }
    } catch {
      setMessages((m) => [...m, {
        id: crypto.randomUUID(),
        role: "assistant",
        content: getQuestionsUiStrings(profile.language).errorConnect,
        isError: true,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [loading, messages, session_id, triageProfile, profile.language, addMessage, setCaseId, setStep, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const userTurns = messages.filter((m) => m.role === "user").length;

  return (
    <div className="min-h-screen bg-[#f3fbfd] flex flex-col" dir={textDir}>
      <Nav />

      {/* Sub-header */}
      <div className="bg-white border-b border-[#e5e7eb] px-6 py-3">
        <div className="mx-auto max-w-2xl flex items-center gap-4">
          <Link
            href="/check"
            className="btn-ghost !h-8 !px-3 gap-1.5 text-xs"
            aria-label={ui.backAria}
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            {ui.backToSetup}
          </Link>
          <div className="flex-1">
            <ProgressBar
              current={Math.min(userTurns, 5)}
              total={5}
              label={ui.progressLabel}
            />
          </div>
          <span className="text-xs text-[#6b7280]" aria-live="polite">
            {ui.questionsLeft(Math.max(0, 5 - userTurns))}
          </span>
        </div>
      </div>

      {/* Chat area */}
      <main id="main-content" className="flex-1 flex flex-col mx-auto w-full max-w-2xl px-6 py-6" tabIndex={-1} aria-label="Health check-in conversation">

        {/* Emergency warning */}
        <AnimatePresence>
          {isCritical && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <div role="alert" aria-live="assertive" className="rounded-[20px] bg-red-50 border-2 border-red-300 p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-bold text-red-900 text-sm">{ui.emergencyTitle}</p>
                  <p className="text-sm text-red-700 mt-0.5">
                    {ui.emergencyBody.split("911").map((part, i, arr) =>
                      i < arr.length - 1 ? (
                        <span key={i}>
                          {part}
                          <a href="tel:911" className="font-bold underline">911</a>
                        </span>
                      ) : (
                        <span key={i}>{part}</span>
                      )
                    )}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Starting skeleton */}
        {starting && (
          <div className="flex gap-3 justify-start" aria-busy="true" aria-label={ui.loadingAria}>
            <div className="w-8 h-8 rounded-full skeleton flex-shrink-0" />
            <div className="skeleton h-16 w-64 rounded-[20px]" />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto" role="log" aria-label="Conversation" aria-live="polite">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                {msg.role === "assistant" && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #00b4d8, #03045e)" }}
                    aria-hidden="true"
                  >
                    <Heart className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bubble-user"
                      : msg.isError
                      ? "rounded-[20px] rounded-tl-[6px] bg-red-50 border border-red-200 text-red-800 px-4 py-3"
                      : "bubble-ai"
                  )}
                >
                  <ReactMarkdown className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0">
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start"
              aria-label={ui.thinkingAria}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #00b4d8, #03045e)" }}
                aria-hidden="true"
              >
                <Heart className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <div className="bubble-ai flex gap-1.5 items-center px-5 py-4">
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#90e0ef]" aria-hidden="true" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#90e0ef]" aria-hidden="true" />
                <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#90e0ef]" aria-hidden="true" />
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </main>

      {/* Input */}
      <div className="sticky bottom-0 bg-white border-t border-[#e5e7eb] px-6 pb-6 pt-4">
        <div className="mx-auto max-w-2xl">
          {/* Quick demo chips — remove before launch */}
          {messages.length <= 1 && !loading && (
            <div className="flex flex-wrap gap-2 mb-3">
              {ui.demoChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => send(chip)}
                  className="text-xs bg-[#f3fbfd] border border-[#90e0ef] text-[#03045e] rounded-full px-3 py-1.5 hover:bg-[#caf0f8] transition-colors"
                >
                  {chip.length > 40 ? chip.slice(0, 40) + "…" : chip}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative">
            <label htmlFor="symptom-input" className="sr-only">{ui.describeSr}</label>
            <textarea
              id="symptom-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={ui.inputPlaceholder}
              className={cn(
                "w-full rounded-[20px] border bg-white px-4 py-3.5 text-sm text-[#111827] placeholder-[#9ca3af]",
                "resize-none pr-14 min-h-[52px] max-h-[140px] overflow-auto leading-relaxed",
                "transition-all duration-[180ms]",
                "focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6]",
                "border-[#d1d5db] hover:border-[#00b4d8]"
              )}
              aria-label={ui.inputAria}
              onInput={(e) => {
                const t = e.currentTarget;
                t.style.height = "auto";
                t.style.height = `${Math.min(t.scrollHeight, 140)}px`;
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className={cn(
                "absolute right-3 bottom-3 w-10 h-10 rounded-[14px] flex items-center justify-center transition-all duration-[180ms]",
                input.trim() && !loading
                  ? "bg-[#0077b6] text-white hover:bg-[#03045e] active:scale-90"
                  : "bg-[#f3f4f6] text-[#6b7280]"
              )}
              aria-label={ui.sendAria}
            >
              <Send className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
            </button>
          </form>
          <SafetyBanner variant="inline" className="mt-3" />
        </div>
      </div>
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3fbfd] flex items-center justify-center"><div className="skeleton h-16 w-64 rounded-[20px]" /></div>}>
      <QuestionsInner />
    </Suspense>
  );
}
