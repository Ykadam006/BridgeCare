import { cn } from "@/lib/utils";
import { Nav } from "./Nav";

interface PageWrapperProps {
  children: React.ReactNode;
  /** Sets max-width and centering of inner content */
  width?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
  /** Shows Nav. Disable on pages that render their own. */
  withNav?: boolean;
  /** Background override */
  bg?: string;
  /** Padding override */
  padding?: string;
}

const WIDTH_MAP: Record<NonNullable<PageWrapperProps["width"]>, string> = {
  sm: "max-w-lg",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-full",
};

export function PageWrapper({
  children,
  width = "md",
  className,
  withNav = true,
  bg = "bg-[#f3fbfd]",
  padding = "px-6 py-10",
}: PageWrapperProps) {
  return (
    <div className={cn("min-h-screen", bg)}>
      {withNav && <Nav />}
      <main
        id="main-content"
        tabIndex={-1}
        className={cn("mx-auto", WIDTH_MAP[width], padding, className)}
      >
        {children}
      </main>
    </div>
  );
}
