import * as React from "react";
import { clsx } from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "tinted" | "outlined";
  interactive?: boolean;
}

const variants = {
  default: "bg-white border border-[#e5e7eb] shadow-sm",
  glass: "bg-white/70 backdrop-blur-xl border border-white/40 shadow-md",
  tinted: "bg-[#f3fbfd] border border-[#90e0ef]/30",
  outlined: "bg-transparent border-2 border-[#90e0ef]",
};

export function Card({ variant = "default", interactive = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-[20px] p-6",
        variants[variant],
        interactive && "cursor-pointer transition-all duration-[180ms] hover:shadow-md hover:-translate-y-0.5 hover:border-[#0077b6]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={clsx("font-bold text-[#03045e] text-lg leading-snug", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx("text-sm text-[#374151] leading-relaxed", className)} {...props}>
      {children}
    </div>
  );
}
