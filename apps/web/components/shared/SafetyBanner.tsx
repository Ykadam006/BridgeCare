import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafetyBannerProps {
  variant?: "footer" | "inline" | "emergency";
  className?: string;
}

export function SafetyBanner({ variant = "footer", className }: SafetyBannerProps) {
  if (variant === "emergency") {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className={cn(
          "rounded-[20px] bg-red-50 border-2 border-red-300 p-4 flex items-start gap-3",
          className
        )}
      >
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="font-bold text-red-900 text-sm">This sounds like an emergency.</p>
          <p className="text-sm text-red-800 mt-0.5">
            Please call <a href="tel:911" className="font-bold underline">911</a> or go to the nearest emergency room immediately.
          </p>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <p className={cn("text-xs text-[#6b7280] text-center leading-relaxed", className)}>
        <strong>Not a medical provider.</strong> For emergencies, call{" "}
        <a href="tel:911" className="font-bold text-red-600 underline">911</a>.
        BridgeCare helps you navigate — your doctor helps you heal.
      </p>
    );
  }

  return (
    <div className={cn("border-t border-[#e5e7eb] py-6 px-6 text-center", className)}>
      <p className="text-xs text-[#6b7280] max-w-2xl mx-auto leading-relaxed">
        <strong>BridgeCare is a health navigation tool, not a medical provider.</strong>{" "}
        It does not diagnose conditions or replace professional medical advice.
        In an emergency, call <a href="tel:911" className="font-bold text-red-600 underline">911</a> or go to your nearest ER.
      </p>
    </div>
  );
}
