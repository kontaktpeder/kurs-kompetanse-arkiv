import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { leadStatusLabels } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { Constants } from "@/integrations/supabase/types";
import type { Tables } from "@/integrations/supabase/types";

type Lead = Tables<"leads">;

export default function AdminLeads() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selected, setSelected] = useState<Lead | null>(null);

  const { data: leads, isLoading } = useQuery({
    queryKey: ["admin-leads"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*, courses(title)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("leads").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      toast.success("Status oppdatert");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = leads?.filter((l) => !statusFilter || l.status === statusFilter);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Forespørsler</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["", ...Constants.public.Enums.lead_status].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"
            }`}
          >
            {s === "" ? "Alle" : leadStatusLabels[s] ?? s}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-muted-foreground">Laster...</p>}

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {filtered?.map((lead) => (
          <div key={lead.id} className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30" onClick={() => setSelected(lead)}>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{lead.name}</span>
                {lead.company && <span className="text-sm text-muted-foreground">– {lead.company}</span>}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {(lead.courses as any)?.title && `${(lead.courses as any).title} · `}
                {format(new Date(lead.created_at), "d. MMM yyyy HH:mm", { locale: nb })}
              </div>
            </div>
            <select
              value={lead.status}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => statusMutation.mutate({ id: lead.id, status: e.target.value })}
              className="text-xs border border-input rounded px-2 py-1 bg-background"
            >
              {Constants.public.Enums.lead_status.map((s) => (
                <option key={s} value={s}>{leadStatusLabels[s] ?? s}</option>
              ))}
            </select>
          </div>
        ))}
        {filtered?.length === 0 && <div className="p-4 text-sm text-muted-foreground">Ingen forespørsler</div>}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Forespørsel fra {selected?.name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              {selected.email && <div><span className="text-muted-foreground">E-post:</span> {selected.email}</div>}
              {selected.phone && <div><span className="text-muted-foreground">Telefon:</span> {selected.phone}</div>}
              {selected.company && <div><span className="text-muted-foreground">Bedrift:</span> {selected.company}</div>}
              {selected.participants_estimate && <div><span className="text-muted-foreground">Deltakere:</span> {selected.participants_estimate}</div>}
              {selected.language_preference && <div><span className="text-muted-foreground">Språk:</span> {selected.language_preference}</div>}
              {selected.location_text && <div><span className="text-muted-foreground">Sted:</span> {selected.location_text}</div>}
              {selected.desired_timeframe && <div><span className="text-muted-foreground">Tidspunkt:</span> {selected.desired_timeframe}</div>}
              {selected.message && <div><span className="text-muted-foreground">Melding:</span><p className="mt-1 whitespace-pre-wrap">{selected.message}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
