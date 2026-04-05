"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, DollarSign, Phone, ListChecks, Sparkles } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/FadeIn";
import { Reveal } from "@/components/motion/Reveal";
import { SafetyBanner } from "@/components/shared/SafetyBanner";
import { Nav } from "@/components/shared/Nav";
import { useCheckSession } from "@/hooks/useCheckSession";
import { triageApi } from "@/lib/api";
import type { Case, CaseCareOption } from "@/lib/case-types";
import { DEMO_CASE } from "@/lib/demo-case";
import type { CareMapMarkerSpec } from "@/lib/care-map";
import { CareOptionsMapClient } from "@/components/maps/CareOptionsMapClient";
import { careOptionActionSteps, careOptionIcon, symptomVisualCue } from "@/lib/care-option-visuals";
import { cn } from "@/lib/utils";

const MAP_CENTER: [number, number] = [37.4419, -122.143];
const FALLBACK_KM = [0.8, 1.2, 1.9, 2.3] as const;
const DEMO_TELE_PHONE = "1-800-835-2362";

function isTelehealthType(t: string) {
  return /tele|video visit|virtual/i.test(t);
}

type NormalizedOption = CaseCareOption & { rank: number; mapKm: number | null };

function normalizeOptions(options: CaseCareOption[]): NormalizedOption[] {
  const sorted = [...options].sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
  return sorted.map((o, idx) => {
    const rank = o.rank ?? idx + 1;
    const needsPin = !isTelehealthType(o.type);
    const km =
      o.distance_km != null ? o.distance_km : needsPin ? FALLBACK_KM[idx % FALLBACK_KM.length] : null;
    return { ...o, rank, mapKm: km };
  });
}

function markerSpecsFromOptions(normalized: NormalizedOption[]): CareMapMarkerSpec[] {
  return normalized
    .filter((o) => o.mapKm != null)
    .map((o, i) => ({
      id: `care-${o.rank}`,
      rank: o.rank,
      label: o.type,
      subtitle: o.time_sensitivity
        ? `${o.mapKm!.toFixed(1)} km · ${o.time_sensitivity}`
        : `${o.mapKm!.toFixed(1)} km`,
      distanceKm: o.mapKm!,
      bearingDeg: (o.rank * 73 + i * 47) % 360,
    }));
}

export default function CareOptionsClient({ caseId }: { caseId: string }) {
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

  const [caseData, setCaseData] = useState<Case | null>(caseId === "demo" ? DEMO_CASE : fromZustand);
  const [loading, setLoading] = useState(caseData === null);

  useEffect(() => {
    if (caseData) return;
    async function load() {
      try {
        setCaseData(await triageApi.getCase(caseId));
      } catch {
        /* ignore */
      }
      setLoading(false);
    }
    load();
  }, [caseId, caseData]);

  const normalized = useMemo(
    () => (caseData ? normalizeOptions(caseData.care_options) : []),
    [caseData]
  );
  const markers = useMemo(() => markerSpecsFromOptions(normalized), [normalized]);
  const cue = caseData ? symptomVisualCue(caseData.chief_complaint) : null;

  if (loading || !caseData) {
    return (
      <div className="min-h-screen bg-[#f3fbfd]">
        <Nav />
        <div className="mx-auto w-full max-w-[1400px] px-4 py-16 sm:px-8" aria-busy="true">
          <div className="h-10 w-48 animate-pulse rounded-2xl bg-[#e5e7eb]" />
          <div className="mt-8 h-64 w-full animate-pulse rounded-3xl bg-[#e5e7eb]/80" />
          <div className="mt-8 space-y-4">
            <div className="h-52 animate-pulse rounded-3xl bg-white shadow" />
            <div className="h-52 animate-pulse rounded-3xl bg-white shadow" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f3fbfd] via-white to-[#f3fbfd]">
      <Nav />
      <main
        id="main-content"
        className="mx-auto w-full max-w-[1400px] px-4 pb-16 pt-8 sm:px-8 lg:px-10 lg:pb-24 lg:pt-10"
        tabIndex={-1}
      >
        <FadeIn>
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <Link
                href={`/results/${caseId}`}
                className="btn-ghost mb-4 !h-10 gap-2 !px-4 text-sm font-semibold"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden />
                Back to results
              </Link>
              <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#03045e] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">
                Care options for you
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-[#374151] sm:text-xl">
                Picked for <span className="font-semibold text-[#03045e]">your symptoms</span> — not generic
                advice.
              </p>
            </div>
          </div>
        </FadeIn>

        {cue && (
          <Reveal className="mb-10">
            <div
              className={cn(
                "overflow-hidden rounded-3xl border-2 border-[#90e0ef]/35 bg-gradient-to-br p-6 shadow-card sm:p-8",
                cue.tint
              )}
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <span className="select-none text-5xl sm:text-6xl" aria-hidden>
                    {cue.emoji}
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#0077b6]">{cue.label}</p>
                    <p className="mt-2 text-lg font-semibold leading-snug text-[#03045e] sm:text-xl lg:text-2xl">
                      {caseData.chief_complaint}
                    </p>
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-base text-[#374151]">
                      <span className="rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-[#03045e] ring-1 ring-[#90e0ef]/30">
                        {caseData.urgency_label}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2 rounded-2xl border border-[#90e0ef]/25 bg-white/70 px-4 py-3 text-sm text-[#374151] backdrop-blur-sm">
                  <Sparkles className="h-5 w-5 text-[#0077b6]" aria-hidden />
                  <span>These options match this check-in.</span>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        <div className="grid grid-cols-1 gap-10 xl:grid-cols-12 xl:gap-12">
          <div className="xl:col-span-5 xl:sticky xl:top-28 xl:self-start">
            <FadeIn delay={0.05}>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#0077b6]">Near you</p>
              <CareOptionsMapClient
                instanceKey={caseId}
                defaultCenter={MAP_CENTER}
                markerSpecs={markers}
              />
            </FadeIn>
          </div>

          <div className="min-w-0 xl:col-span-7">
            {normalized.length === 0 && (
              <div className="surface rounded-3xl p-10 text-center">
                <p className="text-lg font-semibold text-[#03045e]">No care options found for this check-in.</p>
                <p className="mt-2 text-base text-[#6b7280]">
                  Go back to your results or run a new health check.
                </p>
                <Link href={`/results/${caseId}`} className="btn-primary mt-6 inline-flex !h-12 !px-8">
                  Back to results
                </Link>
              </div>
            )}
            <StaggerContainer className="space-y-6">
              {normalized.map((opt, i) => {
                const Icon = careOptionIcon(opt.type);
                const steps = careOptionActionSteps(opt.type);
                const showPhone = i === 0 && isTelehealthType(opt.type) && caseId === "demo";

                return (
                  <StaggerItem key={`${opt.rank}-${opt.type}`} liftOnHover>
                    <article
                      className={cn(
                        "rounded-3xl border-2 p-6 transition-shadow duration-300 sm:rounded-[28px] sm:p-8",
                        i === 0
                          ? "border-[#90e0ef] bg-gradient-to-br from-[#f3fbfd] to-white shadow-card-hover"
                          : "border-[#e5e7eb] bg-white shadow-card hover:shadow-card-hover"
                      )}
                    >
                      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-4">
                          <div
                            className={cn(
                              "flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl sm:h-16 sm:w-16",
                              i === 0
                                ? "bg-gradient-to-br from-[#90e0ef]/30 to-[#90e0ef]/40 text-[#03045e]"
                                : "bg-[#f3fbfd] text-[#0077b6] ring-2 ring-[#90e0ef]/25"
                            )}
                          >
                            <Icon className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="font-heading text-xl font-bold text-[#03045e] sm:text-2xl">
                                {opt.type}
                              </h2>
                              {i === 0 && (
                                <span className="inline-flex items-center rounded-full bg-[#0077b6] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                                  Best fit first
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm font-medium text-[#6b7280]">Option #{opt.rank}</p>
                          </div>
                        </div>
                      </div>

                      {opt.why_this_fits && (
                        <p className="mb-6 text-base leading-relaxed text-[#374151] sm:text-lg">{opt.why_this_fits}</p>
                      )}

                      <div className="mb-6 flex flex-wrap gap-4 text-base text-[#374151]">
                        {opt.cost_range && (
                          <span className="inline-flex items-center gap-2 rounded-2xl bg-[#f3fbfd] px-4 py-2 font-medium ring-1 ring-[#90e0ef]/20">
                            <DollarSign className="h-5 w-5 text-[#0077b6]" aria-hidden />
                            {opt.cost_range}
                          </span>
                        )}
                        {opt.time_sensitivity && (
                          <span className="inline-flex items-center gap-2 rounded-2xl bg-[#f3fbfd] px-4 py-2 font-medium ring-1 ring-[#90e0ef]/20">
                            <Clock className="h-5 w-5 text-[#0077b6]" aria-hidden />
                            {opt.time_sensitivity}
                          </span>
                        )}
                        {opt.mapKm != null && (
                          <span className="inline-flex items-center gap-2 rounded-2xl bg-[#f3fbfd] px-4 py-2 font-medium ring-1 ring-[#90e0ef]/20">
                            <MapPin className="h-5 w-5 text-[#0077b6]" aria-hidden />
                            {opt.mapKm.toFixed(1)} km away
                          </span>
                        )}
                      </div>

                      <div className="mb-6 rounded-2xl border border-dashed border-[#90e0ef]/50 bg-white/60 p-5">
                        <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#03045e]">
                          <ListChecks className="h-5 w-5 text-[#0077b6]" aria-hidden />
                          What to do for this option
                        </div>
                        <ol className="m-0 list-none space-y-3 p-0">
                          {steps.map((step, idx) => (
                            <li key={step} className="flex gap-3 text-base leading-snug text-[#374151]">
                              <span
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0077b6] text-sm font-bold text-white"
                                aria-hidden
                              >
                                {idx + 1}
                              </span>
                              <span className="pt-0.5">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {opt.notes && (
                        <p className="mb-6 text-base leading-relaxed text-[#6b7280] sm:text-[17px]">{opt.notes}</p>
                      )}

                      {showPhone && (
                        <a
                          href={`tel:${DEMO_TELE_PHONE.replace(/\D/g, "")}`}
                          className="btn-primary inline-flex !h-12 !px-8 !text-base"
                          aria-label={`Call telehealth demo line ${DEMO_TELE_PHONE}`}
                        >
                          <Phone className="h-5 w-5" aria-hidden />
                          Call now
                        </a>
                      )}
                    </article>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </div>

        <FadeIn delay={0.15} className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="surface flex flex-col justify-between gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <div className="text-lg font-bold text-[#03045e]">Understand your cost</div>
              <p className="mt-2 text-base text-[#6b7280]">
                Plain-language breakdown — deductibles, copays, coverage tiers
              </p>
            </div>
            <Link href={`/coverage/${caseId}`} className="btn-secondary !h-12 flex-shrink-0 !px-6 !text-base">
              Coverage help
            </Link>
          </div>
          <div className="surface flex flex-col justify-between gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <div className="text-lg font-bold text-[#03045e]">Follow-up reminder</div>
              <p className="mt-2 text-base text-[#6b7280]">Quick check-in after your visit — about 30 seconds</p>
            </div>
            <Link href={`/followup/${caseId}`} className="btn-primary !h-12 flex-shrink-0 !px-6 !text-base">
              Set up
            </Link>
          </div>
        </FadeIn>

        <SafetyBanner variant="inline" className="mt-12" />
      </main>
    </div>
  );
}
