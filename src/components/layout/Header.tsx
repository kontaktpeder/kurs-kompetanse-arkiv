import { useState } from "react";
import { Link } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Menu, X } from "lucide-react";

const navItems = [
  { label: "Hjem", to: "/" },
  { label: "Kurs", to: "/kurs" },
  { label: "Arkiv", to: "/arkiv" },
  { label: "Send forespørsel", to: "/foresporsel" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-industrial text-industrial-foreground sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold tracking-tight">
            Kurs Kragerø
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className="px-4 py-2 text-sm text-industrial-foreground/80 hover:text-industrial-foreground transition-colors rounded-md"
                activeClassName="text-primary font-medium"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-industrial-foreground/80 hover:text-industrial-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Meny"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden border-t border-industrial-foreground/10 px-4 pb-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className="block py-3 text-sm text-industrial-foreground/80 hover:text-industrial-foreground border-b border-industrial-foreground/5"
              activeClassName="text-primary font-medium"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
