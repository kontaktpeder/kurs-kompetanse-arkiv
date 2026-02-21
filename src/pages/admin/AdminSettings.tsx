import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MediaUploadField from "@/components/MediaUploadField";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function AdminSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setHeroTitle(settings.home_hero_title || "");
      setHeroSubtitle(settings.home_hero_subtitle || "");
      setHeroImageUrl(settings.home_hero_image_url || null);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("site_settings")
        .update({
          home_hero_title: heroTitle || null,
          home_hero_subtitle: heroSubtitle || null,
          home_hero_image_url: heroImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Innstillinger lagret");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleImageChange = async (url: string | null) => {
    setHeroImageUrl(url);
    // Save immediately
    await supabase
      .from("site_settings")
      .update({ home_hero_image_url: url, updated_at: new Date().toISOString() })
      .eq("id", 1);
    queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
    queryClient.invalidateQueries({ queryKey: ["site-settings"] });
  };

  if (isLoading) return <p className="text-muted-foreground">Laster...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Innstillinger</h1>

      <div className="bg-card border border-border rounded-lg p-6 max-w-lg space-y-6">
        <h2 className="text-lg font-semibold" style={{ fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase' }}>
          Forside – Hero
        </h2>

        <MediaUploadField
          label="Forside-hero bilde"
          helperText="Vises som bakgrunnsbilde i hero-seksjonen på forsiden."
          value={heroImageUrl}
          onChange={handleImageChange}
          folder="site"
          filePrefix="home-hero"
        />

        <div>
          <label className="text-sm font-medium mb-1 block">Hero-tittel</label>
          <Input
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            placeholder="F.eks. Kurs som gir kompetanse"
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Hero-undertekst</label>
          <Input
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            placeholder="F.eks. Sertifisert opplæring på norsk, engelsk og tegnspråk"
          />
        </div>

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full"
        >
          {saveMutation.isPending ? "Lagrer..." : "Lagre innstillinger"}
        </Button>
      </div>
    </div>
  );
}
