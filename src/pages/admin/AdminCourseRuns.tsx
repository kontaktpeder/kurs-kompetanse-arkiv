import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { type MediaItem } from "@/lib/types";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import type { Tables } from "@/integrations/supabase/types";

type CourseRun = Tables<"course_runs">;

export default function AdminCourseRuns() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<CourseRun | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    course_id: "", date_start: "", date_end: "", date_label: "",
    location_text: "", client_label: "", participants_count: "",
    passed_count: "", summary: "", notes: "", instructor_id: "",
    is_published: true, is_featured: false,
  });
  const [formMedia, setFormMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: courses } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, title").order("title");
      if (error) throw error;
      return data;
    },
  });

  const { data: instructors } = useQuery({
    queryKey: ["admin-instructors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("instructors").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: runs, isLoading } = useQuery({
    queryKey: ["admin-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_runs")
        .select("*, courses(title)")
        .order("date_start", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        course_id: form.course_id,
        date_start: form.date_start || null,
        date_end: form.date_end || null,
        date_label: form.date_label || null,
        location_text: form.location_text || null,
        client_label: form.client_label || null,
        participants_count: form.participants_count ? parseInt(form.participants_count) : null,
        passed_count: form.passed_count ? parseInt(form.passed_count) : null,
        summary: form.summary || null,
        notes: form.notes || null,
        instructor_id: form.instructor_id || null,
        is_published: form.is_published,
        is_featured: form.is_featured,
        media: formMedia as any,
      };
      if (editing) {
        const { error } = await supabase.from("course_runs").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("course_runs").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-runs"] });
      closeDialog();
      toast.success(editing ? "Oppdatert" : "Opprettet");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("course_runs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-runs"] });
      toast.success("Slettet");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const fileName = `${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("media").upload(fileName, file);
        if (error) { toast.error(error.message); continue; }
        const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(fileName);
        setFormMedia((prev) => [...prev, {
          type: file.type.startsWith("video") ? "video" : "image",
          url: publicUrl,
        }]);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeMedia = (index: number) => setFormMedia((prev) => prev.filter((_, i) => i !== index));

  const openCreate = () => {
    setEditing(null);
    setForm({ course_id: "", date_start: "", date_end: "", date_label: "", location_text: "", client_label: "", participants_count: "", passed_count: "", summary: "", notes: "", instructor_id: "", is_published: true, is_featured: false });
    setFormMedia([]);
    setOpen(true);
  };

  const openEdit = (r: CourseRun) => {
    setEditing(r);
    setForm({
      course_id: r.course_id, date_start: r.date_start || "", date_end: r.date_end || "",
      date_label: r.date_label || "", location_text: r.location_text || "",
      client_label: r.client_label || "", participants_count: r.participants_count?.toString() || "",
      passed_count: r.passed_count?.toString() || "", summary: r.summary || "",
      notes: r.notes || "", instructor_id: r.instructor_id || "",
      is_published: r.is_published, is_featured: r.is_featured,
    });
    setFormMedia((r.media as unknown as MediaItem[]) || []);
    setOpen(true);
  };

  const closeDialog = () => { setOpen(false); setEditing(null); };
  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gjennomføringer</h1>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Ny gjennomføring</Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Laster...</p>}

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {runs?.map((r) => {
          const courseTitle = (r.courses as any)?.title || "–";
          return (
            <div key={r.id} className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{courseTitle}</div>
                <div className="text-xs text-muted-foreground">
                  {r.location_text && `${r.location_text} · `}
                  {r.date_start && format(new Date(r.date_start), "d. MMM yyyy", { locale: nb })}
                  {!r.is_published && " · Upublisert"}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => { if (confirm("Slette?")) deleteMutation.mutate(r.id); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          );
        })}
        {runs?.length === 0 && <div className="p-4 text-sm text-muted-foreground">Ingen gjennomføringer</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Rediger" : "Ny gjennomføring"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Kurs *</label>
              <select value={form.course_id} onChange={(e) => update("course_id", e.target.value)} className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm">
                <option value="">Velg kurs</option>
                {courses?.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Startdato</label><Input type="date" value={form.date_start} onChange={(e) => update("date_start", e.target.value)} /></div>
              <div><label className="text-sm font-medium mb-1 block">Sluttdato</label><Input type="date" value={form.date_end} onChange={(e) => update("date_end", e.target.value)} /></div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Dato-label (valgfritt)</label><Input value={form.date_label} onChange={(e) => update("date_label", e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Sted</label><Input value={form.location_text} onChange={(e) => update("location_text", e.target.value)} /></div>
            <div><label className="text-sm font-medium mb-1 block">Kundelabel</label><Input value={form.client_label} onChange={(e) => update("client_label", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-sm font-medium mb-1 block">Deltakere</label><Input type="number" value={form.participants_count} onChange={(e) => update("participants_count", e.target.value)} /></div>
              <div><label className="text-sm font-medium mb-1 block">Bestått</label><Input type="number" value={form.passed_count} onChange={(e) => update("passed_count", e.target.value)} /></div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Kursholder</label>
              <select value={form.instructor_id} onChange={(e) => update("instructor_id", e.target.value)} className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm">
                <option value="">Ingen</option>
                {instructors?.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Oppsummering</label><Textarea value={form.summary} onChange={(e) => update("summary", e.target.value)} rows={3} /></div>
            <div><label className="text-sm font-medium mb-1 block">Notater (intern)</label><Textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={2} /></div>

            {/* Media */}
            <div>
              <label className="text-sm font-medium mb-1 block">Media</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formMedia.map((m, i) => (
                  <div key={i} className="relative w-20 h-20 rounded bg-muted overflow-hidden">
                    {m.type === "image" ? (
                      <img src={m.url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Video</div>
                    )}
                    <button onClick={() => removeMedia(i)} className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-full p-0.5">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <label className="cursor-pointer inline-flex items-center gap-1 text-sm text-primary hover:underline">
                <Upload className="h-4 w-4" /> {uploading ? "Laster opp..." : "Last opp filer"}
                <input type="file" multiple accept="image/*,video/*" onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={(e) => update("is_published", e.target.checked)} /> Publisert</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={(e) => update("is_featured", e.target.checked)} /> Fremhevet</label>
            </div>
            <Button onClick={() => saveMutation.mutate()} disabled={!form.course_id || saveMutation.isPending} className="w-full">
              {saveMutation.isPending ? "Lagrer..." : editing ? "Oppdater" : "Opprett"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
