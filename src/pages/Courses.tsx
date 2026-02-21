import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { getIcon } from "@/lib/icons";
import { courseTypeLabels, languageLabels } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Courses() {
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [langFilter, setLangFilter] = useState<string>("");

  const { data: courses, isLoading } = useQuery({
    queryKey: ["public-courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").order("title");
      if (error) throw error;
      return data;
    },
  });

  const filtered = courses?.filter((c) => {
    if (typeFilter && c.course_type !== typeFilter) return false;
    if (langFilter && !c.languages.includes(langFilter)) return false;
    return true;
  });

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Kurs</h1>
        <p className="text-muted-foreground mb-8">Alle våre kurs tilbys på bestilling til din bedrift</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
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
          {filtered?.map((course) => {
            const Icon = getIcon(course.icon_key);
            return (
              <Link key={course.id} to={`/kurs/${course.slug}`} className="group">
                <div className="bg-card border border-border hover:border-primary/60 hover:shadow-[0_0_30px_hsl(45_100%_50%/0.08)] transition-all h-full overflow-hidden">
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
                    <p className="text-muted-foreground text-sm mb-3">{course.short_description}</p>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {course.languages.map((l) => (
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
