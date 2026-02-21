import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, Loader2 } from "lucide-react";
import CategoryIcon from "@/components/CategoryIcon";
import ImageTracer from "imagetracerjs";

interface Category {
  id: string;
  slug: string;
  name: string;
  icon_svg: string | null;
  icon_svg_url: string | null;
  icon_png_url: string | null;
  is_active: boolean;
  is_system: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const emptyForm = {
  name: "",
  slug: "",
  is_active: true,
  sort_order: 100,
};

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_categories" as any)
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as unknown as Category[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        is_active: form.is_active,
        sort_order: form.sort_order,
      };
      if (editing) {
        const { error } = await supabase
          .from("course_categories" as any)
          .update(payload)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("course_categories" as any)
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      closeDialog();
      toast.success(editing ? "Kategori oppdatert" : "Kategori opprettet");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("course_categories" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Kategori slettet");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toSlug = (s: string) =>
    s.toLowerCase()
      .replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      is_active: c.is_active,
      sort_order: c.sort_order,
    });
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
  };

  const update = (key: string, value: any) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === "name" && !editing) next.slug = toSlug(value as string);
      return next;
    });
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editing) return;
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Kun bildefiler er tillatt");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Maks 10 MB");
      return;
    }

    setUploading(true);
    try {
      const ts = Date.now();
      const pngPath = `icons/categories/${editing.slug}/icon-${ts}.png`;

      // Upload PNG
      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(pngPath, file, { upsert: true });
      if (upErr) throw upErr;

      const { data: pngUrlData } = supabase.storage
        .from("media")
        .getPublicUrl(pngPath);
      const pngUrl = pngUrlData.publicUrl;

      // Convert to SVG using ImageTracer
      const dataUrl = await fileToDataUrl(file);
      const svgString = await traceSvg(dataUrl);

      // Upload SVG blob
      const svgPath = `icons/categories/${editing.slug}/icon-${ts}.svg`;
      const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
      const { error: svgUpErr } = await supabase.storage
        .from("media")
        .upload(svgPath, svgBlob, { upsert: true, contentType: "image/svg+xml" });
      if (svgUpErr) throw svgUpErr;

      const { data: svgUrlData } = supabase.storage
        .from("media")
        .getPublicUrl(svgPath);

      // Update DB
      const { error: dbErr } = await supabase
        .from("course_categories" as any)
        .update({
          icon_svg: svgString,
          icon_svg_url: svgUrlData.publicUrl,
          icon_png_url: pngUrl,
        })
        .eq("id", editing.id);
      if (dbErr) throw dbErr;

      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Ikon oppdatert (PNG + SVG)");
    } catch (err: any) {
      toast.error(err.message || "Opplasting feilet");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Kategorier</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" /> Ny kategori
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Laster...</p>}

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {categories?.map((c) => (
          <div key={c.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <CategoryIcon iconSvg={c.icon_svg} iconPngUrl={c.icon_png_url} className="h-8 w-8" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{c.name}</span>
                  {c.is_system && (
                    <span className="text-[10px] uppercase tracking-wider bg-secondary text-muted-foreground px-1.5 py-0.5 rounded">
                      System
                    </span>
                  )}
                  {!c.is_active && <span className="text-xs text-destructive">Inaktiv</span>}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  /{c.slug} · Rekkefølge: {c.sort_order}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                <Pencil className="h-4 w-4" />
              </Button>
              {!c.is_system && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm("Slette denne kategorien?")) deleteMutation.mutate(c.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
        {categories?.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">Ingen kategorier ennå</div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Rediger kategori" : "Ny kategori"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Navn *</label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Slug</label>
              <Input
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                disabled={!!editing}
                className={editing ? "opacity-60" : ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Rekkefølge</label>
                <Input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => update("sort_order", parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm pb-2">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => update("is_active", e.target.checked)}
                  />
                  Aktiv
                </label>
              </div>
            </div>

            {/* Icon upload – only for existing categories */}
            {editing && (
              <div>
                <label className="text-sm font-medium mb-1 block">Ikon (PNG → auto SVG)</label>
                <p className="text-xs text-muted-foreground mb-2">
                  Last opp et rent, flat PNG-ikon. Konverteres automatisk til SVG.
                </p>
                <div className="flex items-center gap-3">
                  <CategoryIcon
                    iconSvg={categories?.find((c) => c.id === editing.id)?.icon_svg}
                    iconPngUrl={categories?.find((c) => c.id === editing.id)?.icon_png_url}
                    className="h-12 w-12"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Upload className="h-4 w-4 mr-1" />
                    )}
                    {uploading ? "Konverterer..." : "Last opp PNG"}
                  </Button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png"
                  className="hidden"
                  onChange={handleIconUpload}
                />
              </div>
            )}

            {!editing && (
              <p className="text-xs text-muted-foreground bg-secondary p-3 border border-border">
                Lagre kategorien først, deretter kan du laste opp ikon.
              </p>
            )}

            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!form.name.trim() || !form.slug.trim() || saveMutation.isPending}
              className="w-full"
            >
              {saveMutation.isPending ? "Lagrer..." : editing ? "Oppdater" : "Opprett"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── helpers ── */

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function traceSvg(dataUrl: string): Promise<string> {
  return new Promise((resolve) => {
    ImageTracer.imageToSVG(
      dataUrl,
      (svgStr: string) => resolve(svgStr),
      {
        numberofcolors: 4,
        colorsampling: 2,
        ltres: 1,
        qtres: 1,
        pathomit: 8,
        blurradius: 0,
        blurdelta: 20,
        strokewidth: 0,
        linefilter: true,
        desc: false,
        viewbox: true,
        roundcoords: 2,
        scale: 1,
      }
    );
  });
}
