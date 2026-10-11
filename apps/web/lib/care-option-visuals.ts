import type { LucideIcon } from "lucide-react";
import { Clock, MapPin, Monitor, Phone, Stethoscope, Building2, Ambulance, Pill, HeartPulse, Brain, Thermometer, Wind, Droplets } from "lucide-react";

export function careOptionIcon(type: string): LucideIcon {
  const t = type.toLowerCase();
  if (t.includes("tele") || t.includes("video")) return Monitor;
  if (t.includes("urgent") || t.includes("er") || t.includes("emergency")) return Ambulance;
  if (t.includes("pharmacy") || t.includes("minute") || t.includes("walk-in")) return Pill;
  if (t.includes("campus") || t.includes("student")) return Building2;
  if (t.includes("primary") || t.includes("pcp") || t.includes("doctor")) return Stethoscope;
  if (t.includes("phone") || t.includes("nurse")) return Phone;
  return MapPin;
}

/** Short “what to do” cues — generic but actionable; pairs with care type. */
export function careOptionActionSteps(type: string): string[] {
  const t = type.toLowerCase();
  if (t.includes("tele") || t.includes("video")) {
    return [
      "Book or open the visit link on your phone or laptop",
      "List when symptoms started and what makes them better/worse",
      "Have your insurance card and pharmacy name ready",
    ];
  }
  if (t.includes("urgent")) {
    return [
      "Bring ID, insurance, and a list of meds",
      "Expect vitals + maybe quick tests at check-in",
      "Ask for cost estimate before add-on labs or imaging",
    ];
  }
  if (t.includes("campus") || t.includes("student")) {
    return [
      "Check student health hours online",
      "Bring student ID and insurance (or ask about self-pay)",
      "Mention if symptoms are getting worse since yesterday",
    ];
  }
  if (t.includes("primary") || t.includes("pcp")) {
    return [
      "Call for a sick visit — say you need the soonest slot",
      "Bring symptom notes + medication list",
      "Ask what signs mean you should go to urgent care instead",
    ];
  }
  if (t.includes("pharmacy") || t.includes("minute") || t.includes("clinic")) {
    return [
      "Check wait times online if the chain offers it",
      "Bring ID and know your pharmacy for any prescriptions",
      "Go earlier in the day if you need same-day care",
    ];
  }
  return [
    "Call ahead to confirm hours and wait times",
    "Bring ID, insurance card, and a short symptom timeline",
    "Write down one question you want answered before you leave",
  ];
}

export function symptomVisualCue(chiefComplaint: string): { icon: LucideIcon; label: string; tint: string } {
  const s = chiefComplaint.toLowerCase();
  if (/(chest|heart|palpitation|tight)/.test(s))
    return { icon: HeartPulse, label: "Chest / heart symptoms", tint: "from-rose-100/80 to-[#caf0f8]" };
  if (/(head|migraine)/.test(s))
    return { icon: Brain, label: "Head symptoms", tint: "from-violet-100/70 to-[#caf0f8]" };
  if (/(throat|cough|cold|flu|fever|congestion)/.test(s))
    return { icon: Thermometer, label: "Cold / flu–like", tint: "from-sky-100/70 to-[#caf0f8]" };
  if (/(stomach|nausea|vomit|diarrhea|abdomen|belly)/.test(s))
    return { icon: Pill, label: "Stomach / gut", tint: "from-amber-100/70 to-[#caf0f8]" };
  if (/(anxiety|panic|sleep|stress|dizzy)/.test(s))
    return { icon: Wind, label: "Nervous system / stress", tint: "from-teal-100/80 to-[#caf0f8]" };
  if (/(rash|skin|itch|hive)/.test(s))
    return { icon: Droplets, label: "Skin", tint: "from-emerald-100/70 to-[#caf0f8]" };
  return { icon: Stethoscope, label: "Your check-in", tint: "from-[#90e0ef]/40 to-[#caf0f8]" };
}
