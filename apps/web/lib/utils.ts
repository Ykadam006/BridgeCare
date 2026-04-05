import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getUrgencyClass(level: string): string {
  return {
    low: "urgency-low",
    medium: "urgency-medium",
    high: "urgency-high",
    critical: "urgency-critical",
  }[level] ?? "urgency-low";
}

export function truncate(str: string, n: number): string {
  return str.length > n ? `${str.slice(0, n)}…` : str;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
