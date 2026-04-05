import type { Case } from "@/lib/case-types";

export const DEMO_CASE: Case = {
  id: "demo",
  chief_complaint: "Dizziness, chest tightness, anxiety, poor sleep — 3 days",
  urgency_level: "medium",
  urgency_label: "See a doctor within 1–3 days",
  score: 48,
  explanation:
    "Chest tightness and dizziness lasting 3 days warrants a check-up, even without classic emergency signs. Telehealth is the fastest first step.",
  red_flags: [],
  care_options: [
    {
      rank: 1,
      type: "Telehealth",
      notes: "Same-day or next-day. Likely covered by your plan.",
      cost_range: "$0–$50 with insurance",
      time_sensitivity: "Same-day available",
      why_this_fits: "Fast, private, and usually covered — perfect first step away from home.",
    },
    {
      rank: 2,
      type: "Campus health center",
      notes: "Often free or very low-cost with student ID.",
      cost_range: "$0–$30",
      time_sensitivity: "Usually same-day slots",
      distance_km: 0.9,
      why_this_fits: "The quickest in-person option if you're on campus.",
    },
    {
      rank: 3,
      type: "Urgent care",
      notes: "No appointment. Handles EKGs and same-day exams.",
      cost_range: "$100–$200",
      time_sensitivity: "Walk-in, today",
      distance_km: 2.0,
      why_this_fits: "Step up to this if symptoms worsen or telehealth isn't available.",
    },
  ],
  cost_estimate:
    "Telehealth: $0–$50 copay. Campus health: often free. Urgent care: $100–$200.",
  follow_up_in: "24–48 hours",
  warning_signs: [
    "Chest pain feels crushing or spreads to your arm/jaw",
    "Shortness of breath at rest",
    "Fainting or near-fainting",
    "Heart racing or skipping beats",
    "Symptoms suddenly much worse",
  ],
  visit_prep: {
    bring: [
      "Insurance card (parent's plan)",
      "Current medications list",
      "Note of when symptoms started",
    ],
    say: [
      "I've had dizziness and chest tightness for 3 days",
      "My sleep has been disrupted",
    ],
    ask: [
      "Could this be stress or anxiety-related?",
      "Should I get an EKG to rule out cardiac causes?",
      "What signs mean I should go to the ER?",
    ],
    go_sooner_if: [
      "Chest tightness gets worse or feels crushing",
      "You feel like you might faint",
      "Heart is racing or skipping",
    ],
  },
};
