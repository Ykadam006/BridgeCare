import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, HelpCircle, AlertCircle, Users, GraduationCap, Hospital, Wallet } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/FadeIn";
import { SafetyBanner } from "@/components/shared/SafetyBanner";
import { Nav } from "@/components/shared/Nav";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Cost & coverage" };

const COVERAGE_PATHS = [
  {
    id: "parent-plan",
    title: "On a parent's plan (under 26)",
    applicable: true,
    icon: Users,
    summary: "You can stay on your parent's plan until your 26th birthday — even if you're married, not in school, or living away from home.",
    details: [
      "Coverage works wherever your parent's plan is accepted.",
      "You'll use their deductible progress — check if it's been met.",
      "Telehealth is usually covered at $0–$30 copay.",
    ],
    cta: "Use your parent's insurance card for any visit.",
  },
  {
    id: "student-plan",
    title: "Student health plan",
    applicable: true,
    icon: GraduationCap,
    summary: "If you're enrolled at a college or university, you likely have access to a student health plan — sometimes included in tuition.",
    details: [
      "Campus clinics are often free or very low-cost with a student health plan.",
      "Telehealth may also be free through your student portal.",
      "Check your school's student health website for details.",
    ],
    cta: "Log into your student health portal first.",
  },
  {
    id: "marketplace",
    title: "Marketplace plan (ACA)",
    applicable: false,
    icon: Hospital,
    summary: "If you're not covered through school or a parent, you can buy a plan on Healthcare.gov. Subsidies are often available based on income.",
    details: [
      "Open enrollment runs Nov 1 – Jan 15 (or special enrollment if you lost coverage).",
      "Many low-income individuals pay $0/month with subsidies.",
      "Plans cover preventive care at no cost.",
    ],
    cta: "Check plans at healthcare.gov",
  },
  {
    id: "uninsured",
    title: "No insurance",
    applicable: false,
    icon: Wallet,
    summary: "You still have options. Community health centers charge based on income — many visits cost $20–$40.",
    details: [
      "Federally Qualified Health Centers (FQHCs) serve everyone regardless of ability to pay.",
      "Telehealth services like Plume, Teladoc, or Cost Plus Drugs can be very affordable.",
      "Many pharmacies offer $4 generics for common medications.",
    ],
    cta: "Find a community health center at findahealthcenter.hrsa.gov",
  },
];

const GLOSSARY = [
  {
    term: "Deductible",
    def: "The amount you pay for covered services before your insurance starts paying. Example: $500 deductible means you pay the first $500 per year.",
  },
  {
    term: "Copay",
    def: "A fixed amount you pay at each visit. Example: $30 copay means you pay $30 every time you see a doctor, regardless of the bill.",
  },
  {
    term: "Coinsurance",
    def: "After your deductible is met, you pay a percentage. Example: 20% coinsurance means you pay 20% and insurance pays 80%.",
  },
  {
    term: "Out-of-pocket max",
    def: "The most you'll ever pay in a year. After you hit this, insurance covers 100%.",
  },
  {
    term: "In-network",
    def: "Providers your insurance has negotiated rates with — always cheaper. Going out-of-network usually costs significantly more.",
  },
  {
    term: "Prior authorization",
    def: "Some services need insurance approval before you get them. Your doctor's office usually handles this — ask if you're unsure.",
  },
];

export default async function CoveragePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return (
    <div className="min-h-screen bg-[#f3fbfd]">
      <Nav />

      <main id="main-content" className="mx-auto max-w-2xl px-6 py-10" tabIndex={-1}>
        <FadeIn>
          <div className="flex items-center gap-3 mb-8">
            <Link href={`/results/${caseId}`} className="btn-ghost !h-8 !px-3 gap-1.5 text-xs">
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Results
            </Link>
            <div>
              <h1 className="text-headline text-[#03045e]">Cost &amp; coverage</h1>
              <p className="text-sm text-[#6b7280]">Plain-language breakdown for your situation</p>
            </div>
          </div>
        </FadeIn>

        {/* ── Coverage paths ────────────────────────────────────────────── */}
        <StaggerContainer className="space-y-4 mb-10">
          {COVERAGE_PATHS.map((path) => (
            <StaggerItem key={path.id}>
              <div className={cn(
                "rounded-[24px] border p-5",
                path.applicable
                  ? "bg-[#f3fbfd] border-[#90e0ef]"
                  : "bg-white border-[#e5e7eb]"
              )}>
                <div className="flex items-start gap-3 mb-3">
                  <path.icon className="h-5 w-5 flex-shrink-0 text-[#0077b6] mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-heading font-bold text-sm text-[#03045e]">{path.title}</h2>
                      {path.applicable && (
                        <span className="text-xs bg-[#0077b6] text-white rounded-full px-2 py-0.5 font-medium">
                          Likely applies to you
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#374151] mt-1 leading-relaxed">{path.summary}</p>
                  </div>
                </div>

                <ul className="space-y-2 mb-4" role="list">
                  {path.details.map((d) => (
                    <li key={d} className="flex items-start gap-2.5 text-sm text-[#374151]">
                      <CheckCircle2 className="w-4 h-4 text-[#0077b6] flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {d}
                    </li>
                  ))}
                </ul>

                <div className="text-xs font-semibold text-[#03045e] bg-[#90e0ef]/15 rounded-xl px-3 py-2">
                  → {path.cta}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* ── Glossary ──────────────────────────────────────────────────── */}
        <FadeIn delay={0.3}>
          <section aria-labelledby="glossary-title">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-[#0077b6]" aria-hidden="true" />
              <h2 id="glossary-title" className="font-heading font-bold text-[#03045e]">
                Insurance terms, explained simply
              </h2>
            </div>
            <dl className="space-y-3">
              {GLOSSARY.map(({ term, def }) => (
                <div key={term} className="surface p-4">
                  <dt className="font-semibold text-sm text-[#03045e] mb-1">{term}</dt>
                  <dd className="text-sm text-[#374151] leading-relaxed">{def}</dd>
                </div>
              ))}
            </dl>
          </section>
        </FadeIn>

        <FadeIn delay={0.4} className="mt-8">
          <div className="rounded-[20px] bg-amber-50 border border-amber-200 p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-amber-800 leading-relaxed">
              These are estimates. Your actual costs depend on your specific plan, deductible progress,
              and in-network status. Call your insurance's member services number (on your card)
              for exact cost before a visit.
            </p>
          </div>
        </FadeIn>

        {/* Next step CTA */}
        <FadeIn delay={0.5} className="mt-4">
          <div className="surface p-5 flex items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-sm text-[#03045e]">Ready to set up a follow-up?</div>
              <div className="text-xs text-[#6b7280] mt-0.5">We'll remind you to check in after your visit</div>
            </div>
            <Link
              href={`/followup/${caseId}`}
              className="btn-primary !h-9 !px-4 !text-sm flex-shrink-0"
            >
              Follow-up
            </Link>
          </div>
        </FadeIn>

        <SafetyBanner variant="inline" className="mt-8" />
      </main>
    </div>
  );
}
