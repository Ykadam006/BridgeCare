import * as React from "react";
import { clsx } from "clsx";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
  icon?: React.ReactNode;
}

const variants = {
  info: {
    wrap: "bg-[#f3fbfd] border-[#90e0ef] text-[#03045e]",
    iconWrap: "bg-[#90e0ef]/30 text-[#03045e]",
  },
  success: {
    wrap: "bg-green-50 border-green-300 text-green-800",
    iconWrap: "bg-green-100 text-green-600",
  },
  warning: {
    wrap: "bg-amber-50 border-amber-300 text-amber-800",
    iconWrap: "bg-amber-100 text-amber-600",
  },
  danger: {
    wrap: "bg-red-50 border-red-300 text-red-800",
    iconWrap: "bg-red-100 text-red-600",
  },
};

export function Alert({ variant = "info", title, icon, className, children, ...props }: AlertProps) {
  const s = variants[variant];
  return (
    <div
      role="alert"
      className={clsx("rounded-[20px] border p-4 flex gap-3", s.wrap, className)}
      {...props}
    >
      {icon && (
        <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", s.iconWrap)}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold text-sm mb-1">{title}</div>}
        <div className="text-sm opacity-90 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}
