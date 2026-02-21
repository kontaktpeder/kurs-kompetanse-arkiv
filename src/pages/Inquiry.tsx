import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { languageLabels } from "@/lib/types";
import { toast } from "sonner";
import { CheckCircle, ChevronDown } from "lucide-react";
import IconPlate from "@/components/icons/IconPlate";

interface CourseOption {
  id: string;
  title: string;
  category_slug: string | null;
  category?: {
    icon_svg: string | null;
    icon_png_url: string | null;
    icon_plate_variant: string;
  } | null;
}

export default function Inquiry() {
  const [searchParams] = useSearchParams();
  const preselectedCourse = searchParams.get("kurs") || "";

  const [submitted, setSubmitted] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    course_id: preselectedCourse,
    name: "",
    email: "",
    phone: "",
    company: "",
    participants_estimate: "",
    language_preference: "",
    location_text: "",
    desired_timeframe: "",
    message: "",
  });

  const { data: courses } = useQuery({
    queryKey: ["public-courses-inquiry"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, title, category_slug").order("title");
      if (error) throw error;
      const { data: cats } = await supabase
        .from("course_categories" as any)
        .select("slug, icon_svg, icon_png_url, icon_plate_variant");
      const catMap = new Map((cats as any[] || []).map((c: any) => [c.slug, c]));
      return (data || []).map((c: any): CourseOption => ({
        ...c,
        category: catMap.get(c.category_slug) || null,
      }));
    },
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("leads").insert({
        course_id: form.course_id || null,
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        company: form.company.trim() || null,
        participants_estimate: form.participants_estimate ? parseInt(form.participants_estimate) : null,
        language_preference: form.language_preference || null,
        location_text: form.location_text.trim() || null,
        desired_timeframe: form.desired_timeframe.trim() || null,
        message: form.message.trim() || null,
        status: "new",
      });
      if (error) throw error;
    },
    onSuccess: () => setSubmitted(true),
    onError: (e: Error) => toast.error("Noe gikk galt: " + e.message),
  });

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const selectedCourse = courses?.find((c) => c.id === form.course_id);

  if (submitted) {
    return (
      <div className="py-20 px-4">
        <div className="max-w-lg mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-6" strokeWidth={1.5} />
          <h1 className="text-4xl font-bold mb-4">Takk for din forespørsel!</h1>
          <p className="text-muted-foreground">Vi tar kontakt med deg så snart som mulig med et tilpasset tilbud.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Send forespørsel</h1>
        <p className="text-muted-foreground mb-8">
          Fyll ut skjemaet, så tar vi kontakt med et tilpasset tilbud
        </p>

        <div className="bg-secondary border border-border p-6 space-y-4">
          {/* Custom course dropdown with icons */}
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Kurs</label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full border border-border bg-background text-foreground px-3 py-2 text-sm text-left flex items-center gap-2 justify-between"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {selectedCourse ? (
                    <>
                      {selectedCourse.category && (
                        <IconPlate
                          svg={selectedCourse.category.icon_svg}
                          pngUrl={selectedCourse.category.icon_png_url}
                          sizePx={28}
                          variant={selectedCourse.category.icon_plate_variant as "dark" | "yellow" || "dark"}
                          className="rounded-[3px] shrink-0"
                        />
                      )}
                      <span className="truncate">{selectedCourse.title}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Velg kurs (valgfritt)</span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>

              {dropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-background border border-border shadow-lg max-h-64 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => { update("course_id", ""); setDropdownOpen(false); }}
                    className="w-full px-3 py-2 text-sm text-left text-muted-foreground hover:bg-secondary transition-colors"
                  >
                    Velg kurs (valgfritt)
                  </button>
                  {courses?.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => { update("course_id", c.id); setDropdownOpen(false); }}
                      className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 hover:bg-secondary transition-colors ${
                        form.course_id === c.id ? "bg-secondary" : ""
                      }`}
                    >
                      {c.category && (
                        <IconPlate
                          svg={c.category.icon_svg}
                          pngUrl={c.category.icon_png_url}
                          sizePx={24}
                          variant={c.category.icon_plate_variant as "dark" | "yellow" || "dark"}
                          className="rounded-[2px] shrink-0"
                        />
                      )}
                      <span className="truncate">{c.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Navn *</label>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">E-post</label>
              <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Telefon</label>
              <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Bedrift</label>
              <Input value={form.company} onChange={(e) => update("company", e.target.value)} />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Antall deltakere (ca.)</label>
              <Input type="number" value={form.participants_estimate} onChange={(e) => update("participants_estimate", e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Foretrukket språk</label>
              <select
                value={form.language_preference}
                onChange={(e) => update("language_preference", e.target.value)}
                className="w-full border border-border bg-background text-foreground px-3 py-2 text-sm"
              >
                <option value="">Velg språk</option>
                {Object.entries(languageLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Ønsket tidspunkt</label>
              <Input value={form.desired_timeframe} onChange={(e) => update("desired_timeframe", e.target.value)} placeholder="f.eks. Mars 2026" />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Sted</label>
            <Input value={form.location_text} onChange={(e) => update("location_text", e.target.value)} placeholder="Hvor skal kurset holdes?" />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Melding</label>
            <Textarea value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="Eventuelle ønsker eller spørsmål..." rows={4} />
          </div>

          <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              Jeg har lest og godtar{" "}
              <Link to="/vilkar" className="text-primary underline hover:no-underline">vilkår</Link>
              {" "}og{" "}
              <Link to="/personvern" className="text-primary underline hover:no-underline">personvern</Link>
            </span>
          </label>

          <Button
            onClick={() => mutation.mutate()}
            disabled={!form.name.trim() || !acceptedTerms || mutation.isPending}
            size="lg"
            className="w-full"
          >
            {mutation.isPending ? "Sender..." : "Send forespørsel"}
          </Button>
        </div>
      </div>
    </div>
  );
}
