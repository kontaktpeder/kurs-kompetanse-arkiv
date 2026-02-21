import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { courseTypeLabels, languageLabels, type MediaItem } from "@/lib/types";
import IconPlate from "@/components/icons/IconPlate";
import { MapPin, Calendar, Users, Star, Clock, FileText, Shield, Globe } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

/* ── helpers ── */

function SectionDivider() {
  return <div className="border-t border-border/30 my-12 lg:my-16" />;
}

function SectionHeading({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6" id={id}>
      <h2
        className="text-lg font-bold uppercase tracking-wider mb-2"
        style={{ fontFamily: "Oswald, sans-serif" }}
      >
        {children}
      </h2>
      <div className="h-[2px] w-16 bg-primary" />
    </div>
  );
}

function BulletList({ text }: { text: string }) {
  const items = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <ul className="space-y-3 list-none">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-base text-muted-foreground leading-relaxed">
          <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function SmartText({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) return <BulletList text={text} />;
  return <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{text}</p>;
}

function PreservedText({ text }: { text: string }) {
  return <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">{text}</p>;
}

/* ── main component ── */

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").eq("slug", slug!).single();
      if (error) throw error;
      // Fetch category
      const catSlug = (data as any).category_slug;
      let category = null;
      if (catSlug) {
        const { data: catData } = await supabase.from("course_categories" as any).select("slug, name, icon_svg, icon_png_url, icon_size_px, icon_plate, icon_plate_variant").eq("slug", catSlug).single();
        category = catData;
      }
      return { ...data, category } as any;
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

  const cat = course.category;
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
  ].filter((s) => !!s.content);

  return (
    <div>
      {/* ═══ HERO – Split: image left, yellow info right ═══ */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[50vh] lg:min-h-[60vh]">
        {/* Left – Image */}
        <div className="relative min-h-[300px] lg:min-h-0">
          {heroImage ? (
            <img
              src={heroImage}
              alt={course.title}
              className="w-full h-full object-cover absolute inset-0"
              style={{ objectPosition: "50% 15%" }}
            />
          ) : (
            <div className="w-full h-full bg-secondary flex items-center justify-center">
              <IconPlate svg={cat?.icon_svg} pngUrl={cat?.icon_png_url} sizePx={120} variant="dark" />
            </div>
          )}
        </div>

        {/* Right – Yellow info block */}
        <div className="bg-primary text-primary-foreground flex flex-col justify-center p-8 sm:p-10 lg:p-14">
          <div className="text-sm mb-6 opacity-70">
            <Link to="/kurs" className="hover:opacity-100 transition-opacity">Kurs</Link>
            <span className="mx-2">/</span>
            <span>{course.title}</span>
          </div>

          <div className="flex items-start gap-5 mb-6">
            {cat && (
              <IconPlate
                svg={cat.icon_svg}
                pngUrl={cat.icon_png_url}
                sizePx={112}
                variant="yellow"
              />
            )}
            <h1
              className="font-bold leading-[0.95]"
              style={{
                fontFamily: "Oswald, sans-serif",
                fontSize: "clamp(32px, 4.5vw, 64px)",
              }}
            >
              {course.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider bg-primary-foreground text-primary px-2.5 py-1 font-semibold">
              <Shield className="h-3 w-3" />
              {courseTypeLabels[course.course_type]}
            </span>
            {(course.languages ?? []).map((l) => (
              <span key={l} className="inline-flex items-center gap-1 text-xs uppercase tracking-wider border border-primary-foreground/30 px-2 py-0.5">
                <Globe className="h-3 w-3" />
                {languageLabels[l] ?? l}
              </span>
            ))}
            {avgRating && (
              <span className="flex items-center gap-1 text-sm font-semibold">
                <Star className="h-4 w-4 fill-primary-foreground" /> {avgRating}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-6 text-sm opacity-80">
            {course.duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {course.duration}
              </span>
            )}
            {course.requirements && (
              <span className="flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> {course.requirements}
              </span>
            )}
          </div>

          {(course.short_description || course.description) && (
            <p className="text-base sm:text-lg leading-relaxed opacity-90 max-w-xl">
              {course.short_description || course.description}
            </p>
          )}
        </div>
      </section>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Offer */}
          {course.offer_is_active && course.offer_title && (
            <>
              <div className="border-l-2 border-primary pl-6 mb-12">
                <h3 className="font-semibold text-lg mb-1 text-primary" style={{ fontFamily: "Oswald, sans-serif" }}>
                  {course.offer_title}
                </h3>
                {course.offer_body && <p className="text-sm text-muted-foreground">{course.offer_body}</p>}
              </div>
            </>
          )}

          {/* Full description */}
          {course.description && course.short_description && course.description !== course.short_description && (
            <div className="mb-12">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap max-w-3xl">{course.description}</p>
            </div>
          )}

          {/* Two-column: open sections + CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Left: open flat sections */}
            <div className="lg:col-span-2">
              <Accordion type="multiple" defaultValue={["laeringsmal"]} className="space-y-0">
                {sections.map(({ id, title, content, render }) => (
                  <AccordionItem
                    key={id}
                    value={id}
                    className="border-b border-border/30 border-t-0 border-x-0 py-0 scroll-mt-28"
                    id={id}
                  >
                    <AccordionTrigger
                      className="py-5 hover:no-underline"
                    >
                      <span
                        className="text-base font-bold uppercase tracking-wider text-left"
                        style={{ fontFamily: "Oswald, sans-serif" }}
                      >
                        {title}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-8 pt-0">
                      {render === "bullets" && <BulletList text={content!} />}
                      {render === "smart" && <SmartText text={content!} />}
                      {render === "text" && <PreservedText text={content!} />}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            {/* Right: CTA panel – the only "card" */}
            <div>
              <div className="sticky top-24">
                <div className="h-[2px] bg-primary mb-0" />
                <div className="bg-card border-x border-b border-border/40 p-6 space-y-5">
                  <h3
                    className="text-lg font-bold uppercase tracking-wider"
                    style={{ fontFamily: "Oswald, sans-serif" }}
                  >
                    Send forespørsel
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Kontakt oss for pris, datoer og tilpasning av dette kurset.
                  </p>

                  <div className="space-y-3 border-t border-border/30 pt-4">
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
                        <span key={l} className="text-xs uppercase tracking-wider text-muted-foreground border border-border/40 px-2 py-0.5">
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
          </div>

          {/* Mobile CTA */}
          <div className="lg:hidden mt-12">
            <div className="h-[2px] bg-primary mb-0" />
            <div className="bg-card border-x border-b border-border/40 p-6 space-y-4">
              <h3 className="text-lg font-bold uppercase tracking-wider" style={{ fontFamily: "Oswald, sans-serif" }}>
                Send forespørsel
              </h3>
              <p className="text-sm text-muted-foreground">Kontakt oss for pris, datoer og tilpasning.</p>
              <Button asChild size="lg" className="w-full">
                <Link to={`/foresporsel?kurs=${course.id}`}>Send forespørsel</Link>
              </Button>
            </div>
          </div>

          {/* Runs */}
          {runs && runs.length > 0 && (
            <>
              <SectionDivider />
              <div id="gjennomforinger" className="scroll-mt-28">
                <SectionHeading>Gjennomføringer</SectionHeading>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {runs.map((run) => {
                    const media = (run.media as unknown as MediaItem[]) || [];
                    const firstImage = media.find((m) => m.type === "image");
                    return (
                      <Link key={run.id} to={`/arkiv/${run.id}`} className="group">
                        <div className="overflow-hidden border-b border-border/30 pb-4 hover:border-primary/40 transition-colors">
                          {firstImage && (
                            <div className="aspect-video overflow-hidden mb-3">
                              <img
                                src={firstImage.url}
                                alt="Gjennomføring"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          )}
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
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Reviews – always visible */}
          {reviews && reviews.length > 0 && (
            <>
              <SectionDivider />
              <div id="anmeldelser" className="scroll-mt-28">
                <SectionHeading>Anmeldelser</SectionHeading>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-border/30 pb-6 last:border-0">
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
                      {review.comment && <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
