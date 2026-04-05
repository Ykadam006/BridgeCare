import * as React from "react";
import { clsx } from "clsx";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  primary:
    "bg-[#0077b6] text-white hover:bg-[#03045e] focus-visible:ring-[#0077b6] shadow-sm shadow-[#0077b6]/20 hover:shadow-md hover:shadow-[#0077b6]/25",
  secondary:
    "bg-[#90e0ef]/20 text-[#03045e] border border-[#90e0ef] hover:bg-[#90e0ef]/30 focus-visible:ring-[#90e0ef]",
  ghost:
    "text-[#0077b6] hover:bg-[#90e0ef]/30 focus-visible:ring-[#90e0ef]",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm",
};

const sizes = {
  sm: "px-4 py-2 text-sm h-9",
  md: "px-5 py-2.5 text-sm h-12",
  lg: "px-7 py-3 text-base h-[48px]",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-semibold rounded-[20px] transition-all duration-[180ms]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
