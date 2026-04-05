import * as React from "react";
import { clsx } from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, hint, error, icon, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-semibold text-[#03045e] mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00b4d8]">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={clsx(
            "w-full h-[52px] rounded-[20px] border bg-white px-4 text-sm text-[#111827] placeholder-[#9ca3af]",
            "transition-all duration-[180ms]",
            "focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6]",
            error
              ? "border-red-400 focus:ring-red-400"
              : "border-[#d1d5db] hover:border-[#00b4d8]",
            icon && "pl-11",
            className
          )}
          {...props}
        />
      </div>
      {hint && !error && (
        <p className="mt-1.5 text-xs text-[#6b7280]">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1" role="alert">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export function Textarea({ label, hint, error, className, id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-[#03045e] mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={clsx(
          "w-full rounded-[20px] border bg-white px-4 py-3.5 text-sm text-[#111827] placeholder-[#9ca3af]",
          "transition-all duration-[180ms] resize-none",
          "focus:outline-none focus:ring-2 focus:ring-[#0077b6] focus:border-[#0077b6]",
          error ? "border-red-400" : "border-[#d1d5db] hover:border-[#00b4d8]",
          className
        )}
        {...props}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-[#6b7280]">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-red-600" role="alert">⚠ {error}</p>}
    </div>
  );
}
