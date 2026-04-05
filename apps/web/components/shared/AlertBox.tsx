import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "warning" | "error" | "emergency";

interface AlertBoxProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  /** Use role="alert" + aria-live="assertive" for urgent messages */
  assertive?: boolean;
  /** Hide the icon */
  noIcon?: boolean;
}

const CONFIG: Record<
  AlertVariant,
  { bg: string; border: string; text: string; icon: typeof Info; iconColor: string }
> = {
  info: {
    bg: "bg-[#f3fbfd]",
    border: "border-[#90e0ef]",
    text: "text-[#03045e]",
    icon: Info,
    iconColor: "text-[#0077b6]",
  },
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-900",
    icon: CheckCircle2,
    iconColor: "text-green-600",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    icon: XCircle,
    iconColor: "text-red-600",
  },
  emergency: {
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-900",
    icon: AlertTriangle,
    iconColor: "text-red-600",
  },
};

export function AlertBox({
  variant = "info",
  title,
  children,
  className,
  assertive = false,
  noIcon = false,
}: AlertBoxProps) {
  const { bg, border, text, icon: Icon, iconColor } = CONFIG[variant];
  const isEmergency = variant === "emergency";

  return (
    <div
      role={assertive || isEmergency ? "alert" : "note"}
      aria-live={assertive || isEmergency ? "assertive" : "polite"}
      className={cn(
        "rounded-[20px] border-2 p-4 flex items-start gap-3",
        bg,
        border,
        className
      )}
    >
      {!noIcon && (
        <Icon
          className={cn("w-5 h-5 flex-shrink-0 mt-0.5", iconColor)}
          aria-hidden="true"
        />
      )}
      <div className="flex-1 min-w-0">
        {title && (
          <p className={cn("font-bold text-sm mb-0.5", text)}>{title}</p>
        )}
        <div className={cn("text-sm leading-relaxed", text)}>{children}</div>
      </div>
    </div>
  );
}
