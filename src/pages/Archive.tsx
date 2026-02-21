import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { type MediaItem } from "@/lib/types";
import IconPlate from "@/components/icons/IconPlate";
import { MapPin, Calendar, Users, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";

export default function Archive() {
  const [courseFilter, setCourseFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");

  const { data: courses } = useQuery({
    queryKey: ["public-courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, title, category_slug").order("title");
      if (error) throw error;
      return data;
    },
  });

  const { data: catMap } = useQuery({
    queryKey: ["public-categories-map"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_categories" as any)
        .select("slug, name, icon_svg, icon_png_url, icon_size_px, icon_plate_variant")
        .eq("is_active", true);
      if (error) throw error;
      return new Map((data as any[] || []).map((c: any) => [c.slug, c]));
    },
  });

  const { data: runs, isLoading } = useQuery({
    queryKey: ["public-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_runs")
        .select("*, courses(title, slug, category_slug)")
        .order("date_start", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const years = [...new Set(runs?.map((r) => r.date_start ? new Date(r.date_start).getFullYear().toString() : null).filter(Boolean) || [])];

  const filtered = runs?.filter((r) => {
    if (courseFilter && r.course_id !== courseFilter) return false;
    if (yearFilter && r.date_start && !r.date_start.startsWith(yearFilter)) return false;
    return true;
  });

  const getSpan = (i: number) => {
    if (i === 0) return "md:col-span-2 md:row-span-2";
    if (i % 5 === 3) return "md:col-span-2";
    return "";
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Arkiv</h1>
        <p className="text-muted-foreground mb-8">Dokumenterte kursgjennomføringer</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="border border-border bg-card text-foreground px-3 py-2 text-sm"
          >
            <option value="">Alle kurs</option>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="border border-border bg-card text-foreground px-3 py-2 text-sm"
          >
            <option value="">Alle år</option>
            {years.map((y) => (
              <option key={y} value={y!}>{y}</option>
            ))}
          </select>
        </div>

        {isLoading && <p className="text-muted-foreground">Laster...</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered?.map((run, i) => {
            const media = (run.media as unknown as MediaItem[]) || [];
            const firstImage = media.find((m) => m.type === "image");
            const courseData = run.courses as unknown as { title: string; slug: string; category_slug: string | null } | null;
            const cat = courseData?.category_slug && catMap ? catMap.get(courseData.category_slug) : null;
            return (
              <Link key={run.id} to={`/arkiv/${run.id}`} className={`group ${getSpan(i)}`}>
                <div className="bg-card border border-border hover:border-primary/40 transition-all overflow-hidden h-full relative">
                  <div className={`bg-secondary overflow-hidden relative ${getSpan(i).includes("row-span-2") ? "aspect-square" : "aspect-video"}`}>
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
                    {/* IconPlate overlay */}
                    {cat && (
                      <div className="absolute top-3 left-3">
                        <IconPlate
                          svg={cat.icon_svg}
                          pngUrl={cat.icon_png_url}
                          sizePx={48}
                          variant={cat.icon_plate_variant || "dark"}
                        />
                      </div>
                    )}
                    {/* Pass badge */}
                    {run.passed_count != null && run.participants_count != null && (
                      <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 uppercase tracking-wider">
                        {run.passed_count}/{run.participants_count} bestått
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2" style={{ fontFamily: 'Oswald, sans-serif' }}>{courseData?.title || "Kurs"}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
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

        {filtered?.length === 0 && !isLoading && (
          <p className="text-muted-foreground text-center py-12">Ingen gjennomføringer funnet</p>
        )}
      </div>
    </div>
  );
}
