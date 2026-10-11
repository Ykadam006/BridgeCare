"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, ArrowLeft, ChevronRight } from "lucide-react";
import { useCheckSession } from "@/hooks/useCheckSession";
import { StepDots } from "@/components/shared/ProgressBar";
import { SafetyBanner } from "@/components/shared/SafetyBanner";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";
import {
  AGE_RANGES,
  INSURANCE_STATUS,
  LANGUAGES,
  CARE_MODES,
} from "@/lib/constants";
import {
  ageRangeLabel,
  careModeCopy,
  getCheckOnboardingStrings,
  insuranceLabel,
  isRtlLang,
} from "@/lib/check-i18n";
import { Nav } from "@/components/shared/Nav";

const TOTAL_STEPS = 4;

const SLIDE = {
  hidden: (dir: number) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
  visible: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -32 : 32 }),
};

function CheckInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symptomHint = searchParams.get("symptom");
  const { profile, setProfile, setStep, reset } = useCheckSession();
  const reduced = useReducedMotion();

  const [step, setLocalStep] = useState(1);
  const [dir, setDir] = useState(1);

  // Local form state
  const [ageRange, setAgeRange] = useState(profile.age_range || "");
  const [zip, setZip] = useState(profile.zip || "");
  const [insurance, setInsurance] = useState(profile.insurance_status || "");
  const [language, setLanguage] = useState(profile.language || "en");
  const [mode, setMode] = useState<"quick" | "guided">(profile.mode || "guided");
  const [accessibility, setAccessibility] = useState(
    profile.accessibility || { reduced_motion: false, large_text: false }
  );

  const t = useMemo(() => getCheckOnboardingStrings(language), [language]);
  const textDir = isRtlLang(language) ? "rtl" : "ltr";

  function go(nextStep: number) {
    setDir(nextStep > step ? 1 : -1);
    setLocalStep(nextStep);
  }

  function handleContinue() {
    if (step < TOTAL_STEPS) {
      go(step + 1);
    } else {
      // Save profile and proceed to intake
      setProfile({ age_range: ageRange, zip, insurance_status: insurance, language, mode, accessibility });
      setStep("intake");
      router.push("/check/questions" + (symptomHint ? `?symptom=${encodeURIComponent(symptomHint)}` : ""));
    }
  }

  const slideProps = reduced
    ? {}
    : {
        initial: "hidden",
        animate: "visible",
        exit: "exit",
        custom: dir,
        variants: SLIDE,
        transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <div className="min-h-screen bg-[#f3fbfd] flex flex-col">
      <Nav />
      {/* Screen reader step announcer */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {t.stepAnnouncer(step, TOTAL_STEPS)}
      </div>
      <main
        id="main-content"
        className="flex-1 flex flex-col items-center justify-center px-6 py-12"
        tabIndex={-1}
        dir={textDir}
      >
        <div className="w-full max-w-lg">

          {/* Header — contextual per step */}
          <div className="text-center mb-8">
            <StepDots current={step} total={TOTAL_STEPS} className="justify-center mb-4" />
            <h1 className="text-headline text-[#03045e] mb-2">
              {step === 1 && t.step1Title}
              {step === 2 && t.step2Title}
              {step === 3 && t.step3Title}
              {step === 4 && t.step4Title}
            </h1>
            <p className="text-sm text-[#6b7280]">
              {step === 4 ? t.stepSubtitleLast : t.stepSubtitleDefault}
            </p>
          </div>

          {/* Step cards */}
          <div className="relative" style={{ minHeight: 320 }}>
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div key={step} {...slideProps} className="w-full">

                {/* Step 1: Age + ZIP */}
                {step === 1 && (
                  <div className="surface p-8 space-y-6">
                    <div>
                      <fieldset>
                        <legend className="block text-sm font-semibold text-[#03045e] mb-3">
                          {t.ageLegend}
                        </legend>
                        <div className="grid grid-cols-3 gap-2">
                          {AGE_RANGES.map(({ value, label }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setAgeRange(value)}
                              className={cn(
                                "py-2.5 px-3 rounded-[16px] text-sm font-medium border transition duration-[180ms]",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077b6]",
                                ageRange === value
                                  ? "bg-[#0077b6] text-white border-[#0077b6]"
                                  : "bg-white text-[#374151] border-[#d1d5db] hover:border-[#00b4d8]"
                              )}
                              aria-pressed={ageRange === value}
                            >
                              {ageRangeLabel(language, value, label)}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                    <div>
                      <label htmlFor="zip" className="block text-sm font-semibold text-[#03045e] mb-1.5">
                        {t.zipLabel}{" "}
                        <span className="text-[#6b7280] font-normal">{t.zipOptional}</span>
                      </label>
                      <input
                        id="zip"
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder={t.zipPlaceholder}
                        className="input"
                        autoComplete="postal-code"
                        inputMode="text"
                      />
                      <p className="text-xs text-[#6b7280] mt-1.5">{t.zipHint}</p>
                    </div>
                  </div>
                )}

                {/* Step 2: Insurance */}
                {step === 2 && (
                  <div className="surface p-8">
                    <fieldset>
                      <legend className="block text-sm font-semibold text-[#03045e] mb-4">
                        {t.insuranceLegend}{" "}
                        <span className="text-[#6b7280] font-normal">{t.insuranceHint}</span>
                      </legend>
                      <div className="space-y-2">
                        {INSURANCE_STATUS.map(({ value, label, icon: Icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setInsurance(value)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] border text-sm text-left transition duration-[180ms]",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077b6]",
                              insurance === value
                                ? "bg-[#f3fbfd] border-[#0077b6] text-[#03045e] font-semibold"
                                : "bg-white border-[#e5e7eb] text-[#374151] hover:border-[#90e0ef]"
                            )}
                            aria-pressed={insurance === value}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0 text-[#0077b6]" aria-hidden="true" />
                            {insuranceLabel(language, value, label)}
                            {insurance === value && (
                              <ChevronRight className="w-4 h-4 text-[#0077b6] ml-auto" aria-hidden="true" />
                            )}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                )}

                {/* Step 3: Language */}
                {step === 3 && (
                  <div className="surface p-8 space-y-6">
                    <div>
                      <fieldset>
                        <legend className="block text-sm font-semibold text-[#03045e] mb-3">
                          {t.languageLegend}
                        </legend>
                        <div className="grid grid-cols-2 gap-2">
                          {LANGUAGES.map(({ value, label }) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setLanguage(value)}
                              className={cn(
                                "py-2.5 px-3 rounded-[16px] text-sm font-medium border transition duration-[180ms]",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077b6]",
                                language === value
                                  ? "bg-[#0077b6] text-white border-[#0077b6]"
                                  : "bg-white text-[#374151] border-[#d1d5db] hover:border-[#00b4d8]"
                              )}
                              aria-pressed={language === value}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                    <div>
                      <fieldset>
                        <legend className="block text-sm font-semibold text-[#03045e] mb-3">
                          {t.accessibilityLegend}{" "}
                          <span className="text-[#6b7280] font-normal">{t.accessibilityHint}</span>
                        </legend>
                        <div className="space-y-2">
                          {[
                            { key: "reduced_motion", label: t.reducedMotion },
                            { key: "large_text", label: t.largeText },
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-3 cursor-pointer group">
                              <div
                                className={cn(
                                  "w-10 h-6 rounded-full border transition duration-[180ms] relative flex-shrink-0",
                                  "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#0077b6] has-[:focus-visible]:ring-offset-2",
                                  accessibility[key as keyof typeof accessibility]
                                    ? "bg-[#0077b6] border-[#0077b6]"
                                    : "bg-[#e5e7eb] border-[#d1d5db]"
                                )}
                              >
                                <div
                                  className={cn(
                                    "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-[180ms]",
                                    accessibility[key as keyof typeof accessibility] && "translate-x-4"
                                  )}
                                />
                                <input
                                  type="checkbox"
                                  role="switch"
                                  className="sr-only"
                                  checked={!!accessibility[key as keyof typeof accessibility]}
                                  onChange={(e) => setAccessibility((a) => ({ ...a, [key]: e.target.checked }))}
                                />
                              </div>
                              <span className="text-sm text-[#374151]">{label}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                  </div>
                )}

                {/* Step 4: Mode */}
                {step === 4 && (
                  <div className="surface p-8">
                    <fieldset>
                      <legend className="block text-sm font-semibold text-[#03045e] mb-4">
                        {t.modeLegend}
                      </legend>
                      <div className="space-y-3">
                        {CARE_MODES.map(({ value, icon: Icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setMode(value as "quick" | "guided")}
                            className={cn(
                              "w-full flex items-start gap-4 p-5 rounded-[20px] border text-left transition duration-[180ms]",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077b6]",
                              mode === value
                                ? "bg-[#f3fbfd] border-[#0077b6] shadow-card"
                                : "bg-white border-[#e5e7eb] hover:border-[#90e0ef]"
                            )}
                            aria-pressed={mode === value}
                          >
                            <Icon className="w-6 h-6 flex-shrink-0 text-[#0077b6] mt-0.5" aria-hidden="true" />
                            <div>
                              <div className={cn("font-semibold text-sm", mode === value ? "text-[#03045e]" : "text-[#374151]")}>
                                {careModeCopy(language, value as "quick" | "guided").label}
                              </div>
                              <div className="text-xs text-[#6b7280] mt-0.5">
                                {careModeCopy(language, value as "quick" | "guided").description}
                              </div>
                            </div>
                            {mode === value && (
                              <div className="ml-auto w-5 h-5 rounded-full bg-[#0077b6] flex items-center justify-center flex-shrink-0" aria-hidden="true">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" aria-hidden="true">
                                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6">
            {step > 1 ? (
              <button
                onClick={() => go(step - 1)}
                className="btn-ghost gap-2"
                aria-label="Go to previous step"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                {t.back}
              </button>
            ) : (
              <button
                onClick={() => {
                  reset();
                  router.push("/");
                }}
                className="btn-ghost text-[#6b7280] text-sm"
              >
                {t.cancel}
              </button>
            )}

            <div className="flex gap-3">
              {step < TOTAL_STEPS && (
                <button
                  onClick={() => go(step + 1)}
                  className="btn-ghost text-sm text-[#6b7280]"
                >
                  {t.skip}
                </button>
              )}
              <button
                onClick={handleContinue}
                className="btn-primary"
                aria-label={
                  step === 1 ? `${t.nextStep}: ${t.ariaNext1}` :
                  step === 2 ? `${t.nextStep}: ${t.ariaNext2}` :
                  step === 3 ? `${t.nextStep}: ${t.ariaNext3}` :
                  undefined
                }
              >
                {step === TOTAL_STEPS ? t.startCheck : t.nextStep}
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <SafetyBanner variant="inline" className="mt-6" />
        </div>
      </main>
    </div>
  );
}

export default function CheckPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f3fbfd] flex items-center justify-center"><div className="skeleton h-64 w-full max-w-lg rounded-[24px]" /></div>}>
      <CheckInner />
    </Suspense>
  );
}
