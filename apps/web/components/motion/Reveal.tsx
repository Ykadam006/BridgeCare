// Renders content immediately (see FadeIn.tsx for why the scroll-in animation was removed).
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return <div className={className}>{children}</div>;
}
