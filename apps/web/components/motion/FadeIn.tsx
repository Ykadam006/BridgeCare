"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// These used to start content at opacity 0 and fade it in with JS. When JS was slow or the tab
// was in the background, pages stayed blank or washed out — so they now render content as-is.
// The props are kept so existing pages don't change.

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export function FadeIn({ children, className, as = "div" }: FadeInProps) {
  const El = as as "div";
  return <El className={className}>{children}</El>;
}

export function StaggerContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

// Hover lift only: it starts from the resting position, so content is visible even before JS runs.
export function StaggerItem({
  children,
  className,
  liftOnHover,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  liftOnHover?: boolean;
}) {
  const reduced = useReducedMotion();
  if (!liftOnHover || reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.div>
  );
}
