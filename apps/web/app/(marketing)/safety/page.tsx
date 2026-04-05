import { Metadata } from "next";
import { FadeIn } from "@/components/motion/FadeIn";
import { ShieldCheck, AlertTriangle, Phone } from "lucide-react";

export const metadata: Metadata = { title: "Safety" };

export default function SafetyPage() {
  return (
    <div className="py-20 px-6">
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <h1 className="text-display text-[#03045e] mb-6">Safety &amp; limitations</h1>
        </FadeIn>

        <div className="space-y-6">
          <FadeIn>
            <div className="rounded-[20px] bg-red-50 border-2 border-red-200 p-6 flex gap-4">
              <Phone className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-heading font-bold text-red-900 mb-2">For emergencies, call 911</h2>
                <p className="text-sm text-red-800 leading-relaxed">
                  BridgeCare is not a substitute for emergency services. If you or someone else is experiencing
                  a medical emergency — chest pain, difficulty breathing, loss of consciousness, or suicidal crisis —
                  call <strong>911</strong> or go to the nearest emergency room immediately.
                </p>
              </div>
            </div>
          </FadeIn>

          {[
            {
              icon: ShieldCheck,
              title: "What BridgeCare does",
              items: [
                "Helps you understand what urgency level your symptoms might represent",
                "Suggests appropriate care routes based on clinical rules",
                "Explains cost and coverage options in plain language",
                "Finds nearby providers using open map data",
                "Follows up to ensure you got care",
              ],
            },
            {
              icon: AlertTriangle,
              title: "What BridgeCare does not do",
              items: [
                "Diagnose medical conditions",
                "Replace a licensed clinician",
                "Provide prescriptions or medication recommendations",
                "Guarantee accuracy for any individual's situation",
                "Provide crisis counseling (for mental health crises, call 988)",
              ],
            },
          ].map(({ icon: Icon, title, items }) => (
            <FadeIn key={title}>
              <div className="surface p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-5 h-5 text-[#0077b6]" />
                  <h2 className="font-heading font-bold text-[#03045e]">{title}</h2>
                </div>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-[#374151]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#90e0ef] mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}

          <FadeIn>
            <div className="surface-tinted p-5 text-sm text-[#374151] leading-relaxed">
              <strong className="text-[#03045e]">Mental health crisis?</strong>{" "}
              Call or text <strong>988</strong> (Suicide &amp; Crisis Lifeline) — available 24/7, free, confidential.
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
