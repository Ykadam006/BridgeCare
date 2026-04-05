import { Metadata } from "next";
import { FadeIn } from "@/components/motion/FadeIn";
import { SafetyBanner } from "@/components/shared/SafetyBanner";
import { ShieldCheck, Heart, Users, Zap } from "lucide-react";

export const metadata: Metadata = { title: "About BridgeCare" };

export default function AboutPage() {
  return (
    <div className="py-20 px-6">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <h1 className="text-display text-[#03045e] mb-6 text-balance">
            We're reducing confusion before care happens.
          </h1>
          <p className="text-lg text-[#374151] leading-relaxed mb-12 max-w-xl text-pretty">
            BridgeCare is the AI health front door for Gen Z students and young adults.
            We help you understand urgency, care options, cost direction, and next steps —
            without the anxiety spiral.
          </p>
        </FadeIn>

        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {[
            { icon: ShieldCheck, title: "Rules-first safety", body: "Our triage engine uses deterministic rules. AI explains — it never decides urgency alone." },
            { icon: Heart, title: "Calm by design", body: "Every interaction is designed to reduce anxiety, not amplify it. One action at a time." },
            { icon: Zap, title: "Fast navigation", body: "Under 60 seconds from 'something feels off' to a clear care route with cost estimates." },
            { icon: Users, title: "Built for Gen Z", body: "Plain language, mobile-first, accessibility-first. No medical jargon, no spiraling symptom lists." },
          ].map(({ icon: Icon, title, body }) => (
            <FadeIn key={title}>
              <div className="surface p-6 h-full">
                <div className="w-10 h-10 rounded-xl bg-[#90e0ef]/20 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-[#03045e]" />
                </div>
                <h3 className="font-heading font-bold text-[#03045e] mb-2">{title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{body}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <SafetyBanner variant="inline" />
      </div>
    </div>
  );
}
