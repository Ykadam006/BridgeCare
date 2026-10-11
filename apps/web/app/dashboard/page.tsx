"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { format, parseISO, subDays, startOfDay } from "date-fns";
import {
  MessageCircle, Bell, Clock, ChevronRight, Activity,
  TrendingUp, MapPin, Plus, ArrowRight, LayoutDashboard, FileText, Siren,
} from "lucide-react";
import { createClient } from "@/lib/supabase";
import { SafetyBanner } from "@/components/shared/SafetyBanner";
import { Nav } from "@/components/shared/Nav";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/FadeIn";
import { cn } from "@/lib/utils";

const URGENCY_COLORS: Record<string, string> = {
  low: "#22c55e", medium: "#f59e0b", high: "#f97316", critical: "#ef4444",
};
const URGENCY_LABELS: Record<string, string> = {
  low: "Self-care", medium: "See doctor", high: "Urgent care", critical: "ER / 911",
};

interface Case {
  id: string; created_at: string; chief_complaint: string;
  urgency_level: string; urgency_label: string; score: number;
}

interface Reminder {
  id: string; due_at: string; message: string; done: boolean; case_id: string | null;
}

export default function DashboardPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [userName, setUserName] = useState("there");
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); setIsGuest(true); return; }
      setUserName(user.user_metadata?.full_name?.split(" ")[0] || "there");

      const [casesRes, remindersRes] = await Promise.all([
        supabase.from("cases").select("id,created_at,chief_complaint,urgency_level,urgency_label,score")
          .eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        supabase.from("reminders").select("id,due_at,message,done,case_id")
          .eq("user_id", user.id).eq("done", false).order("due_at", { ascending: true }).limit(5),
      ]);
      setCases(casesRes.data || []);
      setReminders(remindersRes.data || []);
      setLoading(false);
    })();
  }, []);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = startOfDay(subDays(new Date(), 6 - i));
    const count = cases.filter((c) => startOfDay(parseISO(c.created_at)).getTime() === d.getTime()).length;
    return { date: format(d, "EEE"), count };
  });

  const urgencyDist = ["low", "medium", "high", "critical"]
    .map((u) => ({ name: URGENCY_LABELS[u], value: cases.filter((c) => c.urgency_level === u).length, color: URGENCY_COLORS[u] }))
    .filter((d) => d.value > 0);

  const stats = [
    { label: "Total check-ins", value: cases.length, icon: MessageCircle, iconBg: "bg-[#90e0ef]/20 text-[#03045e]" },
    { label: "This week", value: last7.reduce((s, d) => s + d.count, 0), icon: Activity, iconBg: "bg-[#90e0ef]/20 text-[#0077b6]" },
    { label: "Reminders", value: reminders.length, icon: Bell, iconBg: "bg-amber-50 text-amber-600" },
    { label: "Last urgency", value: cases[0] ? URGENCY_LABELS[cases[0].urgency_level] : "—", icon: Clock, iconBg: "bg-[#f3fbfd] text-[#0077b6]" },
  ];

  /* ── Guest / unauthenticated state ───────────────────────────────────────── */
  if (!loading && isGuest) {
    return (
      <div className="min-h-screen bg-[#f3fbfd]">
        <Nav />
        <main id="main-content" className="mx-auto max-w-lg px-6 py-20 text-center" tabIndex={-1}>
          <FadeIn>
            <div className="w-16 h-16 rounded-full bg-[#90e0ef]/20 flex items-center justify-center mx-auto mb-6">
              <LayoutDashboard className="w-7 h-7 text-[#0077b6]" aria-hidden="true" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-[#03045e] mb-3">My history</h1>
            <p className="text-[#6b7280] mb-2 leading-relaxed">
              Sign in to save your check-ins, track reminders, and review past results.
            </p>
            <p className="text-sm text-[#6b7280] mb-8">
              No password needed — we use magic links.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/login" className="btn-primary">
                Sign in to save history
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <Link href="/check" className="btn-secondary">
                Start a check (guest)
              </Link>
            </div>
          </FadeIn>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3fbfd]">
      <Nav />
      <main id="main-content" className="mx-auto max-w-5xl px-6 py-10 space-y-8" tabIndex={-1}>

        {/* Header */}
        <div>
          <h1 className="text-headline">My history</h1>
          <p className="mt-1 text-[#374151]">Hi {userName}. Your past check-ins, reminders and quick links.</p>
        </div>

        {/* Quick actions — every main task one click away */}
        <nav aria-label="Quick actions">
          <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-3" role="list">
            {[
              { href: "/check", icon: Plus, title: "New symptom check", body: "Get urgency and next steps" },
              { href: "/documents", icon: FileText, title: "My documents", body: "Ask about lab results and notes" },
              { href: "/safety", icon: Siren, title: "Emergency signs", body: "When to call 911 or go to the ER" },
            ].map(({ href, icon: Icon, title, body }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex h-full items-center gap-3 rounded-2xl border-2 border-brand-pale bg-white p-4 transition-colors hover:border-brand-sky focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-light"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-pale" aria-hidden="true">
                    <Icon className="h-5 w-5 text-brand-navy" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-heading font-bold text-brand-navy">{title}</span>
                    <span className="block text-sm text-[#4b5563]">{body}</span>
                  </span>
                  <ChevronRight className="ml-auto h-5 w-5 shrink-0 text-brand-blue" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Stats */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <StaggerItem key={s.label}>
              <div className="surface p-5 h-full">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.iconBg)}>
                  <s.icon className="w-4 h-4" aria-hidden="true" />
                </div>
                <div className="text-2xl font-heading font-extrabold text-[#03045e]">{loading ? "—" : s.value}</div>
                <div className="text-xs text-[#6b7280] mt-0.5">{s.label}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Activity chart */}
          <FadeIn delay={0.2} className="md:col-span-2">
            <div className="surface p-6 h-full">
              <h2 className="font-heading font-bold text-[#03045e] mb-5">Activity (7 days)</h2>
              {cases.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center gap-3 text-[#6b7280]">
                  <Activity className="w-10 h-10 text-[#90e0ef]/40" aria-hidden="true" />
                  <p className="text-sm">No check-ins yet</p>
                  <Link href="/check" className="btn-primary !h-9 !px-4 !text-sm">Start your first</Link>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={176}>
                  <AreaChart data={last7} margin={{ top: 5, right: 5, bottom: 0, left: -30 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0077b6" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#0077b6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e5e7eb", fontSize: 12, padding: "8px 12px" }} />
                    <Area type="monotone" dataKey="count" name="Check-ins" stroke="#0077b6" strokeWidth={2} fill="url(#areaGrad)" dot={{ r: 3, fill: "#0077b6", strokeWidth: 0 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </FadeIn>

          {/* Urgency breakdown */}
          <FadeIn delay={0.25}>
            <div className="surface p-6 h-full">
              <h2 className="font-heading font-bold text-[#03045e] mb-4">Urgency breakdown</h2>
              {urgencyDist.length === 0 ? (
                <div className="h-36 flex items-center justify-center text-[#6b7280] text-sm">No data yet</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={urgencyDist} cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={3} dataKey="value">
                        {urgencyDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {urgencyDist.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} aria-hidden="true" />
                        <span className="text-[#6b7280] flex-1">{d.name}</span>
                        <span className="font-bold text-[#03045e]">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </FadeIn>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent cases */}
          <FadeIn delay={0.3}>
            <div className="surface p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-bold text-[#03045e]">Recent check-ins</h2>
                <Link href="/check" className="text-xs text-[#0077b6] hover:text-[#03045e] flex items-center gap-1 transition-colors">
                  New <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-[16px]" />)}
                </div>
              ) : cases.length === 0 ? (
                <div className="text-center py-8 text-[#6b7280] text-sm">No check-ins yet.</div>
              ) : (
                <div className="space-y-2">
                  {cases.slice(0, 5).map((c) => (
                    <Link
                      key={c.id}
                      href={`/results/${c.id}`}
                      className="flex items-start gap-3 p-3 rounded-[16px] hover:bg-[#f3fbfd] hover:border-[#90e0ef]/30 border border-transparent transition"
                    >
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: URGENCY_COLORS[c.urgency_level] }} aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[#374151] truncate">{c.chief_complaint}</div>
                        <div className="text-xs text-[#6b7280] mt-0.5">
                          {format(parseISO(c.created_at), "MMM d, h:mm a")} · {URGENCY_LABELS[c.urgency_level]}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#6b7280] flex-shrink-0 mt-0.5" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>

          {/* Reminders */}
          <FadeIn delay={0.35}>
            <div className="surface p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-bold text-[#03045e]">Reminders</h2>
                <Bell className="w-4 h-4 text-[#90e0ef]" aria-hidden="true" />
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-[16px]" />)}
                </div>
              ) : reminders.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-8 h-8 text-[#90e0ef]/30 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-sm text-[#6b7280]">No upcoming reminders</p>
                  <p className="text-xs text-[#6b7280] mt-1">Complete a check-in to get follow-up reminders</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reminders.map((r) => (
                    <Link key={r.id} href={r.case_id ? `/followup/${r.case_id}` : "/check"} className="block p-3.5 rounded-[16px] bg-amber-50 border border-amber-100 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
                      <div className="text-sm text-[#374151] mb-1">{r.message}</div>
                      <div className="text-xs text-amber-700 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        {format(parseISO(r.due_at), "EEE, MMM d 'at' h:mm a")}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </FadeIn>
        </div>

        <SafetyBanner variant="inline" />
      </main>
    </div>
  );
}
