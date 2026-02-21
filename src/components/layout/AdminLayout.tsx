import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, BookOpen, Calendar, Inbox, Star, HelpCircle, Users, LogOut, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { title: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { title: "Kurs", path: "/admin/kurs", icon: BookOpen },
  { title: "Gjennomføringer", path: "/admin/gjennomforinger", icon: Calendar },
  { title: "Forespørsler", path: "/admin/foresporsel", icon: Inbox },
  { title: "Anmeldelser", path: "/admin/anmeldelser", icon: Star },
  { title: "FAQ", path: "/admin/faq", icon: HelpCircle },
  { title: "Kursholdere", path: "/admin/kursholdere", icon: Users },
  { title: "Innstillinger", path: "/admin/innstillinger", icon: Settings },
];

export default function AdminLayout() {
  const { signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/admin"
      ? location.pathname === "/admin"
      : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-60 bg-industrial text-industrial-foreground flex flex-col shrink-0">
        <div className="p-4 border-b border-industrial-foreground/10">
          <Link to="/admin" className="font-bold text-lg">Admin</Link>
          <Link to="/" className="block text-xs text-industrial-foreground/50 hover:text-primary mt-1">
            ← Tilbake til nettsiden
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {adminNav.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                isActive(item.path)
                  ? "bg-sidebar-accent text-primary font-medium"
                  : "text-industrial-foreground/70 hover:text-industrial-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.5} />
              {item.title}
            </Link>
          ))}
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
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
