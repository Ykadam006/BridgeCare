"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { Heart, Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  }

  return (
    <main id="main-content" className="min-h-screen bg-[#f3fbfd] flex flex-col items-center justify-center px-6" tabIndex={-1}>

      {/* Logo */}
      <Link
        href="/"
        aria-label="BridgeCare — go to home"
        className="flex items-center gap-2 mb-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0077b6] rounded-xl"
      >
        <div className="w-9 h-9 rounded-[14px] bg-gradient-to-br from-[#0077b6] to-[#0077b6] flex items-center justify-center" aria-hidden="true">
          <Heart className="w-4 h-4 text-white fill-white" aria-hidden="true" />
        </div>
        <span className="font-heading font-extrabold text-lg text-[#03045e]">BridgeCare</span>
      </Link>

      <div className="w-full max-w-sm">
        {sent ? (
          /* ── Success state ── */
          <div className="surface p-8 text-center space-y-4" role="status" aria-live="polite" aria-atomic="true">
            <div className="w-14 h-14 rounded-full bg-[#90e0ef]/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-[#0077b6]" aria-hidden="true" />
            </div>
            <h1 className="font-heading font-bold text-xl text-[#03045e]">Check your email</h1>
            <p className="text-sm text-[#6b7280] leading-relaxed">
              We sent a magic link to <strong className="text-[#374151]">{email}</strong>.
              Click it to sign in — no password needed.
            </p>
            <p className="text-xs text-[#6b7280]">Didn't get it? Check your spam folder.</p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="text-sm text-[#0077b6] hover:text-[#03045e] transition-colors underline underline-offset-2"
            >
              Try a different email
            </button>
          </div>
        ) : (
          /* ── Login form ── */
          <div className="surface p-8 space-y-6">
            <div className="space-y-1">
              <h1 className="font-heading font-bold text-2xl text-[#03045e]">Sign in</h1>
              <p className="text-sm text-[#6b7280]">
                We'll send a magic link to your email — no password needed.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-[#374151]">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" aria-hidden="true" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-[52px] pl-10 pr-4 rounded-[16px] border border-[#e5e7eb] bg-white text-base text-[#374151] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0077b6]/30 focus:border-[#0077b6] transition"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-[12px] px-4 py-2.5" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                aria-busy={loading}
                aria-label={loading ? "Sending magic link…" : "Send magic link"}
                className="btn-primary w-full gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Sending…</span>
                  </>
                ) : (
                  <>
                    Send magic link
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-[#f0f0f0] text-center">
              <p className="text-xs text-[#6b7280]">
                No account? One will be created automatically.
              </p>
            </div>
          </div>
        )}

        {/* Continue as guest */}
        <div className="mt-6 text-center">
          <p className="text-sm text-[#6b7280]">
            Just browsing?{" "}
            <Link href="/check" className="text-[#0077b6] hover:text-[#03045e] font-medium transition-colors">
              Start a check without signing in →
            </Link>
          </p>
        </div>
      </div>

      {/* Safety note */}
      <p className="mt-10 text-xs text-[#6b7280] text-center max-w-xs">
        BridgeCare is for guidance only — not medical advice. In an emergency, call 911.
      </p>
    </main>
  );
}
