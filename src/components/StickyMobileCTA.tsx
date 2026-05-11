import { Link, useLocation } from "react-router-dom";
import { Phone, Send } from "lucide-react";

/**
 * Sticky bottom CTA bar shown on mobile only.
 * High-intent local CRO: always-available phone + inquiry actions.
 */
export default function StickyMobileCTA() {
  const { pathname } = useLocation();

  // Hide in admin and login areas
  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) {
    return null;
  }

  return (
    <>
      {/* Spacer so fixed bar doesn't cover page content */}
      <div className="md:hidden h-16" aria-hidden="true" />
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border grid grid-cols-2 shadow-[0_-4px_16px_rgba(0,0,0,0.25)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <a
          href="tel:+4795044749"
          className="flex items-center justify-center gap-2 h-14 text-sm font-semibold uppercase tracking-wider border-r border-border text-foreground hover:bg-secondary transition-colors"
        >
          <Phone className="h-4 w-4" />
          Ring
        </a>
        <Link
          to="/foresporsel"
          className="flex items-center justify-center gap-2 h-14 text-sm font-semibold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Send className="h-4 w-4" />
          Send forespørsel
        </Link>
      </div>
    </>
  );
}
