import * as React from "react";
import { clsx } from "clsx";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "low" | "medium" | "high" | "critical";
}

const variants = {
  default: "bg-[#f3f4f6] text-[#374151] border-[#e5e7eb]",
  primary: "bg-[#90e0ef]/25 text-[#03045e] border-[#90e0ef]",
  low: "bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]",
  medium: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]",
  high: "bg-[#fff7ed] text-[#9a3412] border-[#fed7aa]",
  critical: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]",
};

const DOTS: Record<string, string> = {
  low: "bg-green-500",
  medium: "bg-amber-500",
  high: "bg-orange-500",
  critical: "bg-red-500",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  const dot = DOTS[variant];
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={clsx("w-1.5 h-1.5 rounded-full", dot)} aria-hidden="true" />}
      {children}
    </span>
  );
}
