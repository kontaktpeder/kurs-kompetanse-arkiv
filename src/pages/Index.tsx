import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getIcon } from "@/lib/icons";
import { courseTypeLabels, type MediaItem } from "@/lib/types";
import defaultHeroImage from "@/assets/hero-training.jpg";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

export default function Index() {
  const { data: courses } = useQuery({
    queryKey: ["public-courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").order("title");
      if (error) throw error;
      return data;
    },
  });

  const { data: recentRuns } = useQuery({
    queryKey: ["recent-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_runs")
        .select("*, courses(title, slug)")
        .order("date_start", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  const { data: faqs } = useQuery({
    queryKey: ["public-faqs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("faqs").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: siteSettings } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
      if (error) throw error;
      return data;
    },
  });

  // Stats
  const { data: totalRuns } = useQuery({
    queryKey: ["stats-total-runs"],
    queryFn: async () => {
      const { count, error } = await supabase.from("course_runs").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const heroImage = siteSettings?.home_hero_image_url || defaultHeroImage;

  return (
    <>
      {/* HERO – Split 60/40 */}
      <section className="min-h-[80vh] grid grid-cols-1 lg:grid-cols-5">
        {/* Left – Content */}
        <div className="lg:col-span-3 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-20">
          <p className="text-primary text-sm uppercase tracking-[0.3em] font-semibold mb-6">Sertifisert opplæring</p>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] mb-6">
            Kurs som gir<br />kompetanse
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mb-10">
            Sertifisert og dokumentert opplæring – på norsk, engelsk og tegnspråk.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg">
              <Link to="/kurs">Se kurs</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/foresporsel">Send forespørsel</Link>
            </Button>
          </div>
        </div>

        {/* Right – Image + fact block */}
        <div className="lg:col-span-2 relative">
          <img src={heroImage} alt="Kursopplæring" className="w-full h-full object-cover min-h-[400px]" />
          {/* Yellow fact block */}
          <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>2006</div>
              <div className="text-xs uppercase tracking-wider opacity-80">Siden</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>{totalRuns ?? "—"}</div>
              <div className="text-xs uppercase tracking-wider opacity-80">Gjennomføringer</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>3</div>
              <div className="text-xs uppercase tracking-wider opacity-80">Språk</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ fontFamily: 'Oswald, sans-serif' }}>98%</div>
              <div className="text-xs uppercase tracking-wider opacity-80">Bestått</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS – Large numbers */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {[
            { num: "2006", label: "Erfaring siden" },
            { num: totalRuns ?? "—", label: "Gjennomføringer" },
            { num: "3", label: "Språk" },
            { num: "98%", label: "Bestått-rate" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-6xl sm:text-7xl lg:text-8xl font-bold text-primary leading-none mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>
                {stat.num}
              </div>
              <div className="text-sm uppercase tracking-widest text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* COURSES – Dark cards with yellow top stripe */}
      {courses && courses.length > 0 && (
        <section className="py-20 px-4 bg-secondary/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Kurs vi tilbyr</h2>
            <p className="text-muted-foreground mb-12 max-w-xl">
              Alle kurs tilbys på bestilling og tilpasses din bedrift
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const Icon = getIcon(course.icon_key);
                return (
                  <Link key={course.id} to={`/kurs/${course.slug}`} className="group">
                    <div className="bg-card border border-border hover:border-primary/60 hover:shadow-[0_0_30px_hsl(45_100%_50%/0.08)] transition-all h-full overflow-hidden">
                      {/* Yellow top stripe */}
                      {course.image_url ? (
                        <div className="aspect-[3/1] overflow-hidden">
                          <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-1 bg-primary" />
                      )}
                      <div className="p-6">
                        {!course.image_url && <Icon className="h-7 w-7 text-primary mb-4" strokeWidth={1.5} />}
                        <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors" style={{ fontFamily: 'Oswald, sans-serif' }}>
                          {course.title}
                        </h3>
                        <span className="inline-block text-xs uppercase tracking-wider bg-secondary text-muted-foreground px-2 py-0.5 mb-3">
                          {courseTypeLabels[course.course_type] ?? course.course_type}
                        </span>
                        <p className="text-muted-foreground text-sm mb-4">{course.short_description}</p>
                        <div className="flex gap-2 flex-wrap mb-4">
                          {course.languages.map((l) => (
                            <span key={l} className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5">
                              {l === "no" ? "NO" : l === "en" ? "EN" : "🤟"}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs uppercase tracking-wider text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                          Se kurs <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* RECENT RUNS */}
      {recentRuns && recentRuns.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Siste gjennomførte kurs</h2>
            <p className="text-muted-foreground mb-12">Dokumenterte kursgjennomføringer</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentRuns.map((run) => {
                const media = (run.media as unknown as MediaItem[]) || [];
                const firstImage = media.find((m) => m.type === "image");
                const courseData = run.courses as unknown as { title: string; slug: string } | null;
                return (
                  <Link key={run.id} to={`/arkiv/${run.id}`} className="group">
                    <div className="bg-card border border-border hover:border-primary/40 transition-all overflow-hidden">
                      <div className="aspect-video bg-secondary overflow-hidden relative">
                        {firstImage ? (
                          <img
                            src={firstImage.url}
                            alt={courseData?.title || "Kurs"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Calendar className="h-10 w-10" strokeWidth={1} />
                          </div>
                        )}
                        {/* Badge */}
                        {run.passed_count != null && run.participants_count != null && (
                          <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 uppercase tracking-wider">
                            {run.passed_count}/{run.participants_count} bestått
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-1" style={{ fontFamily: 'Oswald, sans-serif' }}>{courseData?.title || "Kurs"}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {run.location_text && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" /> {run.location_text}
                            </span>
                          )}
                          {run.date_start && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {run.date_label || format(new Date(run.date_start), "MMM yyyy", { locale: nb })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-10">
              <Button asChild variant="outline">
                <Link to="/arkiv">Se alle gjennomføringer</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* WHY CHOOSE US – Horizontal layout */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Hvorfor velge oss</h2>
            <p className="text-muted-foreground">Over 15 års erfaring med sertifisert kursopplæring for industri, bygg og anlegg.</p>
          </div>
          <div className="space-y-6">
            {[
              { title: "Sertifisert opplæring", desc: "Våre kurs følger gjeldende forskrifter og standarder. Du får dokumentasjon som holder." },
              { title: "Flerspråklig", desc: "Vi tilbyr kurs på norsk, engelsk og tegnspråk – tilpasset dine ansatte." },
              { title: "Erfaring siden 2006", desc: "Over 15 års erfaring med kursopplæring for industri, bygg og anlegg." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 items-start border-l-2 border-primary pl-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: 'Oswald, sans-serif' }}>{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqs && faqs.length > 0 && (
        <section className="py-20 px-4 bg-secondary/50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center">Vanlige spørsmål</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="bg-card border border-border px-5">
                  <AccordionTrigger className="text-left font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* CTA – Raw */}
      <section className="py-24 px-4 text-center border-t border-primary/20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl lg:text-6xl font-bold mb-6">Klar for å bestille kurs?</h2>
          <p className="text-muted-foreground text-lg mb-10">
            Send oss en forespørsel, så tar vi kontakt med et tilpasset tilbud.
          </p>
          <Button asChild size="lg" className="px-16 h-14 text-lg">
            <Link to="/foresporsel">Send forespørsel</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
