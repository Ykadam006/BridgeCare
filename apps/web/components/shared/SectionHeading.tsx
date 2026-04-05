import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  /** Heading text */
  title: string;
  /** Optional subtitle/description below the title */
  subtitle?: string;
  /** Alignment */
  align?: "left" | "center";
  /** Use h1 on page title, h2 for sections */
  as?: "h1" | "h2" | "h3";
  /** Optional id for aria-labelledby */
  id?: string;
  className?: string;
  /** Small eyebrow label above the title */
  eyebrow?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = "left",
  as: Tag = "h2",
  id,
  className,
  eyebrow,
}: SectionHeadingProps) {
  const isCenter = align === "center";

  return (
    <div className={cn(isCenter && "text-center", className)}>
      {eyebrow && (
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 text-xs font-bold text-[#03045e] uppercase tracking-wider border border-[#90e0ef] bg-[#90e0ef]/10">
          {eyebrow}
        </div>
      )}
      <Tag
        id={id}
        className={cn(
          "font-heading font-bold text-[#03045e] tracking-tight",
          Tag === "h1"
            ? "text-[clamp(1.75rem,3.5vw,2.5rem)] leading-[1.15]"
            : Tag === "h2"
            ? "text-[clamp(1.4rem,2.5vw,2rem)] leading-[1.2]"
            : "text-[clamp(1.1rem,2vw,1.4rem)] leading-[1.3]"
        )}
      >
        {title}
      </Tag>
      {subtitle && (
        <p
          className={cn(
            "mt-2 text-[#6b7280] leading-relaxed",
            Tag === "h1" ? "text-base" : "text-sm",
            isCenter && "max-w-md mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
