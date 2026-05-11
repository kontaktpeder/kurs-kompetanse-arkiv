import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, RefreshCw, ExternalLink, CheckCircle2, AlertTriangle, Download } from "lucide-react";

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

function formatRelative(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(diffMs)) return "ukjent";
  const sec = Math.round(diffMs / 1000);
  if (sec < 60) return `${sec} sekunder siden`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min} ${min === 1 ? "minutt" : "minutter"} siden`;
  const hours = Math.round(min / 60);
  if (hours < 48) return `${hours} ${hours === 1 ? "time" : "timer"} siden`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? "dag" : "dager"} siden`;
}

function filterUrls(urls: string[] | undefined, q: string): string[] {
  if (!urls) return [];
  if (!q.trim()) return urls;
  const needle = q.trim().toLowerCase();
  return urls.filter((u) => u.toLowerCase().includes(needle));
}

export default function AdminSitemap() {
  const [status, setStatus] = useState<SitemapStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [xmlUrlCount, setXmlUrlCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

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

  const filteredStatic = useMemo(() => filterUrls(status?.staticPaths, query), [status, query]);
  const filteredCourses = useMemo(() => filterUrls(status?.courseUrls, query), [status, query]);
  const filteredArchive = useMemo(() => filterUrls(status?.archiveUrls, query), [status, query]);

  const totalAll =
    (status?.staticPaths?.length ?? 0) +
    (status?.courseUrls?.length ?? 0) +
    (status?.archiveUrls?.length ?? 0);
  const filteredTotal = filteredStatic.length + filteredCourses.length + filteredArchive.length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl uppercase tracking-tight">Sitemap</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Status for <code>public/sitemap.xml</code>. Genereres automatisk ved <code>npm run build</code>.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
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
          <Button variant="outline" size="sm" asChild>
            <a href="/sitemap-status.json" target="_blank" rel="noreferrer" download>
              <Download className="h-4 w-4 mr-2" />
              Last ned statusfil
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
          {status?.generatedAt && (
            <span className="text-muted-foreground"> · {formatRelative(status.generatedAt)}</span>
          )}
        </div>
        <div>
          <span className="text-muted-foreground">Verifisert mot HTTP 200:</span>{" "}
          <span className="font-medium">{status?.verified ? "Ja" : "Nei"}</span>
        </div>
      </div>

      {status && (
        <div className="space-y-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk i sitemap…"
            className="max-w-md"
          />
          <p className="text-xs text-muted-foreground">
            Viser {filteredTotal} av {totalAll} URL-er
            {query && <> (filter: <code>{query}</code>)</>}
          </p>
        </div>
      )}

      {status?.staticPaths && status.staticPaths.length > 0 && (
        <section className="border border-border p-4">
          <h2 className="font-heading uppercase text-sm tracking-wider mb-3">
            Statiske URL-er ({filteredStatic.length}/{status.staticPaths.length})
          </h2>
          {filteredStatic.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen treff.</p>
          ) : (
            <ul className="space-y-1 text-sm font-mono">
              {filteredStatic.map((u) => (
                <li key={u}>
                  <a href={u} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    {u}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <UrlListCollapsible
        title="Kurs-URL-er"
        urls={filteredCourses}
        totalCount={status?.courseUrls?.length ?? 0}
        forceOpen={query.length > 0 && filteredCourses.length > 0}
      />
      <UrlListCollapsible
        title="Arkiv-URL-er"
        urls={filteredArchive}
        totalCount={status?.archiveUrls?.length ?? 0}
        forceOpen={query.length > 0 && filteredArchive.length > 0}
      />

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

function UrlListCollapsible({
  title,
  urls,
  totalCount,
  forceOpen,
}: {
  title: string;
  urls: string[];
  totalCount: number;
  forceOpen?: boolean;
}) {
  return (
    <Collapsible className="border border-border" open={forceOpen || undefined}>
      <CollapsibleTrigger className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/40 transition-colors">
        <span className="font-heading uppercase text-sm tracking-wider">
          {title} ({urls.length}/{totalCount})
        </span>
        <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4">
          {urls.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen URL-er.</p>
          ) : (
            <ul className="space-y-1 text-sm font-mono max-h-72 overflow-y-auto">
              {urls.map((u) => (
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
