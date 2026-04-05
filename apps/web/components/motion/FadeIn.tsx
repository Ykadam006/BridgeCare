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

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  liftOnHover?: boolean;
}) {
  return <div className={className}>{children}</div>;
}
