import { Metadata } from "next";
import { FadeIn } from "@/components/motion/FadeIn";

export const metadata: Metadata = { title: "Privacy Policy" };

const SECTIONS = [
  {
    title: "What we collect",
    body: "We collect only what you share during a health check-in: your described symptoms, age range, ZIP code, insurance status, and preferred language. We never ask for your name, date of birth, or government ID.",
  },
  {
    title: "How we use your data",
    body: "Your check-in data is used only to generate your triage result and care recommendations. We do not sell, rent, or share your health data with advertisers, insurance companies, or employers.",
  },
  {
    title: "Guest check-ins",
    body: "You can use BridgeCare without creating an account. Guest check-ins are saved temporarily to show you your result. They are not linked to any identity.",
  },
  {
    title: "Signed-in accounts",
    body: "If you create an account with a magic link, your check-in history is saved so you can review past results and track reminders. You can delete your account and all data at any time.",
  },
  {
    title: "Storage and security",
    body: "Data is stored in Supabase (hosted on AWS). All connections are encrypted in transit (TLS). Row-level security ensures you can only access your own records.",
  },
  {
    title: "Third parties",
    body: "We use Supabase for database and authentication, and send your messages to an AI provider (Anthropic Claude, Groq, or Google Gemini) to generate explanations. Each provider handles that data under its own privacy and retention policy.",
  },
  {
    title: "Your rights",
    body: "You can request deletion of your data at any time by emailing our team or using the account settings page. We will respond within 30 days.",
  },
  {
    title: "Not a medical provider",
    body: "BridgeCare is a health navigation tool. It is not a covered entity under HIPAA and does not provide medical diagnoses or treatment. Do not use it as a substitute for professional medical care.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="py-20 px-6">
      <div className="mx-auto max-w-2xl">
        <FadeIn>
          <div className="mb-10">
            <div className="inline-block text-xs font-bold text-[#0077b6] uppercase tracking-wider mb-3">Privacy</div>
            <h1 className="text-display-sm text-[#03045e] mb-4">Privacy Policy</h1>
            <p className="text-sm text-[#6b7280]">Last updated: April 2026</p>
          </div>
        </FadeIn>

        <div className="space-y-8">
          {SECTIONS.map(({ title, body }, i) => (
            <FadeIn key={title} delay={i * 0.03}>
              <section aria-labelledby={`privacy-${i}`}>
                <h2 id={`privacy-${i}`} className="font-heading font-bold text-[#03045e] mb-2">
                  {title}
                </h2>
                <p className="text-sm text-[#374151] leading-relaxed">{body}</p>
              </section>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3} className="mt-12 rounded-[20px] border border-[#90e0ef] bg-[#f3fbfd] p-5">
          <p className="text-xs text-[#6b7280] leading-relaxed">
            <strong className="text-[#03045e]">Questions?</strong>{" "}
            BridgeCare is a student hackathon project. If you have questions about data practices,
            please raise an issue on our GitHub repository.
          </p>
        </FadeIn>
      </div>
    </div>
  );
}
