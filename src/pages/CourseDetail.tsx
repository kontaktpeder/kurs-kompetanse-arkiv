import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { courseTypeLabels, languageLabels, type MediaItem } from "@/lib/types";
import { getIcon } from "@/lib/icons";
import { MapPin, Calendar, Users, Star, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

/* ── helpers ── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold uppercase tracking-wide">{children}</h2>
      <div className="h-0.5 w-12 bg-primary mt-1" />
    </div>
  );
}

function BulletList({ text }: { text: string }) {
  const items = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <ul className="space-y-1.5 list-none">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function SmartText({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) return <BulletList text={text} />;
  return <p className="text-sm text-muted-foreground whitespace-pre-wrap">{text}</p>;
}

function PreservedText({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground whitespace-pre-wrap">{text}</p>;
}

/* ── main component ── */

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

  const sections = [
    { title: "Hva lærer du?", content: course.learning_outcomes, render: "bullets" },
    { title: "Hvem passer kurset for?", content: course.target_audience, render: "smart" },
    { title: "Gjennomføring", content: course.course_structure, render: "text" },
    { title: "Sertifisering / dokumentasjon", content: course.certification_info, render: "text" },
    { title: "Praktisk info", content: course.practical_info, render: "text" },
  ] as const;

  return (
    <div>
      {/* Hero image */}
      {(course.hero_image_url || course.image_url) && (
        <div className="w-full h-64 sm:h-80 lg:h-96 overflow-hidden relative">
          <img
            src={course.hero_image_url || course.image_url!}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      )}

      <div className={`px-4 ${course.hero_image_url || course.image_url ? '-mt-20 relative z-10' : 'pt-12'}`}>
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-8">
          <Link to="/kurs" className="hover:text-primary">Kurs</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{course.title}</span>
        </div>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-secondary">
            <Icon className="h-8 w-8 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5">
                {courseTypeLabels[course.course_type]}
              </span>
              {course.languages.map((l) => (
                <span key={l} className="text-xs uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5">
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

        {/* Intro description */}
        {(course.description || course.short_description) && (
          <div className="bg-card border border-border p-6 mb-8">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {course.description || course.short_description}
            </p>
          </div>
        )}

        {/* Offer */}
        {course.offer_is_active && course.offer_title && (
          <div className="bg-primary/10 border border-primary/30 p-6 mb-8">
            <h3 className="font-semibold text-lg mb-2 text-primary" style={{ fontFamily: 'Oswald, sans-serif' }}>{course.offer_title}</h3>
            {course.offer_body && <p className="text-sm text-muted-foreground">{course.offer_body}</p>}
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left: structured sections */}
          <div className="lg:col-span-2 space-y-8">
            {sections.map(({ title, content, render }) => {
              if (!content) return null;
              return (
                <div key={title}>
                  <SectionHeading>{title}</SectionHeading>
                  {render === "bullets" && <BulletList text={content} />}
                  {render === "smart" && <SmartText text={content} />}
                  {render === "text" && <PreservedText text={content} />}
                </div>
              );
            })}
          </div>

          {/* Right: CTA sidebar */}
          <div>
            <div className="bg-card border border-border p-6 sticky top-24 space-y-5">
              <h3 className="text-lg font-bold uppercase" style={{ fontFamily: 'Oswald, sans-serif' }}>Send forespørsel</h3>
              <p className="text-sm text-muted-foreground">Kontakt oss for pris, datoer og tilpasning av dette kurset.</p>

              {/* Quick info chips */}
              <div className="space-y-2">
                {course.duration && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{course.duration}</span>
                  </div>
                )}
                {course.requirements && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>{course.requirements}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-xs uppercase tracking-wider bg-primary text-primary-foreground px-2 py-0.5">
                    {courseTypeLabels[course.course_type]}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {course.languages.map((l) => (
                    <span key={l} className="text-xs uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5">
                      {languageLabels[l] ?? l}
                    </span>
                  ))}
                </div>
              </div>

              <Button asChild size="lg" className="w-full">
                <Link to={`/foresporsel?kurs=${course.id}`}>Send forespørsel</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Related runs */}
        {runs && runs.length > 0 && (
          <div className="mb-12">
            <SectionHeading>Gjennomføringer</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {runs.map((run) => {
                const media = (run.media as unknown as MediaItem[]) || [];
                const firstImage = media.find((m) => m.type === "image");
                return (
                  <Link key={run.id} to={`/arkiv/${run.id}`} className="group">
                    <div className="bg-card overflow-hidden border border-border hover:border-primary/40 transition-all">
                      {firstImage && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={firstImage.url}
                            alt="Gjennomføring"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
            <SectionHeading>Anmeldelser</SectionHeading>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-card border border-border p-5">
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
    </div>
  );
}
