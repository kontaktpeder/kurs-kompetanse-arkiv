import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, ExternalLink, User } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type TeamMember = Tables<"team_members">;

/* ── Team Tab ── */

function TeamTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["admin_team_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: Partial<TeamMember> & { id?: string }) => {
      const payload = {
        name: values.name!,
        title: values.title || null,
        bio: values.bio || null,
        skills: values.skills || [],
        photo_url: values.photo_url || null,
        is_active: values.is_active ?? true,
        sort_order: values.sort_order ?? 100,
      };
      if (values.id) {
        const { error } = await supabase.from("team_members").update(payload).eq("id", values.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("team_members").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_team_members"] });
      qc.invalidateQueries({ queryKey: ["team_members"] });
      toast.success(editing ? "Medlem oppdatert" : "Medlem lagt til");
      setOpen(false);
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (m: TeamMember) => { setEditing(m); setOpen(true); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Teammedlemmer</h2>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Ny medlem</Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm py-8 text-center">Laster...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Navn</TableHead>
                <TableHead className="hidden sm:table-cell">Tittel</TableHead>
                <TableHead className="hidden md:table-cell">Skills</TableHead>
                <TableHead>Aktiv</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m) => (
                <TableRow key={m.id} className={!m.is_active ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{m.title || "—"}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(m.skills || []).slice(0, 3).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                      {(m.skills || []).length > 3 && (
                        <Badge variant="outline" className="text-xs">+{m.skills.length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{m.is_active ? "✓" : "—"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Ingen teammedlemmer ennå
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <TeamDialog
        open={open}
        onClose={() => { setOpen(false); setEditing(null); }}
        member={editing}
        saving={saveMutation.isPending}
        onSave={(v) => saveMutation.mutate(v)}
      />
    </div>
  );
}

function TeamDialog({
  open, onClose, member, saving, onSave,
}: {
  open: boolean;
  onClose: () => void;
  member: TeamMember | null;
  saving: boolean;
  onSave: (v: Partial<TeamMember> & { id?: string }) => void;
}) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [skillsStr, setSkillsStr] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(100);

  // Reset on open
  const onOpenChange = (o: boolean) => {
    if (o && member) {
      setName(member.name);
      setTitle(member.title || "");
      setBio(member.bio || "");
      setSkillsStr((member.skills || []).join(", "));
      setPhotoUrl(member.photo_url || "");
      setIsActive(member.is_active);
      setSortOrder(member.sort_order);
    } else if (o) {
      setName(""); setTitle(""); setBio(""); setSkillsStr("");
      setPhotoUrl(""); setIsActive(true); setSortOrder(100);
    }
    if (!o) onClose();
  };

  // We need useEffect-like reset but using Dialog's onOpenChange
  // Trigger reset when dialog opens
  if (open) {
    // Handled via key prop below
  }

  const handleSave = () => {
    if (!name.trim()) return;
    const skills = skillsStr.split(",").map((s) => s.trim()).filter(Boolean);
    onSave({
      ...(member ? { id: member.id } : {}),
      name: name.trim(),
      title: title.trim() || null,
      bio: bio.trim() || null,
      skills,
      photo_url: photoUrl.trim() || null,
      is_active: isActive,
      sort_order: sortOrder,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{member ? "Rediger medlem" : "Nytt teammedlem"}</DialogTitle>
          <DialogDescription>Fyll inn informasjon om teammedlemmet.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Navn *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Tittel</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          </div>
          <div>
            <Label>Skills (kommaseparert)</Label>
            <Input value={skillsStr} onChange={(e) => setSkillsStr(e.target.value)} placeholder="Kranførerbevis, HMS, ..." />
          </div>
          <div>
            <Label>Bilde-URL</Label>
            <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Sortering</Label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <Checkbox id="is_active" checked={isActive} onCheckedChange={(c) => setIsActive(!!c)} />
              <Label htmlFor="is_active">Aktiv</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Avbryt</Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? "Lagrer..." : "Lagre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Kurs Tab ── */

function KursTab() {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["admin_courses_list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, slug, title, category_slug, is_active, is_featured")
        .order("title", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Kurs</h2>
        <Button asChild variant="outline" size="sm">
          <Link to="/admin/kurs"><ExternalLink className="h-4 w-4 mr-1" /> Full kursadmin</Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-sm py-8 text-center">Laster...</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tittel</TableHead>
                <TableHead className="hidden sm:table-cell">Kategori</TableHead>
                <TableHead>Aktiv</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((c) => (
                <TableRow key={c.id} className={!c.is_active ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{c.title}</TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                    {c.category_slug || "—"}
                  </TableCell>
                  <TableCell>{c.is_active ? "✓" : "—"}</TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="icon">
                      <Link to="/admin/kurs"><Pencil className="h-4 w-4" /></Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

/* ── Page ── */

export default function AdminInnhold() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Innhold</h1>
      <Tabs defaultValue="team">
        <TabsList>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="kurs">Kurs</TabsTrigger>
        </TabsList>
        <TabsContent value="team">
          <TeamTab />
        </TabsContent>
        <TabsContent value="kurs">
          <KursTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
