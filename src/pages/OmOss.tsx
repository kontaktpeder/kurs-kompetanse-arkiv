import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TeamMemberCard from "@/components/team/TeamMemberCard";
import { Globe, Hand } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function OmOss() {
  const { isAdmin } = useAuth();

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team_members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, name, title, bio, skills, photo_url, sort_order, created_at")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-secondary py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Om Lars Børre og teamet
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Vi har drevet med kurs siden 2006 og har bakgrunn som lærer, byggmester, entreprenør,
            kranfører, truckfører, hydraulikk og maskinutleie. Dette gir oss en bred erfaring for å
            gi deg den beste opplæringen.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">Teamet</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-lg border border-border animate-pulse h-80" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="mb-2">Ingen teammedlemmer lagt til ennå.</p>
            {isAdmin && (
              <Link to="/admin/innhold" className="text-primary hover:underline text-sm">
                Legg til i Admin →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((m) => (
              <TeamMemberCard
                key={m.id}
                name={m.name}
                title={m.title}
                bio={m.bio}
                skills={m.skills}
                photo_url={m.photo_url}
              />
            ))}
          </div>
        )}
      </section>

      {/* Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 sm:p-8 flex items-start gap-4">
          <div className="flex items-center gap-2 shrink-0 text-primary">
            <Globe className="h-5 w-5" />
            <Hand className="h-5 w-5" />
          </div>
          <p className="text-foreground text-sm sm:text-base leading-relaxed">
            Våre kurs kan også holdes på <strong>engelsk</strong> og <strong>tegnspråk</strong>.
          </p>
        </div>
      </section>
    </div>
  );
}
