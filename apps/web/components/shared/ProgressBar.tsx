"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ current, total, label, className }: ProgressBarProps) {
  const reduced = useReducedMotion();
  const pct = Math.round((current / total) * 100);

  return (
    <div className={cn("w-full", className)} role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total} aria-label={label || `Step ${current} of ${total}`}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-[#03045e]">{label}</span>
          <span className="text-xs text-[#6b7280]">{current} / {total}</span>
        </div>
      )}
      <div className="progress-track">
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={reduced ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

interface StepDotsProps {
  current: number;
  total: number;
  className?: string;
}

export function StepDots({ current, total, className }: StepDotsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} role="list" aria-label="Step progress">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          role="listitem"
          aria-label={`Step ${i + 1}${i + 1 === current ? " (current)" : i + 1 < current ? " (completed)" : ""}`}
          className={cn(
            "rounded-full transition-[width,background-color] duration-[240ms]",
            i + 1 < current
              ? "w-2 h-2 bg-[#0077b6]"
              : i + 1 === current
              ? "w-6 h-2 bg-[#0077b6]"
              : "w-2 h-2 bg-[#90e0ef]/40"
          )}
        />
      ))}
    </div>
  );
}
