import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { courseTypeLabels, languageLabels, type MediaItem } from "@/lib/types";
import { getIcon } from "@/lib/icons";
import { MapPin, Calendar, Users, Star, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").eq("slug", slug!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: runs } = useQuery({
    queryKey: ["course-runs", course?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_runs")
        .select("*")
        .eq("course_id", course!.id)
        .order("date_start", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!course?.id,
  });

  const { data: reviews } = useQuery({
    queryKey: ["course-reviews", course?.id],
    queryFn: async () => {
      const runIds = runs!.map((r) => r.id);
      if (runIds.length === 0) return [];
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .in("course_run_id", runIds);
      if (error) throw error;
      return data;
    },
    enabled: !!runs && runs.length > 0,
  });

  if (isLoading) return <div className="py-20 text-center text-muted-foreground">Laster...</div>;
  if (!course) return <div className="py-20 text-center text-muted-foreground">Kurset ble ikke funnet</div>;

  const Icon = getIcon(course.icon_key);
  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-8">
          <Link to="/kurs" className="hover:text-primary">Kurs</Link> / {course.title}
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-accent rounded-lg">
            <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                {courseTypeLabels[course.course_type]}
              </span>
              {course.languages.map((l) => (
                <span key={l} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {languageLabels[l] ?? l}
                </span>
              ))}
              {avgRating && (
                <span className="flex items-center gap-1 text-sm text-primary font-medium">
                  <Star className="h-4 w-4 fill-primary" /> {avgRating}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {course.description || course.short_description}
          </p>
        </div>

        {/* Offer */}
        {course.offer_is_active && course.offer_title && (
          <div className="bg-accent border border-primary/20 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-lg mb-2">{course.offer_title}</h3>
            {course.offer_body && <p className="text-sm text-muted-foreground">{course.offer_body}</p>}
          </div>
        )}

        {/* CTA */}
        <div className="mb-12">
          <Button asChild size="lg">
            <Link to={`/foresporsel?kurs=${course.id}`}>Send forespørsel for dette kurset</Link>
          </Button>
        </div>

        {/* Related runs */}
        {runs && runs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Gjennomføringer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {runs.map((run) => {
                const media = (run.media as unknown as MediaItem[]) || [];
                const firstImage = media.find((m) => m.type === "image");
                return (
                  <Link key={run.id} to={`/arkiv/${run.id}`} className="group">
                    <div className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-colors">
                      {firstImage && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={firstImage.url}
                            alt="Gjennomføring"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {run.location_text && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" /> {run.location_text}
                            </span>
                          )}
                          {run.date_start && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {run.date_label || format(new Date(run.date_start), "d. MMM yyyy", { locale: nb })}
                            </span>
                          )}
                          {run.participants_count && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" /> {run.participants_count}
                            </span>
                          )}
                        </div>
                        {run.summary && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{run.summary}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews && reviews.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Anmeldelser</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-card border border-border rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < review.rating ? "fill-primary text-primary" : "text-muted"}`}
                        />
                      ))}
                    </div>
                    {review.display_name && (
                      <span className="text-sm font-medium">{review.display_name}</span>
                    )}
                    {review.company && (
                      <span className="text-sm text-muted-foreground">– {review.company}</span>
                    )}
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
