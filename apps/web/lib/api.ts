import type { Case } from "@/lib/case-types";
import { createClient } from "@/lib/supabase";

const BASE = "/api/backend";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  // The API identifies the user from this token — never from a user_id in the body.
  // If Supabase is unreachable, carry on as a guest rather than failing the check-in.
  const token = await createClient()
    .auth.getSession()
    .then(({ data }) => data.session?.access_token)
    .catch(() => undefined);
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      // FormData sets its own multipart Content-Type (with boundary)
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const detail = await res
      .json()
      .then((j) => (typeof j.detail === "string" ? j.detail : null))
      .catch(() => null);
    throw new Error(detail ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

// ── Triage ────────────────────────────────────────────────────────────────────

export interface TriageStartPayload {
  profile: {
    age_range?: string;
    zip?: string;
    insurance_status?: string;
    language?: string;
    mode?: string;
  };
}

export type TriageProfilePayload = {
  age_range?: string;
  zip?: string;
  insurance_status?: string;
  language?: string;
  mode?: string;
};

export interface TriageFollowupPayload {
  session_id: string;
  messages: { role: string; content: string }[];
  profile?: TriageProfilePayload;
}

export interface TriageFinalizePayload {
  session_id: string;
  messages: { role: string; content: string }[];
  profile?: TriageProfilePayload;
}

export const triageApi = {
  start: (payload: TriageStartPayload) =>
    request<{ session_id: string; first_question: string }>("/triage/start", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  followup: (payload: TriageFollowupPayload) =>
    request<{ reply: string; done: boolean; progress: number }>("/triage/followup", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  finalize: (payload: TriageFinalizePayload) =>
    request<{ case_id: string; triage: TriageResult }>("/triage/finalize", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getCase: (caseId: string) => request<Case>(`/triage/case/${caseId}`),
};

// ── Providers ─────────────────────────────────────────────────────────────────

export const providersApi = {
  search: (params: { lat?: number; lon?: number; q?: string; type?: string }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))
    );
    return request<{ providers: Provider[]; lat: number; lon: number }>(`/providers/search?${qs}`);
  },

  recommended: (caseId: string) =>
    request<{ providers: Provider[] }>(`/providers/recommended/${caseId}`),
};

// ── Coverage ──────────────────────────────────────────────────────────────────

export const coverageApi = {
  explain: (payload: { insurance_status: string; age_range?: string; case_id?: string }) =>
    request<CoverageExplanation>("/coverage/explain", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ── Follow-up ─────────────────────────────────────────────────────────────────

export const followupApi = {
  checkin: (payload: { case_id: string; got_care: boolean | null; feeling: string; notes?: string }) =>
    request<{ ok: boolean; saved: boolean; summary: string }>("/followup/checkin", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// ── Documents ─────────────────────────────────────────────────────────────────

export interface HealthDocument {
  id: string;
  title: string;
  page_count: number | null;
  chunk_count: number;
  created_at: string;
}

export interface DocumentSource {
  n: number;
  document_id: string;
  title: string;
  page: number | null;
  excerpt: string;
  similarity: number;
}

export const documentsApi = {
  list: () => request<HealthDocument[]>("/documents"),

  upload: (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return request<{ id: string; title: string; chunk_count: number }>("/documents", { method: "POST", body });
  },

  remove: (id: string) => request<{ ok: boolean }>(`/documents/${id}`, { method: "DELETE" }),

  ask: (question: string) =>
    request<{ answer: string; sources: DocumentSource[] }>("/documents/ask", {
      method: "POST",
      body: JSON.stringify({ question }),
    }),
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface TriageResult {
  urgency_level: "low" | "medium" | "high" | "critical";
  urgency_label: string;
  score: number;
  red_flags: string[];
  explanation: string;
  care_options: CareOption[];
  cost_estimate: string;
  follow_up_in: string;
  chief_complaint: string;
  visit_prep?: VisitPrep;
  warning_signs?: string[];
}

export interface CareOption {
  type: string;
  notes?: string;
  cost_range?: string;
  time_sensitivity?: string;
  distance_km?: number;
  why_this_fits?: string;
  rank: number;
}

export interface Provider {
  id: string;
  name: string;
  type: string;
  address: string;
  lat: number | null; // null for telehealth
  lon: number | null;
  phone?: string;
  open_now?: boolean;
  accepts_uninsured?: boolean;
  distance_km?: number;
  wait_time?: string;
  cost_range?: string;
}

export interface CoverageExplanation {
  summary: string;
  path: string;
  details: {
    title: string;
    body: string;
    applicable: boolean;
  }[];
  glossary: { term: string; definition: string }[];
}

export interface VisitPrep {
  bring: string[];
  say: string[];
  ask: string[];
  go_sooner_if: string[];
}
