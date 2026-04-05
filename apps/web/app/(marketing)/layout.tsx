import Link from "next/link";
import { Heart } from "lucide-react";
import { Nav } from "@/components/shared/Nav";
import { NAV_LINKS } from "@/lib/constants";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "hello@bridgecare.app";

const footerLink =
  "text-brand-pale hover:text-white underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky rounded";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />

      <main id="main-content" className="flex-1" tabIndex={-1}>
        {children}
      </main>

      <footer className="bg-brand-navy text-brand-pale" aria-label="Site footer">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue" aria-hidden="true">
                <Heart className="h-4 w-4 text-white" strokeWidth={2.5} />
              </span>
              <span className="font-heading text-lg font-extrabold text-white">BridgeCare</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed">
              Calm help figuring out how urgent something is, where to go, and what it might cost.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Go to</h2>
            <ul className="m-0 mt-3 grid list-none grid-cols-2 gap-2 p-0 text-sm" role="list">
              {[...NAV_LINKS, { href: "/about", label: "About" }, { href: "/privacy", label: "Privacy" }, { href: "/terms", label: "Terms" }].map(
                ({ href, label }) => (
                  <li key={href}>
                    <Link href={href} className={footerLink}>
                      {label}
                    </Link>
                  </li>
                )
              )}
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className={footerLink}>
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <div className="rounded-2xl border border-brand-sky/40 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Need help right now?</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Emergency: call{" "}
              <a href="tel:911" className="font-bold text-white underline">
                911
              </a>
              . Emotional crisis: call or text{" "}
              <a href="tel:988" className="font-bold text-white underline">
                988
              </a>
              .
            </p>
          </div>
        </div>
        <p className="mx-auto max-w-[1200px] border-t border-brand-blue/50 px-4 py-6 text-xs leading-relaxed sm:px-6">
          BridgeCare gives general health navigation information. It is not medical advice, diagnosis or treatment.
        </p>
      </footer>
    </div>
  );
}
