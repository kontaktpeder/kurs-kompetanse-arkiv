import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { courseTypeLabels, languageLabels, type MediaItem } from "@/lib/types";
import { getIcon } from "@/lib/icons";
import { MapPin, Calendar, Users, Star, Clock, FileText, Shield, Globe } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { useEffect, useRef, useState } from "react";

/* ── helpers ── */

function SectionHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <div className="mb-4" id={id}>
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

/* ── anchor nav items ── */
const anchorSections = [
  { id: "laeringsmal", label: "Hva lærer du", key: "learning_outcomes" },
  { id: "malgruppe", label: "Målgruppe", key: "target_audience" },
  { id: "gjennomforing", label: "Gjennomføring", key: "course_structure" },
  { id: "sertifisering", label: "Sertifisering", key: "certification_info" },
  { id: "praktisk", label: "Praktisk info", key: "practical_info" },
  { id: "gjennomforinger", label: "Gjennomføringer", key: "_runs" },
  { id: "anmeldelser", label: "Anmeldelser", key: "_reviews" },
] as const;

/* ── main component ── */

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [activeAnchor, setActiveAnchor] = useState<string>("");
  const navRef = useRef<HTMLDivElement>(null);

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

  // Intersection observer for active anchor highlighting
  useEffect(() => {
    if (!course) return;
    const ids = anchorSections.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveAnchor(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [course, runs, reviews]);

  if (isLoading) return <div className="py-20 text-center text-muted-foreground">Laster...</div>;
  if (!course) return <div className="py-20 text-center text-muted-foreground">Kurset ble ikke funnet</div>;

  const Icon = getIcon(course.icon_key);
  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const heroImage = course.hero_image_url || course.image_url;

  const sections = [
    { id: "laeringsmal", title: "Hva lærer du?", content: course.learning_outcomes, render: "bullets" as const },
    { id: "malgruppe", title: "Hvem passer kurset for?", content: course.target_audience, render: "smart" as const },
    { id: "gjennomforing", title: "Gjennomføring", content: course.course_structure, render: "text" as const },
    { id: "sertifisering", title: "Sertifisering / dokumentasjon", content: course.certification_info, render: "text" as const },
    { id: "praktisk", title: "Praktisk info", content: course.practical_info, render: "text" as const },
  ];

  // Filter anchor nav to only show sections that have content
  const visibleAnchors = anchorSections.filter((a) => {
    if (a.key === "_runs") return runs && runs.length > 0;
    if (a.key === "_reviews") return reviews && reviews.length > 0;
    return !!(course as any)[a.key];
  });

  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section
        className="relative min-h-[45vh] sm:min-h-[55vh] lg:min-h-[60vh] flex items-end"
        style={{
          backgroundImage: heroImage
            ? `url(${heroImage})`
            : "linear-gradient(135deg, hsl(var(--background)), hsl(var(--secondary)))",
          backgroundSize: "cover",
          backgroundPosition: "50% 15%",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />

        {/* Hero content */}
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pb-10 pt-32">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
            {/* Left – Title & info */}
            <div className="lg:col-span-2 max-w-[720px]">
              {/* Breadcrumb */}
              <div className="text-sm text-muted-foreground mb-6">
                <Link to="/kurs" className="hover:text-primary transition-colors">Kurs</Link>
                <span className="mx-2 opacity-50">/</span>
                <span className="text-foreground/70">{course.title}</span>
              </div>

              <h1
                className="font-bold leading-[0.95] mb-5"
                style={{
                  fontFamily: "Oswald, sans-serif",
                  fontSize: "clamp(36px, 5vw, 72px)",
                }}
              >
                {course.title}
              </h1>

              {/* ── Info bar ── */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider bg-primary text-primary-foreground px-2.5 py-1 font-semibold">
                  <Shield className="h-3 w-3" />
                  {courseTypeLabels[course.course_type]}
                </span>
                {(course.languages ?? []).map((l) => (
                  <span key={l} className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5">
                    <Globe className="h-3 w-3" />
                    {languageLabels[l] ?? l}
                  </span>
                ))}
                {avgRating && (
                  <span className="flex items-center gap-1 text-sm text-primary font-semibold">
                    <Star className="h-4 w-4 fill-primary" /> {avgRating}
                  </span>
                )}
                {course.duration && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 text-primary" /> {course.duration}
                  </span>
                )}
                {course.requirements && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5 text-primary" /> {course.requirements}
                  </span>
                )}
              </div>

              {/* Short description */}
              {(course.short_description || course.description) && (
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl">
                  {course.short_description || course.description}
                </p>
              )}
            </div>

            {/* Right – CTA card */}
            <div className="hidden lg:block">
              <div className="bg-card border border-border p-6 space-y-4 w-full max-w-[360px] ml-auto">
                <h3 className="text-lg font-bold uppercase" style={{ fontFamily: "Oswald, sans-serif" }}>
                  Send forespørsel
                </h3>
                <p className="text-sm text-muted-foreground">
                  Kontakt oss for pris, datoer og tilpasning av dette kurset.
                </p>
                <Button asChild size="lg" className="w-full">
                  <Link to={`/foresporsel?kurs=${course.id}`}>Send forespørsel</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ANCHOR NAV BAR ═══ */}
      {visibleAnchors.length > 0 && (
        <div
          ref={navRef}
          className="sticky top-16 z-40 bg-background border-b border-border overflow-x-auto"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-0">
            {visibleAnchors.map((a) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(a.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`
                  shrink-0 px-4 py-3 text-xs uppercase tracking-wider border-b-2 transition-colors
                  ${activeAnchor === a.id
                    ? "border-primary text-primary font-semibold"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }
                `}
              >
                {a.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Offer */}
          {course.offer_is_active && course.offer_title && (
            <div className="bg-primary/10 border border-primary/30 p-6 mb-10">
              <h3 className="font-semibold text-lg mb-2 text-primary" style={{ fontFamily: "Oswald, sans-serif" }}>
                {course.offer_title}
              </h3>
              {course.offer_body && <p className="text-sm text-muted-foreground">{course.offer_body}</p>}
            </div>
          )}

          {/* Full description if different from short */}
          {course.description && course.short_description && course.description !== course.short_description && (
            <div className="bg-card border border-border p-6 mb-10">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{course.description}</p>
            </div>
          )}

          {/* Two-column: sections + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
            {/* Left: structured sections */}
            <div className="lg:col-span-2 space-y-10">
              {sections.map(({ id, title, content, render }) => {
                if (!content) return null;
                return (
                  <div key={id} id={id} className="scroll-mt-28">
                    <SectionHeading>{title}</SectionHeading>
                    {render === "bullets" && <BulletList text={content} />}
                    {render === "smart" && <SmartText text={content} />}
                    {render === "text" && <PreservedText text={content} />}
                  </div>
                );
              })}
            </div>

            {/* Right: CTA sidebar (visible on desktop, sticky) */}
            <div className="hidden lg:block">
              <div className="bg-card border border-border p-6 sticky top-28 space-y-5">
                <h3 className="text-lg font-bold uppercase" style={{ fontFamily: "Oswald, sans-serif" }}>
                  Send forespørsel
                </h3>
                <p className="text-sm text-muted-foreground">
                  Kontakt oss for pris, datoer og tilpasning av dette kurset.
                </p>

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
                    {(course.languages ?? []).map((l) => (
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

          {/* Mobile CTA */}
          <div className="lg:hidden mb-10">
            <div className="bg-card border border-border p-6 space-y-4">
              <h3 className="text-lg font-bold uppercase" style={{ fontFamily: "Oswald, sans-serif" }}>
                Send forespørsel
              </h3>
              <p className="text-sm text-muted-foreground">
                Kontakt oss for pris, datoer og tilpasning.
              </p>
              <Button asChild size="lg" className="w-full">
                <Link to={`/foresporsel?kurs=${course.id}`}>Send forespørsel</Link>
              </Button>
            </div>
          </div>

          {/* Related runs */}
          {runs && runs.length > 0 && (
            <div className="mb-12 scroll-mt-28" id="gjennomforinger">
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
            <div className="scroll-mt-28" id="anmeldelser">
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
