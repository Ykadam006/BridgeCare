"use client";

import { use, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, CheckCircle2, TrendingUp, TrendingDown, Minus, Bell, ArrowRight } from "lucide-react";
import { SafetyBanner } from "@/components/shared/SafetyBanner";
import { Nav } from "@/components/shared/Nav";
import { cn } from "@/lib/utils";
import { followupApi } from "@/lib/api";

const FEELING_OPTIONS = [
  { value: "better", label: "Better", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50 border-green-200", activeBg: "bg-green-100 border-green-400" },
  { value: "same", label: "About the same", icon: Minus, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", activeBg: "bg-amber-100 border-amber-400" },
  { value: "worse", label: "Worse", icon: TrendingDown, color: "text-red-600", bg: "bg-red-50 border-red-200", activeBg: "bg-red-100 border-red-400" },
];

export default function FollowupPage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = use(params);
  const [gotCare, setGotCare] = useState<boolean | null>(null);
  const [feeling, setFeeling] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!feeling) return;
    setLoading(true);
    try {
      await followupApi.checkin({ case_id: caseId, got_care: gotCare, feeling, notes });
    } catch { /* non-fatal */ }
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#f3fbfd]">
      <Nav />
      <main id="main-content" className="mx-auto max-w-lg px-6 py-10" tabIndex={-1}>

        <div className="flex items-center gap-3 mb-8">
          <Link href={`/results/${caseId}`} className="btn-ghost !h-8 !px-3 gap-1.5 text-xs">
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            Back
          </Link>
          <div>
            <h1 className="text-headline text-[#03045e]">How are you doing?</h1>
            <p className="text-sm text-[#6b7280]">A quick check-in — takes 30 seconds</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* Did you get care? */}
              <div className="surface p-6">
                <fieldset>
                  <legend className="block font-heading font-bold text-[#03045e] mb-4 text-base">
                    Did you get care for this?
                  </legend>
                  <div className="grid grid-cols-2 gap-3">
                    {[{ value: true, label: "Yes, I did" }, { value: false, label: "Not yet" }].map(({ value, label }) => (
                      <button
                        key={String(value)}
                        type="button"
                        onClick={() => setGotCare(value)}
                        className={cn(
                          "py-3 px-4 rounded-[16px] border text-sm font-semibold transition duration-[180ms]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077b6]",
                          gotCare === value
                            ? "bg-[#0077b6] text-white border-[#0077b6]"
                            : "bg-white text-[#374151] border-[#d1d5db] hover:border-[#00b4d8]"
                        )}
                        aria-pressed={gotCare === value}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>

              {/* How are you feeling */}
              <div className="surface p-6">
                <fieldset>
                  <legend className="block font-heading font-bold text-[#03045e] mb-4 text-base">
                    How are you feeling compared to before?
                  </legend>
                  <div className="space-y-3">
                    {FEELING_OPTIONS.map(({ value, label, icon: Icon, color, bg, activeBg }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFeeling(value)}
                        className={cn(
                          "w-full flex items-center gap-3 py-3.5 px-4 rounded-[16px] border text-left transition duration-[180ms]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077b6]",
                          feeling === value ? activeBg : bg + " hover:brightness-95"
                        )}
                        aria-pressed={feeling === value}
                      >
                        <Icon className={cn("w-5 h-5 flex-shrink-0", color)} aria-hidden="true" />
                        <span className={cn("font-semibold text-sm", feeling === value ? color : "text-[#374151]")}>
                          {label}
                        </span>
                        {feeling === value && (
                          <CheckCircle2 className={cn("w-4 h-4 ml-auto", color)} aria-hidden="true" />
                        )}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </div>

              {/* Notes */}
              <div className="surface p-6">
                <label htmlFor="followup-notes" className="block font-heading font-bold text-[#03045e] mb-3 text-base">
                  Anything else? <span className="text-[#6b7280] font-normal text-sm">(optional)</span>
                </label>
                <textarea
                  id="followup-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 'I got antibiotics', 'Still have the headache', 'Feeling much better'"
                  rows={3}
                  className={cn(
                    "w-full rounded-[20px] border border-[#d1d5db] bg-white px-4 py-3.5 text-base text-[#111827]",
                    "placeholder-[#9ca3af] resize-none transition duration-[180ms]",
                    "focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6]",
                    "hover:border-[#00b4d8]"
                  )}
                />
              </div>

              <button
                type="submit"
                disabled={!feeling || loading}
                className="btn-primary w-full !h-12 text-base"
              >
                {loading ? "Saving…" : "Submit check-in"}
                {!loading && <ArrowRight className="w-4 h-4" aria-hidden="true" />}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="surface p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-16 h-16 rounded-full bg-[#f3fbfd] border-2 border-[#90e0ef] flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-[#0077b6]" aria-hidden="true" />
              </motion.div>

              <h2 className="font-heading font-bold text-xl text-[#03045e] mb-2">
                {feeling === "better" ? "Great — glad you're feeling better!" : feeling === "worse" ? "Thanks for letting us know." : "Check-in saved."}
              </h2>

              <p className="text-sm text-[#6b7280] mb-6 leading-relaxed">
                {feeling === "worse"
                  ? "If symptoms are getting worse, please consider seeing a doctor today. Don't wait."
                  : "We'll send a reminder in a few days if needed."}
              </p>

              {feeling === "worse" && (
                <Link href={`/options/${caseId}`} className="btn-primary inline-flex mb-4">
                  Find care now
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              )}

              <div className="flex gap-3 justify-center">
                <Link href="/dashboard" className="btn-secondary !h-10 !px-5 !text-sm gap-1.5">
                  <Bell className="w-3.5 h-3.5" aria-hidden="true" />
                  Go to dashboard
                </Link>
                <Link href="/check" className="btn-ghost !h-10 !text-sm">
                  New check-in
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <SafetyBanner variant="inline" className="mt-8" />
      </main>
    </div>
  );
}
