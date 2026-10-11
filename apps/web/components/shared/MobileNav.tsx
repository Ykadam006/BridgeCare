"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Stethoscope, FileText, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";

// Same destinations as the header (minus Safety, which is in the menu) — big thumb-sized tabs.
const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/check", label: "Check", icon: Stethoscope },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/dashboard", label: "History", icon: History },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const [due, setDue] = useState(0);

  // Follow-up reminders that are due now (RLS limits rows to the signed-in user). Re-checked on
  // navigation so the badge clears after a follow-up is answered.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return setDue(0);
      supabase.from("reminders").select("id", { count: "exact", head: true })
        .eq("done", false).lte("due_at", new Date().toISOString())
        .then(({ count }) => setDue(count ?? 0));
    });
  }, [pathname]);

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
                <span className={cn("relative flex h-8 w-12 items-center justify-center rounded-xl", active && "bg-brand-pale")}>
                  <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={active ? 2.5 : 2} />
                  {href === "/dashboard" && due > 0 && (
                    <span className="absolute -right-0.5 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-600 px-1 text-[11px] font-bold text-white" aria-hidden="true">
                      {due}
                    </span>
                  )}
                </span>
                {label}
                {href === "/dashboard" && due > 0 && <span className="sr-only">, {due} follow-up{due > 1 ? "s" : ""} due</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
