import type { Metadata, Viewport } from "next";
import { Manrope, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { MobileNav } from "@/components/shared/MobileNav";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "BridgeCare — Your calm health guide",
    template: "%s — BridgeCare",
  },
  description:
    "Tell us what's going on. We'll help you understand urgency, care options, cost direction, and next steps — without the anxiety spiral.",
  keywords: ["health navigation", "triage", "care options", "Gen Z health", "student health"],
  openGraph: {
    title: "BridgeCare",
    description: "AI health navigation for Gen Z. Calm, clear, and actionable.",
    type: "website",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0077b6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`} data-scroll-behavior="smooth">
      <body className="font-body antialiased bg-brand-wash text-[#374151] pb-16 md:pb-0" suppressHydrationWarning>
        {/* Skip to main content — critical for keyboard and screen reader users */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        <MobileNav />
        <Toaster
          position="top-center"
          toastOptions={{
            className: "!rounded-[20px] !shadow-lg !text-sm !font-body",
            success: { iconTheme: { primary: "#0077b6", secondary: "#f3fbfd" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            duration: 4000,
          }}
        />
      </body>
    </html>
  );
}
