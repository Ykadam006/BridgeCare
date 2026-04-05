"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Stethoscope, FileText, History } from "lucide-react";
import { cn } from "@/lib/utils";

// Same destinations as the header (minus Safety, which is in the menu) — big thumb-sized tabs.
const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/check", label: "Check", icon: Stethoscope },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/dashboard", label: "History", icon: History },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-light/60 bg-white md:hidden"
      aria-label="Mobile tab bar"
    >
      <ul className="m-0 flex list-none items-stretch p-0" role="list">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-1 py-2 text-xs font-semibold",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-blue",
                  active ? "text-brand-navy" : "text-[#4b5563]"
                )}
              >
                <span className={cn("flex h-8 w-12 items-center justify-center rounded-xl", active && "bg-brand-pale")}>
                  <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={active ? 2.5 : 2} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
