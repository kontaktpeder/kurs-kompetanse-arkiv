import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, RefreshCw, ExternalLink, CheckCircle2, AlertTriangle } from "lucide-react";

interface SitemapStatus {
  generatedAt: string;
  totalUrls: number;
  staticCount: number;
  coursesCount: number;
  archiveCount: number;
  verified: boolean;
  staticPaths?: string[];
  courseUrls?: string[];
  archiveUrls?: string[];
}

export default function AdminSitemap() {
  const [status, setStatus] = useState<SitemapStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [xmlUrlCount, setXmlUrlCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusRes, xmlRes] = await Promise.all([
        fetch("/sitemap-status.json", { cache: "no-store" }),
        fetch("/sitemap.xml", { cache: "no-store" }),
      ]);
      if (statusRes.ok) {
        setStatus(await statusRes.json());
      } else {
        setStatus(null);
        setError("status-fil mangler");
      }
      if (xmlRes.ok) {
        const xml = await xmlRes.text();
        const matches = xml.match(/<loc>/g);
        setXmlUrlCount(matches ? matches.length : 0);
      } else {
        setXmlUrlCount(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ukjent feil");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalsMatch =
    status !== null && xmlUrlCount !== null && status.totalUrls === xmlUrlCount;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl uppercase tracking-tight">Sitemap</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Status for <code>public/sitemap.xml</code>. Genereres automatisk ved <code>npm run build</code>.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Henter…" : "Oppdater status"}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/robots.txt" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Åpne robots.txt
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/sitemap.xml" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Åpne sitemap.xml
            </a>
          </Button>
        </div>
      </div>

      {error && (
        <div className="border border-destructive/30 bg-destructive/5 p-4 text-sm">
          Fant ikke status-fil ({error}). Kjør <code>npm run generate:sitemap</code> og deploy på nytt.
        </div>
      )}

      {status && xmlUrlCount !== null && (
        <div
          className={`border p-4 text-sm flex items-center gap-3 ${
            totalsMatch
              ? "border-primary/40 bg-primary/5"
              : "border-destructive/40 bg-destructive/5"
          }`}
        >
          {totalsMatch ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          )}
          <div>
            {totalsMatch ? (
              <span className="font-medium">Sitemap matcher status ({xmlUrlCount} URL-er).</span>
            ) : (
              <span className="font-medium">
                Avvik mellom status-fil ({status.totalUrls}) og sitemap.xml ({xmlUrlCount}).
                Kjør <code>npm run generate:sitemap</code> på nytt.
              </span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="URL-er totalt" value={status?.totalUrls ?? xmlUrlCount ?? "—"} />
        <Stat label="Statiske sider" value={status?.staticCount ?? "—"} />
        <Stat label="Aktive kurs" value={status?.coursesCount ?? "—"} />
        <Stat label="Publiserte arkivposter" value={status?.archiveCount ?? "—"} />
      </div>

      <div className="border border-border p-4 space-y-2 text-sm">
        <div>
          <span className="text-muted-foreground">Sist generert:</span>{" "}
          <span className="font-medium">
            {status?.generatedAt
              ? new Date(status.generatedAt).toLocaleString("nb-NO")
              : "Ukjent"}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Verifisert mot HTTP 200:</span>{" "}
          <span className="font-medium">{status?.verified ? "Ja" : "Nei"}</span>
        </div>
      </div>

      {status?.staticPaths && status.staticPaths.length > 0 && (
        <section className="border border-border p-4">
          <h2 className="font-heading uppercase text-sm tracking-wider mb-3">
            Statiske URL-er ({status.staticPaths.length})
          </h2>
          <ul className="space-y-1 text-sm font-mono">
            {status.staticPaths.map((u) => (
              <li key={u}>
                <a href={u} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {u}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <UrlListCollapsible title="Kurs-URL-er" urls={status?.courseUrls} />
      <UrlListCollapsible title="Arkiv-URL-er" urls={status?.archiveUrls} />

      <div className="border border-primary/40 bg-primary/5 p-4 text-sm space-y-2">
        <p className="font-semibold uppercase tracking-wider">Ved publisering av nytt innhold</p>
        <p>Sitemap regenereres automatisk ved hver build. For manuell oppdatering lokalt:</p>
        <pre className="bg-background border border-border p-2 overflow-x-auto text-xs">
{`npm run generate:sitemap
# eller med HTTP-verifikasjon:
npm run generate:sitemap:verify`}
        </pre>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-border p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-3xl font-heading mt-1">{value}</div>
    </div>
  );
}

function UrlListCollapsible({ title, urls }: { title: string; urls?: string[] }) {
  const count = urls?.length ?? 0;
  return (
    <Collapsible className="border border-border">
      <CollapsibleTrigger className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/40 transition-colors">
        <span className="font-heading uppercase text-sm tracking-wider">
          {title} ({count})
        </span>
        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4">
          {count === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen URL-er.</p>
          ) : (
            <ul className="space-y-1 text-sm font-mono max-h-72 overflow-y-auto">
              {urls!.map((u) => (
                <li key={u}>
                  <a href={u} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {u}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
