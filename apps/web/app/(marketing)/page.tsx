import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Stethoscope,
  FileText,
  History,
  Siren,
  MessageCircle,
  Route,
  Footprints,
  ShieldCheck,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Calm health guidance for your next step",
  description:
    "BridgeCare helps students and young adults understand urgency, care options, and next steps with clear, calm guidance — not a diagnosis.",
};

const TASKS = [
  {
    href: "/check",
    icon: Stethoscope,
    title: "Check my symptoms",
    body: "Answer a few questions. Find out how urgent it is, where to go, and roughly what it costs.",
    cta: "Start a check",
  },
  {
    href: "/documents",
    icon: FileText,
    title: "Understand my documents",
    body: "Upload lab results or visit notes and ask questions in plain language.",
    cta: "Open my documents",
  },
  {
    href: "/dashboard",
    icon: History,
    title: "See my history",
    body: "Your past check-ins and follow-up reminders in one place.",
    cta: "Open my history",
  },
  {
    href: "/safety",
    icon: Siren,
    title: "Is this an emergency?",
    body: "Warning signs that mean you should call 911 or go to the ER now.",
    cta: "See warning signs",
  },
] as const;

const STEPS = [
  { icon: MessageCircle, title: "Tell us what's going on", body: "Describe your symptoms in your own words." },
  { icon: Route, title: "Get a clear answer", body: "See how urgent it is and which kind of care fits." },
  { icon: Footprints, title: "Take the next step", body: "Nearby options, cost direction, and what to say at the visit." },
] as const;

const wrap = "mx-auto max-w-[1200px] px-4 sm:px-6";

export default function HomePage() {
  return (
    <>
      {/* 1. What this is + the main action */}
      <section className="bg-brand-navy" aria-labelledby="hero-heading">
        <div className={`${wrap} py-14 sm:py-20`}>
          <h1 id="hero-heading" className="max-w-2xl font-heading text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Not sure what to do about a health problem?
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-brand-pale">
            Answer a few questions and get a clear next step: how urgent it is, where to go, and what it may cost. Free,
            private, and not a diagnosis.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/check"
              className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-brand-sky px-7 text-lg font-bold text-brand-navy transition-colors hover:bg-brand-light focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-light"
            >
              Start a symptom check
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <Link
              href="/results/demo"
              className="inline-flex h-14 items-center justify-center rounded-2xl border-2 border-brand-light px-7 text-lg font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-light"
            >
              See an example result
            </Link>
          </div>
          <p className="mt-8 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-white/10 px-4 py-2.5 text-sm text-brand-pale">
            <Phone className="h-4 w-4 text-brand-sky" aria-hidden="true" />
            Emergency? Call{" "}
            <a href="tel:911" className="font-bold text-white underline">
              911
            </a>
            · In crisis? Call or text{" "}
            <a href="tel:988" className="font-bold text-white underline">
              988
            </a>
          </p>
        </div>
      </section>

      {/* 2. Every feature as one obvious block */}
      <section className={`${wrap} py-14`} aria-labelledby="tasks-heading">
        <h2 id="tasks-heading" className="font-heading text-2xl font-extrabold text-brand-navy sm:text-3xl">
          What would you like to do?
        </h2>
        <ul className="m-0 mt-6 grid list-none gap-4 p-0 sm:grid-cols-2" role="list">
          {TASKS.map(({ href, icon: Icon, title, body, cta }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full flex-col rounded-2xl border-2 border-brand-pale bg-white p-6 transition-colors hover:border-brand-sky focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-light"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-pale" aria-hidden="true">
                  <Icon className="h-6 w-6 text-brand-navy" />
                </span>
                <span className="mt-4 font-heading text-xl font-bold text-brand-navy">{title}</span>
                <span className="mt-1.5 flex-1 leading-relaxed text-[#374151]">{body}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 font-bold text-brand-blue group-hover:underline">
                  {cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. How a check works */}
      <section id="how-it-works" className="bg-brand-pale" aria-labelledby="how-heading">
        <div className={`${wrap} py-14`}>
          <h2 id="how-heading" className="font-heading text-2xl font-extrabold text-brand-navy sm:text-3xl">
            How a check works
          </h2>
          <ol className="m-0 mt-6 grid list-none gap-4 p-0 md:grid-cols-3" role="list">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="rounded-2xl bg-white p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy font-bold text-white" aria-hidden="true">
                    {i + 1}
                  </span>
                  <Icon className="h-5 w-5 text-brand-blue" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold text-brand-navy">
                  <span className="sr-only">Step {i + 1}: </span>
                  {title}
                </h3>
                <p className="mt-1.5 leading-relaxed text-[#374151]">{body}</p>
              </li>
            ))}
          </ol>
          <Link
            href="/check"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-brand-blue px-6 font-bold text-white hover:bg-brand-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-light"
          >
            Start a check now
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 4. What it is and isn't */}
      <section className={`${wrap} py-14`} aria-labelledby="safety-heading">
        <div className="rounded-2xl border-2 border-brand-light bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-brand-blue" aria-hidden="true" />
            <h2 id="safety-heading" className="font-heading text-2xl font-extrabold text-brand-navy">
              Guidance, not diagnosis
            </h2>
          </div>
          <ul className="m-0 mt-5 grid list-disc gap-2 pl-5 leading-relaxed text-[#374151] sm:grid-cols-3 sm:gap-6">
            <li>BridgeCare does not replace a doctor.</li>
            <li>Urgency comes from medical red-flag rules, not guesswork; AI only explains it.</li>
            <li>Emergencies and crises are always sent to 911 or 988 first.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
