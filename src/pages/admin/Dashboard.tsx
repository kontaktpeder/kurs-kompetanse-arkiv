import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Inbox, Calendar, Star, BookOpen } from "lucide-react";
import { leadStatusLabels } from "@/lib/types";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

export default function Dashboard() {
  const { data: newLeadsCount } = useQuery({
    queryKey: ["admin-new-leads-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new");
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: runsCount } = useQuery({
    queryKey: ["admin-runs-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("course_runs").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  const { data: avgRating } = useQuery({
    queryKey: ["admin-avg-rating"],
    queryFn: async () => {
      const { data, error } = await supabase.from("reviews").select("rating").eq("is_approved", true);
      if (error) throw error;
      if (!data || data.length === 0) return null;
      return (data.reduce((s, r) => s + r.rating, 0) / data.length).toFixed(1);
    },
  });

  const { data: recentLeads } = useQuery({
    queryKey: ["admin-recent-leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5);
      if (error) throw error;
      return data;
    },
  });

  const stats = [
    { label: "Nye forespørsler", value: newLeadsCount ?? 0, icon: Inbox, color: "text-primary" },
    { label: "Gjennomføringer", value: runsCount ?? 0, icon: Calendar, color: "text-foreground" },
    { label: "Snittrating", value: avgRating ?? "–", icon: Star, color: "text-primary" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className={`h-5 w-5 ${s.color}`} strokeWidth={1.5} />
            </div>
            <div className="text-3xl font-bold">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Nyeste forespørsler</h2>
          <Link to="/admin/foresporsel" className="text-sm text-primary hover:underline">Se alle</Link>
        </div>
        <div className="divide-y divide-border">
          {recentLeads?.map((lead) => (
            <div key={lead.id} className="p-4 flex items-center justify-between">
              <div>
                <span className="font-medium">{lead.name}</span>
                {lead.company && <span className="text-muted-foreground text-sm ml-2">– {lead.company}</span>}
                <div className="text-xs text-muted-foreground mt-0.5">
                  {format(new Date(lead.created_at), "d. MMM yyyy HH:mm", { locale: nb })}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${lead.status === "new" ? "bg-primary/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {leadStatusLabels[lead.status] ?? lead.status}
              </span>
            </div>
          ))}
          {(!recentLeads || recentLeads.length === 0) && (
            <div className="p-4 text-sm text-muted-foreground">Ingen forespørsler ennå</div>
          )}
        </div>
      </div>
    </div>
  );
}
