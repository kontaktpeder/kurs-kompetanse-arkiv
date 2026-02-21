import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

function renderMarkdown(md: string) {
  // Simple markdown-to-HTML: headings, bold, links, line breaks
  return md
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("### ")) return `<h3 class="text-lg font-bold mt-6 mb-2 uppercase tracking-wide" style="font-family:Oswald,sans-serif">${trimmed.slice(4)}</h3>`;
      if (trimmed.startsWith("## ")) return `<h2 class="text-xl font-bold mt-8 mb-3 uppercase tracking-wide" style="font-family:Oswald,sans-serif">${trimmed.slice(3)}</h2>`;
      if (trimmed.startsWith("# ")) return `<h1 class="text-2xl font-bold mt-8 mb-4" style="font-family:Oswald,sans-serif">${trimmed.slice(2)}</h1>`;
      // Handle line breaks within a paragraph
      const html = trimmed
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary underline hover:no-underline">$1</a>')
        .replace(/\n/g, "<br />");
      return `<p class="text-sm text-muted-foreground leading-relaxed mb-4">${html}</p>`;
    })
    .join("");
}

export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: page, isLoading } = useQuery({
    queryKey: ["legal-page", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("legal_pages")
        .select("title, body_md")
        .eq("slug", slug!)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) return <div className="py-20 text-center text-muted-foreground">Laster...</div>;
  if (!page) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Siden finnes ikke</h1>
        <p className="text-muted-foreground">Denne siden er ikke publisert eller finnes ikke.</p>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: "Oswald, sans-serif" }}>{page.title}</h1>
        <div
          className="prose-custom"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(page.body_md) }}
        />
      </div>
    </div>
  );
}
