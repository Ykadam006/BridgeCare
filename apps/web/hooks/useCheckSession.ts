"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TriageResult } from "@/lib/api";

export interface CheckProfile {
  age_range?: string;
  zip?: string;
  insurance_status?: string;
  language?: string;
  mode?: "quick" | "guided";
  accessibility?: { reduced_motion?: boolean; large_text?: boolean };
}

interface CheckMessage {
  role: "user" | "assistant";
  content: string;
}

interface CheckSession {
  session_id: string | null;
  profile: CheckProfile;
  messages: CheckMessage[];
  case_id: string | null;
  step: "onboarding" | "intake" | "done";
  triageResult: TriageResult | null;

  setSessionId: (id: string) => void;
  setProfile: (p: Partial<CheckProfile>) => void;
  addMessage: (m: CheckMessage) => void;
  setCaseId: (id: string) => void;
  setStep: (s: CheckSession["step"]) => void;
  setTriageResult: (r: TriageResult) => void;
  reset: () => void;
}

const INITIAL: Pick<
  CheckSession,
  "session_id" | "profile" | "messages" | "case_id" | "step" | "triageResult"
> = {
  session_id: null,
  profile: {},
  messages: [],
  case_id: null,
  step: "onboarding",
  triageResult: null,
};

export const useCheckSession = create<CheckSession>()(
  persist(
    (set) => ({
      ...INITIAL,
      setSessionId: (id) => set({ session_id: id }),
      setProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
      addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
      setCaseId: (id) => set({ case_id: id }),
      setStep: (step) => set({ step }),
      setTriageResult: (r) => set({ triageResult: r }),
      reset: () => set(INITIAL),
    }),
    { name: "bridgecare-check-session" }
  )
);
