import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

export default function AdminLegal() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", body_md: "", is_published: true });

  const { data: pages, isLoading } = useQuery({
    queryKey: ["admin-legal-pages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("legal_pages").select("*").order("slug");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const { error } = await supabase
        .from("legal_pages")
        .update({
          title: form.title,
          body_md: form.body_md,
          is_published: form.is_published,
        })
        .eq("id", editing.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-legal-pages"] });
      setOpen(false);
      toast.success("Lagret");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (page: any) => {
    setEditing(page);
    setForm({ title: page.title, body_md: page.body_md, is_published: page.is_published });
    setOpen(true);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Juridisk</h1>

      {isLoading && <p className="text-muted-foreground">Laster...</p>}

      <div className="bg-card border border-border rounded-lg divide-y divide-border">
        {pages?.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-muted-foreground">
                /{p.slug} {!p.is_published && " · Upublisert"}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {pages?.length === 0 && <div className="p-4 text-sm text-muted-foreground">Ingen sider</div>}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rediger {editing?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Tittel</label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Innhold (Markdown)</label>
              <Textarea
                value={form.body_md}
                onChange={(e) => setForm((f) => ({ ...f, body_md: e.target.value }))}
                rows={16}
                className="font-mono text-sm"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
              />
              Publisert
            </label>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="w-full"
            >
              {saveMutation.isPending ? "Lagrer..." : "Lagre"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
