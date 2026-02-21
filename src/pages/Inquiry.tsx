import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { languageLabels } from "@/lib/types";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

export default function Inquiry() {
  const [searchParams] = useSearchParams();
  const preselectedCourse = searchParams.get("kurs") || "";

  const [submitted, setSubmitted] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
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
    queryKey: ["public-courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, title").order("title");
      if (error) throw error;
      return data;
    },
  });

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
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-1 block">Kurs</label>
            <select
              value={form.course_id}
              onChange={(e) => update("course_id", e.target.value)}
              className="w-full border border-border bg-background text-foreground px-3 py-2 text-sm"
            >
              <option value="">Velg kurs (valgfritt)</option>
              {courses?.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
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
