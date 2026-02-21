import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type FAQ = Tables<"faqs">;

export default function AdminFAQs() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", sort_order: "0", is_published: true });

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["admin-faqs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faqs").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        sort_order: parseInt(form.sort_order) || 0,
        is_published: form.is_published,
      };
      if (editing) {
        const { error } = await supabase.from("faqs").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("faqs").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      setOpen(false); setEditing(null);
      toast.success(editing ? "Oppdatert" : "Opprettet");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faqs"] });
      toast.success("Slettet");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = () => { setEditing(null); setForm({ question: "", answer: "", sort_order: "0", is_published: true }); setOpen(true); };
  const openEdit = (f: FAQ) => { setEditing(f); setForm({ question: f.question, answer: f.answer, sort_order: f.sort_order.toString(), is_published: f.is_published }); setOpen(true); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">FAQ</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Nytt spørsmål</Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Laster...</p>}

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {faqs?.map((f) => (
          <div key={f.id} className="p-4 flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium">{f.question}</div>
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{f.answer}</div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => { if (confirm("Slette?")) deleteMutation.mutate(f.id); }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {faqs?.length === 0 && <div className="p-4 text-sm text-muted-foreground">Ingen FAQ</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Rediger FAQ" : "Nytt spørsmål"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Spørsmål</label><Input value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Svar</label><Textarea value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} rows={4} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Sortering</label><Input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} /></div>
              <div className="flex items-end pb-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} /> Publisert</label></div>
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.question.trim() || !form.answer.trim() || saveMutation.isPending} className="w-full">
              {saveMutation.isPending ? "Lagrer..." : editing ? "Oppdater" : "Opprett"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
