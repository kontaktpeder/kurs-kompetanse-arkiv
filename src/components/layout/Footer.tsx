import { Link } from "react-router-dom";
import { Phone, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-secondary border-t border-border py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-primary text-lg mb-3" style={{ fontFamily: 'Oswald, sans-serif' }}>Kurs Kragerø</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sertifisert og dokumentert opplæring siden 2006.
              Vi tilbyr kurs på norsk, engelsk og tegnspråk.
            </p>
          </div>
          <div>
            <h4 className="text-foreground font-semibold uppercase tracking-wider text-sm mb-3">Sider</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/kurs" className="text-muted-foreground hover:text-primary transition-colors">Kurs</Link></li>
              <li><Link to="/arkiv" className="text-muted-foreground hover:text-primary transition-colors">Arkiv</Link></li>
              <li><Link to="/foresporsel" className="text-muted-foreground hover:text-primary transition-colors">Send forespørsel</Link></li>
              <li><Link to="/login" className="text-muted-foreground hover:text-primary transition-colors">Admin</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-foreground font-semibold uppercase tracking-wider text-sm mb-3">Kontakt</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="tel:+4795044749" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="h-3.5 w-3.5" /> 950 44 749
                </a>
              </li>
              <li>
                <a href="mailto:lbl@krap.no" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail className="h-3.5 w-3.5" /> lbl@krap.no
                </a>
              </li>
              <li className="pt-1">Kragerø, Norge</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kurs Kragerø. Alle rettigheter reservert.
        </div>
      </div>
    </footer>
  );
}
