import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { courseTypeLabels, languageLabels } from "@/lib/types";
import { availableIcons } from "@/lib/icons";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { Tables, Enums } from "@/integrations/supabase/types";

type Course = Tables<"courses">;

const emptyCourse = {
  title: "", slug: "", description: "", short_description: "",
  course_type: "other" as Enums<"course_type">, languages: ["no"], icon_key: "",
  is_active: true, is_featured: false,
  offer_is_active: false, offer_title: "", offer_body: "", offer_expires_at: "",
  learning_outcomes: "", target_audience: "", course_structure: "",
  certification_info: "", practical_info: "", duration: "", requirements: "",
};

export default function AdminCourses() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyCourse);

  const { data: courses, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").order("title");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description || null,
        short_description: form.short_description || null,
        course_type: form.course_type,
        languages: form.languages,
        icon_key: form.icon_key || null,
        is_active: form.is_active,
        is_featured: form.is_featured,
        offer_is_active: form.offer_is_active,
        offer_title: form.offer_title || null,
        offer_body: form.offer_body || null,
        offer_expires_at: form.offer_expires_at || null,
        learning_outcomes: form.learning_outcomes || null,
        target_audience: form.target_audience || null,
        course_structure: form.course_structure || null,
        certification_info: form.certification_info || null,
        practical_info: form.practical_info || null,
        duration: form.duration || null,
        requirements: form.requirements || null,
      };
      if (editing) {
        const { error } = await supabase.from("courses").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("courses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      closeDialog();
      toast.success(editing ? "Kurs oppdatert" : "Kurs opprettet");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Kurs slettet");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCourse);
    setOpen(true);
  };

  const openEdit = (c: Course) => {
    setEditing(c);
    setForm({
      title: c.title, slug: c.slug,
      description: c.description || "", short_description: c.short_description || "",
      course_type: c.course_type, languages: c.languages,
      icon_key: c.icon_key || "", is_active: c.is_active, is_featured: c.is_featured,
      offer_is_active: c.offer_is_active, offer_title: c.offer_title || "",
      offer_body: c.offer_body || "", offer_expires_at: c.offer_expires_at || "",
      learning_outcomes: c.learning_outcomes || "", target_audience: c.target_audience || "",
      course_structure: c.course_structure || "", certification_info: c.certification_info || "",
      practical_info: c.practical_info || "", duration: c.duration || "",
      requirements: c.requirements || "",
    });
    setOpen(true);
  };

  const closeDialog = () => { setOpen(false); setEditing(null); };
  const toSlug = (s: string) =>
    s.toLowerCase().replace(/æ/g,"ae").replace(/ø/g,"oe").replace(/å/g,"aa").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const update = (key: string, value: any) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "title" && !editing) next.slug = toSlug(value as string);
      return next;
    });
  };
  const toggleLang = (lang: string) => {
    setForm((f) => ({
      ...f,
      languages: f.languages.includes(lang)
        ? f.languages.filter((l) => l !== lang)
        : [...f.languages, lang],
    }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kurs</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Nytt kurs</Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Laster...</p>}

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {courses?.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{c.title}</span>
                <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                  {courseTypeLabels[c.course_type]}
                </span>
                {!c.is_active && <span className="text-xs text-destructive">Inaktiv</span>}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">/{c.slug} · {c.languages.map(l => languageLabels[l] ?? l).join(", ")}</div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => { if (confirm("Slette dette kurset?")) deleteMutation.mutate(c.id); }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {courses?.length === 0 && <div className="p-4 text-sm text-muted-foreground">Ingen kurs ennå</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Rediger kurs" : "Nytt kurs"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Basic info */}
            <div>
              <label className="text-sm font-medium mb-1 block">Tittel *</label>
              <Input value={form.title} onChange={(e) => update("title", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Slug *</label>
              <Input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="f.eks. varme-arbeid" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Kort beskrivelse</label>
              <Input value={form.short_description} onChange={(e) => update("short_description", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Beskrivelse</label>
              <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Type</label>
                <select value={form.course_type} onChange={(e) => update("course_type", e.target.value)} className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm">
                  {Object.entries(courseTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Ikon</label>
                <select value={form.icon_key} onChange={(e) => update("icon_key", e.target.value)} className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm">
                  <option value="">Ingen</option>
                  {availableIcons.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Språk</label>
              <div className="flex gap-2">
                {Object.entries(languageLabels).map(([k, v]) => (
                  <label key={k} className="flex items-center gap-1 text-sm">
                    <input type="checkbox" checked={form.languages.includes(k)} onChange={() => toggleLang(k)} />
                    {v}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_active} onChange={(e) => update("is_active", e.target.checked)} /> Aktiv
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => update("is_featured", e.target.checked)} /> Fremhevet
              </label>
            </div>

            {/* Structured content */}
            <hr className="border-border" />
            <h3 className="text-base font-semibold" style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase' }}>Innhold (strukturert)</h3>

            <div>
              <label className="text-sm font-medium mb-1 block">Hva lærer du?</label>
              <p className="text-xs text-muted-foreground mb-1">Skriv én per linje – vises som punktliste på nettsiden.</p>
              <Textarea value={form.learning_outcomes} onChange={(e) => update("learning_outcomes", e.target.value)} rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Hvem passer kurset for?</label>
              <p className="text-xs text-muted-foreground mb-1">Skriv korte setninger eller punkter. (Én per linje hvis ønskelig).</p>
              <Textarea value={form.target_audience} onChange={(e) => update("target_audience", e.target.value)} rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Gjennomføring</label>
              <p className="text-xs text-muted-foreground mb-1">Teori/praksis, dag/kveld, hos kunde/hos oss.</p>
              <Textarea value={form.course_structure} onChange={(e) => update("course_structure", e.target.value)} rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Sertifisering / dokumentasjon</label>
              <Textarea value={form.certification_info} onChange={(e) => update("certification_info", e.target.value)} rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Praktisk info</label>
              <p className="text-xs text-muted-foreground mb-1">F.eks. utstyr, krav, tilpasninger, praksiskjøring.</p>
              <Textarea value={form.practical_info} onChange={(e) => update("practical_info", e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Varighet</label>
                <Input value={form.duration} onChange={(e) => update("duration", e.target.value)} placeholder="F.eks. 1 dag / 2 kvelder / etter avtale" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Forkunnskaper / krav</label>
                <Input value={form.requirements} onChange={(e) => update("requirements", e.target.value)} placeholder="F.eks. ingen / ønskelig med…" />
              </div>
            </div>

            {/* Offer */}
            <hr className="border-border" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.offer_is_active} onChange={(e) => update("offer_is_active", e.target.checked)} /> Aktivt tilbud
            </label>
            {form.offer_is_active && (
              <>
                <Input value={form.offer_title} onChange={(e) => update("offer_title", e.target.value)} placeholder="Tilbudstittel" />
                <Textarea value={form.offer_body} onChange={(e) => update("offer_body", e.target.value)} placeholder="Tilbudstekst" rows={2} />
              </>
            )}
            <Button onClick={() => saveMutation.mutate()} disabled={!form.title.trim() || !form.slug.trim() || saveMutation.isPending} className="w-full">
              {saveMutation.isPending ? "Lagrer..." : editing ? "Oppdater" : "Opprett"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
