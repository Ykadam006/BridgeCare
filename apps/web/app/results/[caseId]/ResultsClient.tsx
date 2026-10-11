"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Siren,
  MapPin,
  DollarSign,
  Clock,
  ArrowRight,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/FadeIn";
import { Reveal } from "@/components/motion/Reveal";
import { SafetyBanner } from "@/components/shared/SafetyBanner";
import { Nav } from "@/components/shared/Nav";
import { useCheckSession } from "@/hooks/useCheckSession";
import { triageApi } from "@/lib/api";
import type { Case } from "@/lib/case-types";
import { DEMO_CASE } from "@/lib/demo-case";
import { symptomVisualCue } from "@/lib/care-option-visuals";
import { cn } from "@/lib/utils";

/** Take the first 1–2 sentences from a block of text (for the urgency card short reason) */
function firstSentences(text: string, max = 2): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text];
  return sentences.slice(0, max).join(" ").trim();
}

const DEMO = DEMO_CASE;

const URGENCY_CONFIG = {
  low: {
    icon: CheckCircle2,
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-900",
    accent: "text-green-700",
    dot: "bg-green-500",
    badge: "bg-green-100 text-green-800",
    cta: "bg-green-700 hover:bg-green-800 text-white",
    ariaLabel: "Low urgency — self-care is likely OK",
  },
  medium: {
    icon: AlertCircle,
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    accent: "text-amber-700",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-800",
    cta: "bg-[#0077b6] hover:bg-[#03045e] text-white",
    ariaLabel: "Medium urgency — see a doctor within 1–3 days",
  },
  high: {
    icon: AlertTriangle,
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-900",
    accent: "text-orange-700",
    dot: "bg-orange-500",
    badge: "bg-orange-100 text-orange-800",
    cta: "bg-orange-700 hover:bg-orange-800 text-white",
    ariaLabel: "High urgency — seek urgent care today",
  },
  critical: {
    icon: Siren,
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-900",
    accent: "text-red-700",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-900",
    cta: "bg-red-600 hover:bg-red-700 text-white",
    ariaLabel: "Critical — seek emergency care immediately",
  },
};

export default function ResultsClient({ caseId }: { caseId: string }) {
  const { case_id: storedCaseId, triageResult } = useCheckSession();

  const fromZustand: Case | null =
    storedCaseId === caseId && triageResult
      ? {
          id: caseId,
          chief_complaint: triageResult.chief_complaint,
          urgency_level: triageResult.urgency_level,
          urgency_label: triageResult.urgency_label,
          score: triageResult.score,
          explanation: triageResult.explanation,
          red_flags: triageResult.red_flags,
          care_options: triageResult.care_options,
          cost_estimate: triageResult.cost_estimate,
          follow_up_in: triageResult.follow_up_in,
          warning_signs: triageResult.warning_signs,
          visit_prep: triageResult.visit_prep,
        }
      : null;

  const [caseData, setCaseData] = useState<Case | null>(
    caseId === "demo" ? DEMO : fromZustand
  );
  const [loading, setLoading] = useState(caseData === null);

  useEffect(() => {
    if (caseData) return;
    async function load() {
      try {
        setCaseData(await triageApi.getCase(caseId));
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [caseId, caseData]);

  /* ── Loading ──────────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3fbfd]">
        <Nav />
        <div
          className="mx-auto w-full max-w-[1200px] space-y-6 px-4 py-10 sm:px-6"
          aria-busy="true"
          aria-label="Loading your result"
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton rounded-3xl" style={{ height: i === 1 ? 240 : 180 }} />
          ))}
        </div>
      </div>
    );
  }

  /* ── Not found ────────────────────────────────────────────────────────────── */
  if (!caseData) {
    return (
      <div className="min-h-screen bg-[#f3fbfd]">
        <Nav />
        <div className="flex min-h-[60vh] items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#90e0ef]/20">
              <AlertCircle className="h-10 w-10 text-[#0077b6]" aria-hidden="true" />
            </div>
            <h1 className="mb-3 font-heading text-2xl font-bold text-[#03045e] sm:text-3xl">Result not found</h1>
            <p className="mb-8 text-base text-[#6b7280]">This check-in may have expired or doesn&apos;t exist.</p>
            <Link href="/check" className="btn-primary inline-flex !h-12 !px-8 !text-base">
              Start a new check
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cfg = URGENCY_CONFIG[caseData.urgency_level] ?? URGENCY_CONFIG.medium;
  const UrgencyIcon = cfg.icon;
  const isCritical = caseData.urgency_level === "critical";
  const shortReason = firstSentences(caseData.explanation, 2);
  const cue = symptomVisualCue(caseData.chief_complaint);

  const whyOptions = caseData.care_options.filter((o) => o.why_this_fits).slice(0, 3);
  const nextOptions = caseData.care_options.slice(0, 3);

  const pageShell = "mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:py-12";

  /* ── Render ───────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3fbfd] via-white to-[#f3fbfd]">
      <Nav />
      <main id="main-content" className={`${pageShell} space-y-8 lg:space-y-10`} tabIndex={-1}>
        {caseId === "demo" && (
          <FadeIn>
            <div className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#03045e] to-[#03045e] px-6 py-4 text-white shadow-lg sm:flex-row sm:items-center">
              <div>
                <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[#90e0ef]">Demo result</div>
                <div className="text-base font-medium opacity-95">
                  Sample: student · dizziness + chest tightness · 3 days
                </div>
              </div>
              <Link
                href="/check"
                className="flex-shrink-0 rounded-full bg-white/20 px-5 py-2.5 text-sm font-bold transition-colors hover:bg-white/30"
              >
                Try your own check →
              </Link>
            </div>
          </FadeIn>
        )}

        <Reveal>
          <div
            className={cn(
              "overflow-hidden rounded-3xl border-2 border-[#90e0ef]/35 bg-gradient-to-br p-6 shadow-card sm:p-8 lg:p-10",
              cue.tint
            )}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
              <div className="flex min-w-0 flex-1 items-start gap-5">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-card sm:h-20 sm:w-20">
                  <cue.icon className="h-8 w-8 text-[#0077b6] sm:h-10 sm:w-10" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#0077b6]">Your check-in</p>
                  <p className="mt-2 text-xl font-semibold leading-snug text-[#03045e] sm:text-2xl lg:text-3xl">
                    {caseData.chief_complaint}
                  </p>
                  <p className="mt-3 text-base text-[#374151] sm:text-lg">
                    Here’s how BridgeCare read your situation — always double-check with a clinician.
                  </p>
                </div>
              </div>
              <div className="flex flex-shrink-0 flex-wrap items-center gap-3 rounded-2xl border border-[#90e0ef]/30 bg-white/75 px-5 py-4 text-sm text-[#374151] backdrop-blur-sm">
                <Sparkles className="h-6 w-6 text-[#0077b6]" aria-hidden />
                <span className="max-w-xs font-medium">Results update when you run a new check with different symptoms.</span>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-12 xl:items-start xl:gap-10">
          <div className="min-w-0 xl:col-span-5 xl:sticky xl:top-24 xl:self-start">
            <FadeIn>
              <section
                className={cn(
                  "rounded-3xl border-2 p-6 shadow-lg sm:p-8 lg:p-10",
                  cfg.bg,
                  cfg.border
                )}
                aria-label={cfg.ariaLabel}
              >
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl sm:h-16 sm:w-16",
                      isCritical ? "bg-red-100" : "bg-white/80 shadow-sm"
                    )}
                  >
                    <UrgencyIcon className={cn("h-8 w-8 sm:h-9 sm:w-9", cfg.accent)} aria-hidden="true" />
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide",
                      cfg.badge
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", cfg.dot)} aria-hidden="true" />
                    {cfg.ariaLabel.split("—")[0].trim()}
                  </span>
                </div>

                <p className={cn("mb-2 text-sm font-semibold sm:text-base", cfg.accent)}>Recommendation</p>
                <h1 className={cn("font-heading text-3xl font-extrabold leading-tight sm:text-4xl", cfg.text)}>
                  {caseData.urgency_label}
                </h1>
                <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", cfg.text, "opacity-90")}>
                  {shortReason}
                </p>

                <div className="mt-8">
                  <div className={cn("mb-2 flex justify-between text-sm font-semibold sm:text-base", cfg.text)}>
                    <span className={cfg.accent}>Urgency score</span>
                    <span>
                      {caseData.score} / 100
                    </span>
                  </div>
                  <div
                    className="progress-track h-2.5"
                    role="meter"
                    aria-valuenow={caseData.score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Urgency score: ${caseData.score} out of 100`}
                  >
                    <div className="progress-fill h-full" style={{ width: `${caseData.score}%` }} aria-hidden="true" />
                  </div>
                </div>

                <div className="mt-8">
                  {isCritical ? (
                    <a
                      href="tel:911"
                      className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 py-4 text-lg font-bold text-white transition hover:bg-red-700"
                      aria-label="Call 911 — this is an emergency"
                    >
                      <Siren className="h-6 w-6" aria-hidden="true" />
                      Call 911 — Emergency
                    </a>
                  ) : (
                    <Link
                      href={`/options/${caseId}`}
                      className={cn(
                        "flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold shadow-md transition hover:-translate-y-0.5 hover:shadow-lg",
                        cfg.cta
                      )}
                    >
                      See your care options
                      <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              </section>
            </FadeIn>
          </div>

          <div className="min-w-0 space-y-8 xl:col-span-7">
            <StaggerContainer className="grid gap-6 lg:grid-cols-3 xl:grid-cols-1">
              <StaggerItem liftOnHover>
                <section className="surface h-full rounded-3xl p-6 sm:p-7" aria-labelledby="why-title">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#90e0ef]/25">
                      <CheckCircle2 className="h-6 w-6 text-[#0077b6]" aria-hidden="true" />
                    </div>
                    <h2 id="why-title" className="font-heading text-lg font-bold text-[#03045e]">
                      Why this route
                    </h2>
                  </div>
                  {whyOptions.length > 0 ? (
                    <ul className="space-y-3" role="list">
                      {whyOptions.map((o, i) => (
                        <li
                          key={`why-${o.rank ?? i}-${o.type}-${i}`}
                          className="flex gap-3 text-base leading-relaxed text-[#374151]"
                        >
                          <span
                            className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#00b4d8]"
                            aria-hidden="true"
                          />
                          {o.why_this_fits}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-base leading-relaxed text-[#374151]">{caseData.explanation}</p>
                  )}
                </section>
              </StaggerItem>

              <StaggerItem liftOnHover>
                <section className="surface h-full rounded-3xl p-6 sm:p-7" aria-labelledby="watch-title">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50">
                      <AlertTriangle className="h-6 w-6 text-amber-600" aria-hidden="true" />
                    </div>
                    <h2 id="watch-title" className="font-heading text-lg font-bold text-[#03045e]">
                      Go to ER if
                    </h2>
                  </div>
                  {caseData.warning_signs && caseData.warning_signs.length > 0 ? (
                    <ul className="space-y-3" role="list">
                      {caseData.warning_signs.slice(0, 5).map((sign, i) => (
                        <li key={`warn-${i}`} className="flex gap-3 text-base leading-relaxed text-[#374151]">
                          <span
                            className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-amber-400"
                            aria-hidden="true"
                          />
                          {sign}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-base text-[#6b7280]">
                      No specific warning signs listed — still seek care if things get worse fast.
                    </p>
                  )}
                </section>
              </StaggerItem>

              <StaggerItem liftOnHover>
                <section className="surface h-full rounded-3xl p-6 sm:p-7" aria-labelledby="action-title">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-[#90e0ef]/40 bg-[#f3fbfd]">
                      <MapPin className="h-6 w-6 text-[#03045e]" aria-hidden="true" />
                    </div>
                    <h2 id="action-title" className="font-heading text-lg font-bold text-[#03045e]">
                      What to do next
                    </h2>
                  </div>
                  <ul className="mb-5 space-y-3" role="list">
                    {nextOptions.map((o, i) => {
                      const cost = o.cost_range ? ` · ${o.cost_range}` : "";
                      return (
                        <li
                          key={`next-${o.rank ?? i}-${o.type}-${i}`}
                          className="flex gap-3 text-base font-medium leading-relaxed text-[#374151]"
                        >
                          <span
                            className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#0077b6]"
                            aria-hidden="true"
                          />
                          {o.type}
                          {cost}
                        </li>
                      );
                    })}
                  </ul>
                  <Link
                    href={`/options/${caseId}`}
                    className="inline-flex items-center gap-2 text-base font-bold text-[#0077b6] hover:text-[#03045e] hover:underline"
                  >
                    Open full map and routes
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </section>
              </StaggerItem>
            </StaggerContainer>

            {caseData.visit_prep && (
              <FadeIn delay={0.08}>
                <section className="surface rounded-3xl p-6 sm:p-8" aria-labelledby="prep-title">
                  <div className="mb-6 flex items-center gap-3">
                    <Stethoscope className="h-7 w-7 text-[#0077b6]" aria-hidden="true" />
                    <h2 id="prep-title" className="font-heading text-xl font-bold text-[#03045e] sm:text-2xl">
                      Before your visit
                    </h2>
                  </div>
                  <div className="grid gap-8 sm:grid-cols-2">
                    {(
                      [
                        { title: "Bring", items: caseData.visit_prep.bring },
                        { title: "Say", items: caseData.visit_prep.say },
                        { title: "Ask your doctor", items: caseData.visit_prep.ask },
                        { title: "Go sooner if", items: caseData.visit_prep.go_sooner_if },
                      ] as const
                    ).map(({ title, items }) => (
                      <div key={title}>
                        <div className="mb-3 text-sm font-bold uppercase tracking-wide text-[#0077b6]">{title}</div>
                        <ul className="space-y-2.5" role="list">
                          {items.map((item, i) => (
                            <li key={`${title}-${i}`} className="flex gap-3 text-base leading-relaxed text-[#374151]">
                              <span
                                className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-[#90e0ef]"
                                aria-hidden="true"
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              </FadeIn>
            )}

            <FadeIn delay={0.1}>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="surface-tinted flex flex-col justify-between gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:p-8 lg:flex-col lg:items-start">
                  <div className="flex items-start gap-4">
                    <DollarSign className="mt-1 h-7 w-7 flex-shrink-0 text-[#0077b6]" aria-hidden="true" />
                    <div>
                      <div className="text-lg font-bold text-[#03045e]">Cost estimate</div>
                      <p className="mt-2 text-base leading-relaxed text-[#6b7280]">{caseData.cost_estimate}</p>
                    </div>
                  </div>
                  <Link
                    href={`/coverage/${caseId}`}
                    className="btn-secondary !h-12 flex-shrink-0 !px-6 !text-base"
                    aria-label="Coverage help: understand your cost and coverage options"
                  >
                    Coverage help
                  </Link>
                </div>
                <div className="surface flex flex-col justify-between gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:p-8 lg:flex-col lg:items-start">
                  <div className="flex items-center gap-4">
                    <Clock className="h-7 w-7 flex-shrink-0 text-[#0077b6]" aria-hidden="true" />
                    <div>
                      <div className="text-lg font-bold text-[#03045e]">Follow-up in {caseData.follow_up_in}</div>
                      <p className="mt-1 text-base text-[#6b7280]">Set a quick reminder after your visit</p>
                    </div>
                  </div>
                  <Link
                    href={`/followup/${caseId}`}
                    className="btn-primary !h-12 flex-shrink-0 !px-6 !text-base"
                    aria-label="Set up your follow-up reminder"
                  >
                    Set up
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </FadeIn>

            <SafetyBanner variant="inline" />

            {caseId === "demo" && (
              <FadeIn delay={0.14}>
                <div className="rounded-3xl border-2 border-[#90e0ef]/30 bg-gradient-to-br from-[#f3fbfd] to-[#caf0f8] p-8 text-center shadow-inner sm:p-10">
                  <p className="text-xl font-bold text-[#03045e]">This was the demo result</p>
                  <p className="mx-auto mt-2 max-w-lg text-base text-[#6b7280]">
                    Run a real check with your own symptoms in about a minute.
                  </p>
                  <Link href="/check" className="btn-primary mt-6 inline-flex !h-12 !px-8 !text-base">
                    Start my check
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </div>
              </FadeIn>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
