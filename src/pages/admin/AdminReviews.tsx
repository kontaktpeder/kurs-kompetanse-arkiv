import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Star, Check, X } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

export default function AdminReviews() {
  const queryClient = useQueryClient();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, course_runs(courses(title))")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      if (approved) {
        const { error } = await supabase.from("reviews").update({ is_approved: true }).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("reviews").delete().eq("id", id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Oppdatert");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pending = reviews?.filter((r) => !r.is_approved) || [];
  const approved = reviews?.filter((r) => r.is_approved) || [];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Anmeldelser</h1>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Venter på godkjenning ({pending.length})</h2>
          <div className="bg-card border border-border rounded-lg divide-y divide-border">
            {pending.map((r) => {
              const courseTitle = (r.course_runs as any)?.courses?.title || "–";
              return (
                <div key={r.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-primary text-primary" : "text-muted"}`} />)}</div>
                        {r.display_name && <span className="text-sm font-medium">{r.display_name}</span>}
                        {r.company && <span className="text-sm text-muted-foreground">– {r.company}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{courseTitle} · {format(new Date(r.created_at), "d. MMM yyyy", { locale: nb })}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => approveMutation.mutate({ id: r.id, approved: true })}><Check className="h-4 w-4 mr-1" /> Godkjenn</Button>
                      <Button size="sm" variant="destructive" onClick={() => approveMutation.mutate({ id: r.id, approved: false })}><X className="h-4 w-4 mr-1" /> Avvis</Button>
                    </div>
                  </div>
                  {r.comment && <p className="text-sm text-muted-foreground">{r.comment}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <h2 className="text-lg font-semibold mb-3">Godkjente ({approved.length})</h2>
      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {approved.map((r) => (
          <div key={r.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-primary text-primary" : "text-muted"}`} />)}</div>
                {r.display_name && <span className="text-sm">{r.display_name}</span>}
              </div>
              {r.comment && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{r.comment}</p>}
            </div>
            <Button size="sm" variant="ghost" onClick={() => { if (confirm("Slette?")) approveMutation.mutate({ id: r.id, approved: false }); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {approved.length === 0 && <div className="p-4 text-sm text-muted-foreground">Ingen godkjente anmeldelser</div>}
      </div>

      {isLoading && <p className="text-muted-foreground mt-4">Laster...</p>}
    </div>
  );
}
