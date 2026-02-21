import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MediaUploadField from "@/components/MediaUploadField";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";

interface Slide {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  cta_primary_label: string | null;
  cta_primary_href: string | null;
  cta_secondary_label: string | null;
  cta_secondary_href: string | null;
  sort_order: number;
  is_active: boolean;
}

const emptyForm = {
  image_url: "",
  sort_order: "100",
  is_active: true,
};

export default function AdminHeroSlides() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Slide | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: slides, isLoading } = useQuery({
    queryKey: ["admin-hero-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("home_hero_slides")
        .select("*")
        .order("sort_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Slide[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        image_url: form.image_url,
        sort_order: parseInt(form.sort_order) || 100,
        is_active: form.is_active,
      };
      if (editing) {
        const { error } = await supabase.from("home_hero_slides").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("home_hero_slides").insert(payload).select("id").single();
        if (error) throw error;
        setCreatedId(data.id);
        setEditing({ ...payload, id: data.id, created_at: "", updated_at: "" } as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] });
      if (editing) {
        closeDialog();
        toast.success("Lagret");
      } else {
        toast.success("Opprettet – du kan nå laste opp bilde");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("home_hero_slides").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] });
      toast.success("Slettet");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleImageChange = async (url: string | null) => {
    const slideId = editing?.id || createdId;
    if (!slideId) return;
    setForm((f) => ({ ...f, image_url: url || "" }));
    // Save immediately
    const { error } = await supabase
      .from("home_hero_slides")
      .update({ image_url: url || "" })
      .eq("id", slideId);
    if (error) toast.error(error.message);
    else {
      queryClient.invalidateQueries({ queryKey: ["admin-hero-slides"] });
    }
  };

  const openCreate = () => {
    setEditing(null);
    setCreatedId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (s: Slide) => {
    setEditing(s);
    setCreatedId(s.id);
    setForm({
      image_url: s.image_url || "",
      sort_order: s.sort_order.toString(),
      is_active: s.is_active,
    });
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
    setCreatedId(null);
  };

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));
  const slideId = editing?.id || createdId;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Forside – Hero Slides</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Nytt slide</Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Laster...</p>}

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {slides?.map((s) => (
          <div key={s.id} className="p-4 flex items-center gap-4">
            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="w-20 h-12 bg-secondary overflow-hidden shrink-0">
              {s.image_url && <img src={s.image_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{s.title || "(Uten tittel)"}</div>
              <div className="text-xs text-muted-foreground">
                Rekkefølge: {s.sort_order}
                {!s.is_active && " · Inaktiv"}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { if (confirm("Slette dette slidet?")) deleteMutation.mutate(s.id); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {slides?.length === 0 && <div className="p-4 text-sm text-muted-foreground">Ingen slides ennå</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Rediger slide" : "Nytt slide"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* If new and no ID yet, must save first */}
            {!slideId ? (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">Rekkefølge</label>
                  <Input type="number" value={form.sort_order} onChange={(e) => update("sort_order", e.target.value)} />
                </div>
                <p className="text-xs text-muted-foreground bg-secondary p-3 border border-border">
                  Lagre slidet først for å laste opp bilde.
                </p>
                <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="w-full">
                  {saveMutation.isPending ? "Oppretter..." : "Opprett slide"}
                </Button>
              </>
            ) : (
              <>
                <MediaUploadField
                  label="Hero-bilde (påkrevd)"
                  helperText="Anbefalt: 1920×1080 eller bredere"
                  value={form.image_url || null}
                  onChange={handleImageChange}
                  folder={`site/home-hero/${slideId}`}
                  filePrefix="hero"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Rekkefølge</label>
                    <Input type="number" value={form.sort_order} onChange={(e) => update("sort_order", e.target.value)} />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} />
                      Aktiv
                    </label>
                  </div>
                </div>

                <Button onClick={() => saveMutation.mutate()} disabled={!form.image_url || saveMutation.isPending} className="w-full">
                  {saveMutation.isPending ? "Lagrer..." : "Lagre"}
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
