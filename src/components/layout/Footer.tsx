import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-industrial text-industrial-foreground/70 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-industrial-foreground font-bold text-lg mb-3">Kurs Kragerø</h3>
            <p className="text-sm leading-relaxed">
              Sertifisert og dokumentert opplæring siden 2006.
              Vi tilbyr kurs på norsk, engelsk og tegnspråk.
            </p>
          </div>
          <div>
            <h4 className="text-industrial-foreground font-semibold mb-3">Sider</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/kurs" className="hover:text-primary transition-colors">Kurs</Link></li>
              <li><Link to="/arkiv" className="hover:text-primary transition-colors">Arkiv</Link></li>
              <li><Link to="/foresporsel" className="hover:text-primary transition-colors">Send forespørsel</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-industrial-foreground font-semibold mb-3">Kontakt</h4>
            <p className="text-sm leading-relaxed">
              Kragerø, Norge<br />
              post@kurskragero.no
            </p>
          </div>
        </div>
        <div className="border-t border-industrial-foreground/10 mt-8 pt-6 text-center text-xs">
          © {new Date().getFullYear()} Kurs Kragerø. Alle rettigheter reservert.
        </div>
      </div>
    </footer>
  );
}
