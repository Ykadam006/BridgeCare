"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Heart, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";

/** The same header on every page: logo, the five places you can go, and "Start a check". */
export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  const linkClass = (href: string) =>
    cn(
      "rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue",
      isActive(href)
        ? "bg-brand-pale text-brand-navy"
        : "text-[#374151] hover:bg-brand-pale/60 hover:text-brand-navy"
    );

  return (
    <>
      <header role="banner" className="fixed inset-x-0 top-0 z-50 border-b border-brand-light/60 bg-white">
        <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6" aria-label="Main navigation">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            aria-label="BridgeCare home"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-navy" aria-hidden="true">
              <Heart className="h-4 w-4 text-brand-sky" strokeWidth={2.5} />
            </span>
            <span className="font-heading text-lg font-extrabold text-brand-navy">BridgeCare</span>
          </Link>

          <ul className="m-0 hidden list-none items-center gap-1 p-0 lg:flex" role="list">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={linkClass(href)} aria-current={isActive(href) ? "page" : undefined}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href="/check"
              className="hidden h-10 items-center gap-2 rounded-xl bg-brand-blue px-4 text-sm font-bold text-white transition-colors hover:bg-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 sm:inline-flex"
            >
              Start a check
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              className="rounded-xl p-2 text-brand-navy hover:bg-brand-pale lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <nav id="mobile-menu" className="border-t border-brand-light/60 bg-white px-4 pb-4 pt-2 lg:hidden" aria-label="Mobile navigation">
            <ul className="m-0 flex list-none flex-col gap-1 p-0" role="list">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={cn(linkClass(href), "block px-4 py-3 text-base")} aria-current={isActive(href) ? "page" : undefined}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/check"
              className="mt-3 flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-blue font-bold text-white hover:bg-brand-navy"
            >
              Start a check
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </nav>
        )}
      </header>

      <div className="h-16" aria-hidden="true" />
    </>
  );
}
