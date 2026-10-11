import { TriangleAlert } from "lucide-react";
import { Metadata } from "next";
import { FadeIn } from "@/components/motion/FadeIn";

export const metadata: Metadata = { title: "Terms of Use" };

const SECTIONS = [
  {
    title: "What BridgeCare is",
    body: "BridgeCare is an AI-assisted health navigation tool. It helps you understand urgency, care options, cost direction, and next steps. It is not a medical provider, diagnostic tool, or treatment service.",
  },
  {
    title: "No medical advice",
    body: "Nothing on BridgeCare constitutes medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider for any medical condition. Do not disregard professional medical advice because of something you read here.",
  },
  {
    title: "Emergency situations",
    body: "If you are experiencing a medical emergency, call 911 immediately. BridgeCare is not a substitute for emergency services. If you are in crisis, call or text 988 (Suicide & Crisis Lifeline).",
  },
  {
    title: "How to use this service",
    body: "You may use BridgeCare for personal, non-commercial health navigation purposes. You must not use it to attempt to diagnose yourself or others, to generate content for medical purposes, or to circumvent professional healthcare.",
  },
  {
    title: "Accuracy and limitations",
    body: "BridgeCare's triage results are based on deterministic rules and AI-generated explanations. They may not account for your full medical history, rare conditions, or rapidly changing symptoms. Results are guidance only.",
  },
  {
    title: "Account responsibility",
    body: "If you create an account, you are responsible for keeping your login secure. Do not share your magic link with others. You may delete your account at any time.",
  },
  {
    title: "Changes to terms",
    body: "These terms may be updated as BridgeCare evolves. Continued use of the service constitutes acceptance of updated terms. We will not retroactively change your privacy rights.",
  },
];

export default function TermsPage() {
  return (
    <div className="py-20 px-6">
      <div className="mx-auto max-w-2xl">
        <FadeIn>
          <div className="mb-10">
            <div className="inline-block text-xs font-bold text-[#0077b6] uppercase tracking-wider mb-3">Legal</div>
            <h1 className="text-display-sm text-[#03045e] mb-4">Terms of Use</h1>
            <p className="text-sm text-[#6b7280]">Last updated: April 2026</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.02}>
          <div className="rounded-[20px] bg-amber-50 border border-amber-200 p-4 mb-8 flex items-start gap-3">
            <TriangleAlert className="h-5 w-5 flex-shrink-0 text-amber-700 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-amber-900 leading-relaxed">
              <strong>Important:</strong> BridgeCare is not a medical provider.
              For emergencies, call <a href="tel:911" className="font-bold underline">911</a>.
              For mental health crises, call or text{" "}
              <a href="tel:988" className="font-bold underline">988</a>.
            </p>
          </div>
        </FadeIn>

        <div className="space-y-8">
          {SECTIONS.map(({ title, body }, i) => (
            <FadeIn key={title} delay={i * 0.03}>
              <section aria-labelledby={`terms-${i}`}>
                <h2 id={`terms-${i}`} className="font-heading font-bold text-[#03045e] mb-2">
                  {title}
                </h2>
                <p className="text-sm text-[#374151] leading-relaxed">{body}</p>
              </section>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
