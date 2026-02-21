import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import IconPlate from "@/components/icons/IconPlate";
import { courseTypeLabels, languageLabels } from "@/lib/types";
import { ArrowRight } from "lucide-react";

export default function Courses() {
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

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Kurs</h1>
        <p className="text-muted-foreground mb-8">Alle våre kurs tilbys på bestilling til din bedrift</p>

        {isLoading && <p className="text-muted-foreground">Laster kurs...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course: any) => {
            const cat = course.category;
            return (
              <Link key={course.id} to={`/kurs/${course.slug}`} className="group">
                <div className="bg-card border border-border hover:border-primary/60 hover:shadow-[0_0_30px_hsl(45_100%_50%/0.08)] transition-all h-full overflow-hidden relative">
                  {course.image_url && (
                    <div className="aspect-[3/1] overflow-hidden">
                      <img src={course.image_url} alt={course.title} className="w-full h-full object-cover" />
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
                  {/* Icon – bottom right corner */}
                  {cat && (
                    <div className="absolute bottom-4 right-4">
                      <IconPlate
                        svg={cat.icon_svg}
                        pngUrl={cat.icon_png_url}
                        sizePx={72}
                        variant={cat.icon_plate_variant || "dark"}
                      />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {courses?.length === 0 && !isLoading && (
          <p className="text-muted-foreground text-center py-12">Ingen kurs tilgjengelig</p>
        )}
      </div>
    </div>
  );
}
