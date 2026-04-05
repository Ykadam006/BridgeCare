/**
 * BridgeCare Design Tokens
 * Teal palette — calm, fresh, safe, modern.
 */

export const colors = {
  bg: "#f3fbfd",
  surface: "#ffffff",
  primary: {
    50: "#90e0ef",
    100: "#90e0ef",
    200: "#90e0ef",
    300: "#00b4d8",
    400: "#00b4d8",
    500: "#0077b6",
    600: "#0077b6",
    700: "#0077b6",
    800: "#0077b6", // main CTA
    900: "#03045e", // CTA hover / strongest heading
  },
  urgency: {
    low: { bg: "#f0fdf4", border: "#bbf7d0", text: "#166534", dot: "#22c55e" },
    medium: { bg: "#fffbeb", border: "#fde68a", text: "#92400e", dot: "#f59e0b" },
    high: { bg: "#fff7ed", border: "#fed7aa", text: "#9a3412", dot: "#f97316" },
    critical: { bg: "#fef2f2", border: "#fecaca", text: "#991b1b", dot: "#ef4444" },
  },
  neutral: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
} as const;

export const typography = {
  fontHeading: "var(--font-manrope), 'Manrope', system-ui, sans-serif",
  fontBody: "var(--font-inter), 'Inter', system-ui, sans-serif",
} as const;

export const spacing = {
  section: "72px",
  cardPad: "24px",
  inputH: "52px",
  buttonH: "48px",
  radius: "20px",
} as const;

export const motion = {
  duration: { fast: 180, base: 240, slow: 280 },
  ease: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;
