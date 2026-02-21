import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, BookOpen, Calendar, Inbox, Star, HelpCircle, Users, LogOut, Settings, Scale, Image, Tags, FileText, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";

const adminNav = [
  { title: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { title: "Kurs", path: "/admin/kurs", icon: BookOpen },
  { title: "Kategorier", path: "/admin/kategorier", icon: Tags },
  { title: "Gjennomføringer", path: "/admin/gjennomforinger", icon: Calendar },
  { title: "Forespørsler", path: "/admin/foresporsel", icon: Inbox },
  { title: "Anmeldelser", path: "/admin/anmeldelser", icon: Star },
  { title: "FAQ", path: "/admin/faq", icon: HelpCircle },
  { title: "Kursholdere", path: "/admin/kursholdere", icon: Users },
  { title: "Innhold", path: "/admin/innhold", icon: FileText },
  { title: "Hero Slides", path: "/admin/hero", icon: Image },
  { title: "Juridisk", path: "/admin/juridisk", icon: Scale },
  { title: "Innstillinger", path: "/admin/innstillinger", icon: Settings },
];

function NavItems({ isActive, onNavigate }: { isActive: (p: string) => boolean; onNavigate?: () => void }) {
  return (
    <>
      {adminNav.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
            isActive(item.path)
              ? "bg-sidebar-accent text-primary font-medium"
              : "text-industrial-foreground/70 hover:text-industrial-foreground hover:bg-sidebar-accent/50"
          )}
        >
          <item.icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          {item.title}
        </Link>
      ))}
    </>
  );
}

export default function AdminLayout() {
  const { signOut } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  const pageTitle = adminNav.find((n) => isActive(n.path))?.title ?? "Admin";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-industrial text-industrial-foreground flex-col shrink-0">
        <div className="p-4 border-b border-industrial-foreground/10">
          <Link to="/admin" className="font-bold text-lg">Admin</Link>
          <Link to="/" className="block text-xs text-industrial-foreground/50 hover:text-primary mt-1">
            ← Tilbake til nettsiden
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          <NavItems isActive={isActive} />
        </nav>
        <div className="p-2 border-t border-industrial-foreground/10">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-industrial-foreground/70 hover:text-industrial-foreground hover:bg-sidebar-accent/50 w-full"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            Logg ut
          </button>
        </div>
      </aside>

      {/* Mobile header + sheet */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden bg-industrial text-industrial-foreground border-b border-industrial-foreground/10 px-4 h-14 flex items-center justify-between shrink-0">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="p-1.5 -ml-1.5 hover:bg-sidebar-accent/50 rounded-md">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-industrial text-industrial-foreground p-0 border-r border-industrial-foreground/10">
              <SheetTitle className="sr-only">Admin-meny</SheetTitle>
              <div className="p-4 border-b border-industrial-foreground/10">
                <Link to="/admin" onClick={() => setOpen(false)} className="font-bold text-lg">Admin</Link>
                <Link to="/" onClick={() => setOpen(false)} className="block text-xs text-industrial-foreground/50 hover:text-primary mt-1">
                  ← Tilbake til nettsiden
                </Link>
              </div>
              <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-8rem)]">
                <NavItems isActive={isActive} onNavigate={() => setOpen(false)} />
              </nav>
              <div className="p-2 border-t border-industrial-foreground/10">
                <button
                  onClick={() => { setOpen(false); signOut(); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-industrial-foreground/70 hover:text-industrial-foreground hover:bg-sidebar-accent/50 w-full"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                  Logg ut
                </button>
              </div>
            </SheetContent>
          </Sheet>
          <span className="font-semibold text-sm uppercase tracking-wider">{pageTitle}</span>
          <div className="w-8" /> {/* spacer for centering */}
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
