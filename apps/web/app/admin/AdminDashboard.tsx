"use client";

import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import { format, parseISO, subDays, startOfDay } from "date-fns";
import { Users, Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion/FadeIn";
import { cn } from "@/lib/utils";

const URGENCY_COLORS: Record<string, string> = {
  low: "#22c55e", medium: "#f59e0b", high: "#f97316", critical: "#ef4444",
};

interface Case { id: string; created_at: string; urgency_level: string; score: number; user_id: string; }

export default function AdminDashboard({ cases, totalUsers }: { cases: Case[]; totalUsers: number }) {
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = startOfDay(subDays(new Date(), 13 - i));
    const dc = cases.filter((c) => startOfDay(parseISO(c.created_at)).getTime() === d.getTime());
    return {
      date: format(d, "MMM d"),
      low: dc.filter((c) => c.urgency_level === "low").length,
      medium: dc.filter((c) => c.urgency_level === "medium").length,
      high: dc.filter((c) => c.urgency_level === "high").length,
      critical: dc.filter((c) => c.urgency_level === "critical").length,
    };
  });

  const urgencyDist = ["low", "medium", "high", "critical"].map((u) => ({
    name: u.charAt(0).toUpperCase() + u.slice(1),
    count: cases.filter((c) => c.urgency_level === u).length,
    fill: URGENCY_COLORS[u],
  }));

  const scoreBuckets = Array.from({ length: 10 }, (_, i) => ({
    range: `${i * 10}–${i * 10 + 9}`,
    count: cases.filter((c) => c.score >= i * 10 && c.score < (i + 1) * 10).length,
  }));

  const highCriticalPct = cases.length
    ? Math.round((cases.filter((c) => c.urgency_level === "high" || c.urgency_level === "critical").length / cases.length) * 100)
    : 0;
  const avgScore = cases.length ? Math.round(cases.reduce((s, c) => s + (c.score || 0), 0) / cases.length) : 0;

  const stats = [
    { label: "Total users", value: totalUsers, icon: Users, iconBg: "bg-[#90e0ef]/20 text-[#03045e]" },
    { label: "Total check-ins", value: cases.length, icon: Activity, iconBg: "bg-[#90e0ef]/20 text-[#0077b6]" },
    { label: "High/critical rate", value: `${highCriticalPct}%`, icon: AlertTriangle, iconBg: "bg-red-50 text-red-500" },
    { label: "Avg triage score", value: avgScore, icon: TrendingUp, iconBg: "bg-amber-50 text-amber-600" },
  ];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 space-y-8" role="main">
      <FadeIn>
        <h1 className="text-headline text-[#03045e]">Analytics</h1>
        <p className="text-sm text-[#6b7280] mt-1">Platform-wide triage and usage insights</p>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StaggerItem key={s.label}>
            <div className="surface p-5">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.iconBg)}>
                <s.icon className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="text-2xl font-heading font-extrabold text-[#03045e]">{s.value}</div>
              <div className="text-xs text-[#6b7280] mt-0.5">{s.label}</div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeIn delay={0.2}>
        <div className="surface p-6">
          <h2 className="font-heading font-bold text-[#03045e] mb-6">Daily check-in volume (14 days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={last14} margin={{ top: 5, right: 20, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="low" name="Low" stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="medium" name="Medium" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="high" name="High" stroke="#f97316" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="critical" name="Critical" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </FadeIn>

      <div className="grid md:grid-cols-2 gap-6">
        <FadeIn delay={0.25}>
          <div className="surface p-6">
            <h2 className="font-heading font-bold text-[#03045e] mb-5">Urgency distribution</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={urgencyDist} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="count" name="Cases" radius={[8, 8, 0, 0]}>
                  {urgencyDist.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="surface p-6">
            <h2 className="font-heading font-bold text-[#03045e] mb-5">Triage score distribution</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreBuckets} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 12 }} />
                <Bar dataKey="count" name="Cases" fill="#0077b6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>
      </div>
    </main>
  );
}
