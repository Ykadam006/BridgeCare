export const AGE_RANGES = [
  { value: "13-17", label: "13–17" },
  { value: "18-24", label: "18–24" },
  { value: "25-34", label: "25–34" },
  { value: "35-44", label: "35–44" },
  { value: "45+", label: "45 or older" },
  { value: "prefer-not", label: "Prefer not to say" },
] as const;

export const INSURANCE_STATUS = [
  { value: "parent-plan", label: "On parent's plan", icon: "👨‍👩‍👧" },
  { value: "student-plan", label: "Student health plan", icon: "🎓" },
  { value: "marketplace", label: "Marketplace / ACA plan", icon: "🏥" },
  { value: "medicaid", label: "Medicaid / CHIP", icon: "🛡️" },
  { value: "employer", label: "Employer plan", icon: "💼" },
  { value: "uninsured", label: "No insurance", icon: "💸" },
  { value: "unsure", label: "Not sure", icon: "🤔" },
] as const;

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "zh", label: "中文" },
  { value: "fr", label: "Français" },
  { value: "pt", label: "Português" },
  { value: "ar", label: "العربية" },
  { value: "hi", label: "हिन्दी" },
  { value: "other", label: "Other" },
] as const;

export const CARE_MODES = [
  {
    value: "quick",
    label: "Quick answer",
    description: "Just tell me what to do",
    icon: "⚡",
  },
  {
    value: "guided",
    label: "Walk me through it",
    description: "Explain things as we go",
    icon: "🧭",
  },
] as const;

export const URGENCY_LEVELS = {
  low: {
    label: "Self-care OK",
    color: "green",
    icon: "✓",
    ariaLabel: "Low urgency — self-care is likely appropriate",
  },
  medium: {
    label: "See a doctor soon",
    color: "amber",
    icon: "!",
    ariaLabel: "Medium urgency — schedule a visit within 1-3 days",
  },
  high: {
    label: "Urgent care today",
    color: "orange",
    icon: "!!",
    ariaLabel: "High urgency — seek urgent care today",
  },
  critical: {
    label: "Go to ER / Call 911",
    color: "red",
    icon: "!!!",
    ariaLabel: "Critical — seek emergency care immediately or call 911",
  },
} as const;

export const API_BASE = "/api/backend";

/** The one navigation used everywhere (desktop bar, mobile menu, mobile tab bar). */
export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/check", label: "Check symptoms" },
  { href: "/documents", label: "My documents" },
  { href: "/dashboard", label: "My history" },
  { href: "/safety", label: "Safety" },
] as const;
