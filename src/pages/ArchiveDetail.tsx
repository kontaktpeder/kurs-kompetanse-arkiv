import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type MediaItem } from "@/lib/types";
import { MapPin, Calendar, Users, CheckCircle, Star } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { toast } from "sonner";

export default function ArchiveDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: run, isLoading } = useQuery({
    queryKey: ["course-run", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_runs")
        .select("*, courses(title, slug, id)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const media = (run?.media as unknown as MediaItem[]) || [];
  const images = media.filter((m) => m.type === "image");
  const courseData = run?.courses as unknown as { title: string; slug: string; id: string } | null;

  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [company, setCompany] = useState("");

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("reviews").insert({
        course_run_id: id!,
        rating,
        comment: comment || null,
        display_name: displayName || null,
        company: company || null,
        is_approved: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Takk for din anmeldelse! Den vil bli publisert etter godkjenning.");
      setComment("");
      setDisplayName("");
      setCompany("");
      setRating(5);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="py-20 text-center text-muted-foreground">Laster...</div>;
  if (!run) return <div className="py-20 text-center text-muted-foreground">Ikke funnet</div>;

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-8">
          <Link to="/arkiv" className="hover:text-primary">Arkiv</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{courseData?.title || "Gjennomføring"}</span>
        </div>

        <h1 className="text-4xl font-bold mb-2">{courseData?.title || "Kursgjennomføring"}</h1>
        {run.client_label && <p className="text-lg text-muted-foreground mb-6">{run.client_label}</p>}

        {/* Meta */}
        <div className="flex flex-wrap gap-6 mb-8 text-sm">
          {run.location_text && (
            <span className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" /> {run.location_text}
            </span>
          )}
          {run.date_start && (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {run.date_label || format(new Date(run.date_start), "d. MMMM yyyy", { locale: nb })}
              {run.date_end && ` – ${format(new Date(run.date_end), "d. MMMM yyyy", { locale: nb })}`}
            </span>
          )}
          {run.participants_count != null && (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" /> {run.participants_count} deltakere
            </span>
          )}
          {run.passed_count != null && (
            <span className="flex items-center gap-2 text-primary font-semibold">
              <CheckCircle className="h-4 w-4" /> {run.passed_count} bestått
            </span>
          )}
        </div>

        {/* Gallery */}
        {images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8">
            {images.map((img, i) => (
              <div key={i} className={`overflow-hidden ${i === 0 && images.length > 1 ? "md:col-span-2" : ""}`}>
                <img src={img.url} alt={img.alt || "Kursbilde"} className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {run.summary && (
          <div className="bg-card border border-border p-6 mb-8">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{run.summary}</p>
          </div>
        )}

        {/* CTA */}
        {courseData && (
          <div className="mb-12">
            <Button asChild size="lg">
              <Link to={`/foresporsel?kurs=${courseData.id}`}>Bestill dette kurset</Link>
            </Button>
          </div>
        )}

        {/* Review Form */}
        <div className="bg-card border border-border p-6">
          <h2 className="text-2xl font-bold mb-4">Gi en anmeldelse</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Vurdering</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRating(n)} type="button">
                    <Star
                      className={`h-6 w-6 cursor-pointer transition-colors ${
                        n <= rating ? "fill-primary text-primary" : "text-muted hover:text-primary/50"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Kommentar</label>
              <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Din opplevelse..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Navn (valgfritt)</label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ditt navn" />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Bedrift (valgfritt)</label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Din bedrift" />
              </div>
            </div>
            <Button onClick={() => reviewMutation.mutate()} disabled={reviewMutation.isPending}>
              {reviewMutation.isPending ? "Sender..." : "Send anmeldelse"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
