/** Persisted / API case shape used on results and care-options pages. */
export interface CaseCareOption {
  type: string;
  notes?: string;
  cost_range?: string;
  why_this_fits?: string;
  time_sensitivity?: string;
  distance_km?: number;
  rank?: number;
}

export interface Case {
  id: string;
  chief_complaint: string;
  urgency_level: "low" | "medium" | "high" | "critical";
  urgency_label: string;
  score: number;
  explanation: string;
  red_flags: string[];
  care_options: CaseCareOption[];
  cost_estimate: string;
  follow_up_in: string;
  warning_signs?: string[];
  visit_prep?: {
    bring: string[];
    say: string[];
    ask: string[];
    go_sooner_if: string[];
  };
}
