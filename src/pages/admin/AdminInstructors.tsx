import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { languageLabels } from "@/lib/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Instructor = Tables<"instructors">;

export default function AdminInstructors() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Instructor | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", bio: "", photo_url: "", languages: ["no"] as string[], is_active: true });

  const { data: instructors, isLoading } = useQuery({
    queryKey: ["admin-instructors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("instructors").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        bio: form.bio || null,
        photo_url: form.photo_url || null,
        languages: form.languages,
        is_active: form.is_active,
      };
      if (editing) {
        const { error } = await supabase.from("instructors").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("instructors").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-instructors"] });
      setOpen(false); setEditing(null);
      toast.success(editing ? "Oppdatert" : "Opprettet");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("instructors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-instructors"] });
      toast.success("Slettet");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = () => { setEditing(null); setForm({ name: "", bio: "", photo_url: "", languages: ["no"], is_active: true }); setOpen(true); };
  const openEdit = (i: Instructor) => { setEditing(i); setForm({ name: i.name, bio: i.bio || "", photo_url: i.photo_url || "", languages: i.languages, is_active: i.is_active }); setOpen(true); };
  const toggleLang = (lang: string) => setForm((f) => ({ ...f, languages: f.languages.includes(lang) ? f.languages.filter((l) => l !== lang) : [...f.languages, lang] }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kursholdere</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Ny kursholder</Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Laster...</p>}

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {instructors?.map((i) => (
          <div key={i.id} className="p-4 flex items-center justify-between">
            <div>
              <span className="font-medium">{i.name}</span>
              {!i.is_active && <span className="text-xs text-destructive ml-2">Inaktiv</span>}
              <div className="text-xs text-muted-foreground mt-0.5">{i.languages.map(l => languageLabels[l] ?? l).join(", ")}</div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(i)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => { if (confirm("Slette?")) deleteMutation.mutate(i.id); }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {instructors?.length === 0 && <div className="p-4 text-sm text-muted-foreground">Ingen kursholdere</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Rediger kursholder" : "Ny kursholder"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Navn *</label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Bio</label><Textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} /></div>
            <div><label className="text-sm font-medium mb-1 block">Foto URL</label><Input value={form.photo_url} onChange={(e) => setForm((f) => ({ ...f, photo_url: e.target.value }))} /></div>
            <div>
              <label className="text-sm font-medium mb-1 block">Språk</label>
              <div className="flex gap-2">
                {Object.entries(languageLabels).map(([k, v]) => (
                  <label key={k} className="flex items-center gap-1 text-sm"><input type="checkbox" checked={form.languages.includes(k)} onChange={() => toggleLang(k)} /> {v}</label>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} /> Aktiv</label>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.name.trim() || saveMutation.isPending} className="w-full">
              {saveMutation.isPending ? "Lagrer..." : editing ? "Oppdater" : "Opprett"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
