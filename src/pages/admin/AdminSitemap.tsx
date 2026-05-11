import { useEffect, useState } from "react";

interface SitemapStatus {
  generatedAt: string;
  totalUrls: number;
  staticCount: number;
  coursesCount: number;
  archiveCount: number;
  verified: boolean;
}

export default function AdminSitemap() {
  const [status, setStatus] = useState<SitemapStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [urlCount, setUrlCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/sitemap-status.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("status mangler"))))
      .then(setStatus)
      .catch((e) => setError(e.message));

    fetch("/sitemap.xml", { cache: "no-store" })
      .then((r) => r.text())
      .then((xml) => {
        const matches = xml.match(/<loc>/g);
        setUrlCount(matches ? matches.length : 0);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl uppercase tracking-tight">Sitemap</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Status for <code>public/sitemap.xml</code>. Genereres automatisk ved <code>npm run build</code>.
        </p>
      </div>

      {error && (
        <div className="border border-destructive/30 bg-destructive/5 p-4 text-sm">
          Fant ikke status-fil ({error}). Kjør <code>npm run generate:sitemap</code> og deploy på nytt.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="URL-er totalt" value={status?.totalUrls ?? urlCount ?? "—"} />
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
        <div className="pt-2">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="text-primary underline"
          >
            Åpne sitemap.xml
          </a>
        </div>
      </div>

      <div className="border border-primary/40 bg-primary/5 p-4 text-sm space-y-2">
        <p className="font-semibold uppercase tracking-wider">Ved publisering av nytt innhold</p>
        <p>
          Sitemap regenereres automatisk ved hver build. For å oppdatere manuelt lokalt:
        </p>
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
