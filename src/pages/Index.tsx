import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getIcon } from "@/lib/icons";
import { courseTypeLabels, type MediaItem } from "@/lib/types";
import heroImage from "@/assets/hero-training.jpg";
import { MapPin, Calendar, ShieldCheck, Globe, Award, CheckCircle } from "lucide-react";
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

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center justify-center">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Kursopplæring" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-industrial/80" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-industrial-foreground mb-6 leading-tight">
            Kurs som gir kompetanse – siden 2006
          </h1>
          <p className="text-lg md:text-xl text-industrial-foreground/75 mb-10 max-w-2xl mx-auto">
            Sertifisert og dokumentert opplæring – på norsk, engelsk og tegnspråk
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/kurs">Se kurs</Link>
            </Button>
            <Button asChild size="lg" variant="outline-light">
              <Link to="/foresporsel">Send forespørsel</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Courses */}
      {courses && courses.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">Kurs vi tilbyr</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Alle kurs tilbys på bestilling og tilpasses din bedrift
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const Icon = getIcon(course.icon_key);
                return (
                  <Link key={course.id} to={`/kurs/${course.slug}`} className="group">
                    <div className="bg-card rounded-lg p-6 border border-border hover:border-primary/40 transition-colors h-full">
                      <Icon className="h-8 w-8 text-primary mb-4" strokeWidth={1.5} />
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                      </div>
                      <span className="inline-block text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded mb-3">
                        {courseTypeLabels[course.course_type] ?? course.course_type}
                      </span>
                      <p className="text-muted-foreground text-sm">{course.short_description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Recent Course Runs */}
      {recentRuns && recentRuns.length > 0 && (
        <section className="py-20 px-4 bg-secondary/40">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center">Siste gjennomførte kurs</h2>
            <p className="text-muted-foreground text-center mb-12">Dokumenterte kursgjennomføringer</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentRuns.map((run) => {
                const media = (run.media as unknown as MediaItem[]) || [];
                const firstImage = media.find((m) => m.type === "image");
                const courseData = run.courses as unknown as { title: string; slug: string } | null;
                return (
                  <Link key={run.id} to={`/arkiv/${run.id}`} className="group">
                    <div className="bg-card rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-colors">
                      <div className="aspect-video bg-muted overflow-hidden">
                        {firstImage ? (
                          <img
                            src={firstImage.url}
                            alt={courseData?.title || "Kurs"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Calendar className="h-10 w-10" strokeWidth={1} />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-1">{courseData?.title || "Kurs"}</h3>
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

      {/* Why Choose Us */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Hvorfor velge oss</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "Sertifisert opplæring",
                desc: "Våre kurs følger gjeldende forskrifter og standarder. Du får dokumentasjon som holder.",
              },
              {
                icon: Globe,
                title: "Flerspråklig",
                desc: "Vi tilbyr kurs på norsk, engelsk og tegnspråk – tilpasset dine ansatte.",
              },
              {
                icon: Award,
                title: "Erfaring siden 2006",
                desc: "Over 15 års erfaring med kursopplæring for industri, bygg og anlegg.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent mb-4">
                  <item.icon className="h-7 w-7 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqs && faqs.length > 0 && (
        <section className="py-20 px-4 bg-secondary/40">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Vanlige spørsmål</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {faqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="bg-card border border-border rounded-lg px-5">
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

      {/* CTA */}
      <section className="py-20 px-4 bg-industrial text-industrial-foreground text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Klar for å bestille kurs?</h2>
          <p className="text-industrial-foreground/70 mb-8">
            Send oss en forespørsel, så tar vi kontakt med et tilpasset tilbud.
          </p>
          <Button asChild size="lg">
            <Link to="/foresporsel">Send forespørsel</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
