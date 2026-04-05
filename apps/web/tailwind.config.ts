import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#f3fbfd",
        surface: "#ffffff",
        // Brand palette. Text: navy anywhere, blue on white only (4.9:1). Sky/light/pale are
        // fills, borders and icons; as text they only pass on navy.
        brand: {
          navy: "#03045e",
          blue: "#0077b6",
          sky: "#00b4d8",
          light: "#90e0ef",
          pale: "#caf0f8",
          wash: "#f3fbfd", // page background, a tint of pale
        },
      },
      fontFamily: {
        heading: ["var(--font-manrope)", "Manrope", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "20px",
        sm: "12px",
        md: "16px",
        lg: "20px",
        xl: "24px",
        "2xl": "28px",
        "3xl": "32px",
        full: "9999px",
      },
      spacing: {
        section: "72px",
      },
      height: {
        input: "52px",
        button: "48px",
      },
      fontSize: {
        "display-lg": ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "800" }],
        "display": ["2.75rem", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "800" }],
        "display-sm": ["2rem", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
        "heading": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.015em", fontWeight: "700" }],
        "subheading": ["1.125rem", { lineHeight: "1.4", fontWeight: "600" }],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 8px rgba(0,0,0,0.04), 0 12px 32px rgba(3,4,94,0.08)",
        glow: "0 0 40px rgba(144,224,239, 0.4)",
        cta: "0 4px 16px rgba(0,119,182, 0.3)",
        "cta-hover": "0 6px 24px rgba(3,4,94, 0.4)",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #f3fbfd 0%, #f3fbfd 40%, #caf0f8 100%)",
        "teal-gradient": "linear-gradient(135deg, #90e0ef 0%, #00b4d8 50%, #03045e 100%)",
        "hero-mesh": "radial-gradient(at 20% 10%, rgba(144,224,239,0.5) 0%, transparent 60%), radial-gradient(at 80% 20%, rgba(144,224,239,0.4) 0%, transparent 50%), radial-gradient(at 60% 80%, rgba(0,180,216,0.2) 0%, transparent 50%)",
        "card-shine": "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)",
      },
      animation: {
        "fade-up": "fadeUp 240ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fadeIn 180ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scaleIn 200ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "shimmer": "shimmer 1.6s linear infinite",
        "pulse-soft": "pulseSoft 3s ease-in-out infinite",
        "check-bounce": "checkBounce 400ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        checkBounce: {
          "0%": { opacity: "0", transform: "scale(0.5)" },
          "60%": { transform: "scale(1.1)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
