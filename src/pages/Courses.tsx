import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import IconPlate from "@/components/icons/IconPlate";
import { courseTypeLabels, languageLabels } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Courses() {
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [langFilter, setLangFilter] = useState<string>("");
  const [catFilter, setCatFilter] = useState<string>("");

  const { data: categories } = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_categories" as any)
        .select("slug, name, icon_svg, icon_png_url, icon_size_px, icon_plate, icon_plate_variant")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: courses, isLoading } = useQuery({
    queryKey: ["public-courses-with-category"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").order("title");
      if (error) throw error;
      const { data: cats } = await supabase
        .from("course_categories" as any)
        .select("slug, name, icon_svg, icon_png_url, icon_size_px, icon_plate, icon_plate_variant");
      const catMap = new Map((cats as any[] || []).map((c: any) => [c.slug, c]));
      return (data || []).map((c: any) => ({ ...c, category: catMap.get(c.category_slug) || null }));
    },
  });

  const filtered = courses?.filter((c) => {
    if (typeFilter && c.course_type !== typeFilter) return false;
    if (langFilter && !c.languages.includes(langFilter)) return false;
    if (catFilter && c.category_slug !== catFilter) return false;
    return true;
  });

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Kurs</h1>
        <p className="text-muted-foreground mb-8">Alle våre kurs tilbys på bestilling til din bedrift</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Category filter with IconPlate mini */}
          {categories && categories.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Kategori:</span>
              <div className="flex gap-1 flex-wrap">
                <Button
                  variant={catFilter === "" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCatFilter("")}
                >
                  Alle
                </Button>
                {categories.map((cat: any) => (
                  <Button
                    key={cat.slug}
                    variant={catFilter === cat.slug ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCatFilter(cat.slug)}
                    className="flex items-center gap-1.5"
                  >
                    <IconPlate
                      svg={cat.icon_svg}
                      pngUrl={cat.icon_png_url}
                      sizePx={28}
                      variant={catFilter === cat.slug ? "yellow" : "dark"}
                      className="rounded-[3px]"
                    />
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Type:</span>
            <div className="flex gap-1">
              {["", "certified", "documented", "other"].map((t) => (
                <Button
                  key={t}
                  variant={typeFilter === t ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter(t)}
                >
                  {t === "" ? "Alle" : courseTypeLabels[t]}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Språk:</span>
            <div className="flex gap-1">
              {["", "no", "en", "sign"].map((l) => (
                <Button
                  key={l}
                  variant={langFilter === l ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLangFilter(l)}
                >
                  {l === "" ? "Alle" : languageLabels[l]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {isLoading && <p className="text-muted-foreground">Laster kurs...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered?.map((course: any) => {
            const cat = course.category;
            return (
              <Link key={course.id} to={`/kurs/${course.slug}`} className="group">
                <div className="bg-card border border-border hover:border-primary/60 hover:shadow-[0_0_30px_hsl(45_100%_50%/0.08)] transition-all h-full overflow-hidden">
                  {course.image_url ? (
                    <div className="aspect-[3/1] overflow-hidden relative">
                      <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
                      {/* IconPlate badge overlay on image */}
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
                    </div>
                  ) : (
                    <div className="p-6 pb-0 flex items-start">
                      <IconPlate
                        svg={cat?.icon_svg}
                        pngUrl={cat?.icon_png_url}
                        sizePx={56}
                        variant={cat?.icon_plate_variant || "dark"}
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors" style={{ fontFamily: 'Oswald, sans-serif' }}>
                      {course.title}
                    </h3>
                    <span className="inline-block text-xs uppercase tracking-wider bg-secondary text-muted-foreground px-2 py-0.5 mb-3">
                      {courseTypeLabels[course.course_type] ?? course.course_type}
                    </span>
                    <p className="text-muted-foreground text-sm mb-3">{course.short_description}</p>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {(course.languages ?? []).map((l: string) => (
                        <span key={l} className="text-[10px] uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5">
                          {languageLabels[l] ?? l}
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

        {filtered?.length === 0 && !isLoading && (
          <p className="text-muted-foreground text-center py-12">Ingen kurs matcher filtrene</p>
        )}
      </div>
    </div>
  );
}
