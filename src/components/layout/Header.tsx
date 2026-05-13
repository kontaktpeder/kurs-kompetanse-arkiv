import { useState } from "react";
import { Link } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Menu, X, Phone, Mail, Facebook } from "lucide-react";
import logoIcon from "@/assets/logo-icon.png";

const navItems = [
  { label: "Hjem", to: "/" },
  { label: "Kurs", to: "/kurs" },
  // { label: "Arkiv", to: "/arkiv" }, // skjult foreløpig
  { label: "Om oss", to: "/om-oss" },
  { label: "Event / Teambuilding", to: "/event-teambuilding" },
  { label: "Forespørsel", to: "/foresporsel" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      {/* Top bar with contact info */}
      <div className="hidden sm:block bg-secondary border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-end gap-4 py-1.5 text-xs text-muted-foreground">
          <a href="tel:+4795044749" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Phone className="h-3 w-3" /> 950 44 749
          </a>
          <a href="mailto:lbl@krap.no" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Mail className="h-3 w-3" /> lbl@krap.no
          </a>
          <a href="https://www.facebook.com/profile.php?id=61569509614507" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex items-center gap-1.5 hover:text-primary transition-colors">
            <Facebook className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl tracking-widest uppercase text-primary" style={{ fontFamily: 'Oswald, sans-serif' }}>
            <img src={logoIcon} alt="Kragerø Maskin og Opplæring" className="h-10 w-10 object-contain" />
            <span className="hidden sm:inline">Kragerø Maskin og Opplæring</span>
          </Link>

          <nav className="hidden md:flex items-center gap-0">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className="px-4 py-2 text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                activeClassName="text-primary font-semibold"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Meny"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-border px-4 pb-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className="block py-3 text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground border-b border-border/50"
              activeClassName="text-primary font-semibold"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          {/* Contact info in mobile menu */}
          <div className="pt-4 space-y-2 text-sm text-muted-foreground">
            <a href="tel:+4795044749" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="h-3.5 w-3.5" /> 950 44 749
            </a>
            <a href="mailto:lbl@krap.no" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="h-3.5 w-3.5" /> lbl@krap.no
            </a>
            <a href="https://www.facebook.com/profile.php?id=61569509614507" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Facebook className="h-3.5 w-3.5" /> Facebook
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
