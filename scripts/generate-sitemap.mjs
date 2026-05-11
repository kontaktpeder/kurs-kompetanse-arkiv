import { writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const SITE_ORIGIN = process.env.SITE_ORIGIN || "https://kurskragero.no";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const VERIFY_HTTP = process.env.SITEMAP_VERIFY_HTTP === "true";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    "[generate-sitemap] Missing SUPABASE env vars — skipping sitemap generation. " +
      "Existing public/sitemap.xml will be used as-is."
  );
  process.exit(0);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

const STATIC_PATHS = [
  "/",
  "/kurs",
  "/arkiv",
  "/foresporsel",
  "/om-oss",
  "/event-teambuilding",
  "/personvern",
  "/vilkar",
];

function toCanonicalUrl(path) {
  const url = new URL(path, SITE_ORIGIN);
  url.protocol = "https:";
  url.host = "kurskragero.no";
  return url.toString();
}

function xmlEscape(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function fetchCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("slug, updated_at, is_active")
    .eq("is_active", true);
  if (error) throw error;
  return (data || []).map((c) => ({
    path: `/kurs/${c.slug}`,
    lastmod: c.updated_at?.slice(0, 10),
  }));
}

async function fetchArchiveRuns() {
  const { data, error } = await supabase
    .from("course_runs")
    .select("id, updated_at, is_published")
    .eq("is_published", true);
  if (error) throw error;
  return (data || []).map((r) => ({
    path: `/arkiv/${r.id}`,
    lastmod: r.updated_at?.slice(0, 10),
  }));
}

async function validateHttp(url) {
  const res = await fetch(url, { method: "GET", redirect: "manual" });
  return { ok: res.status === 200, status: res.status };
}

async function main() {
  const [courseEntries, archiveEntries] = await Promise.all([fetchCourses(), fetchArchiveRuns()]);

  const today = new Date().toISOString().slice(0, 10);

  const all = [
    ...STATIC_PATHS.map((p) => ({ path: p, lastmod: today })),
    ...courseEntries,
    ...archiveEntries,
  ];

  const filtered = all.filter((e) => {
    const p = e.path.toLowerCase();
    if (p === "/login") return false;
    if (p === "/404") return false;
    if (p.startsWith("/admin")) return false;
    return true;
  });

  const uniqueMap = new Map();
  for (const entry of filtered) {
    const loc = toCanonicalUrl(entry.path);
    if (!uniqueMap.has(loc)) uniqueMap.set(loc, { loc, lastmod: entry.lastmod || today });
  }

  let finalEntries = Array.from(uniqueMap.values());

  if (VERIFY_HTTP) {
    const checked = [];
    for (const e of finalEntries) {
      const result = await validateHttp(e.loc);
      if (result.ok) checked.push(e);
      else console.warn(`Excluded non-200 URL: ${e.loc} (status ${result.status})`);
    }
    finalEntries = checked;
  }

  finalEntries.sort((a, b) => a.loc.localeCompare(b.loc));

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...finalEntries.map(
      (e) =>
        `  <url><loc>${xmlEscape(e.loc)}</loc><lastmod>${e.lastmod}</lastmod></url>`
    ),
    "</urlset>",
    "",
  ].join("\n");

  await writeFile("public/sitemap.xml", xml, "utf8");

  const status = {
    generatedAt: new Date().toISOString(),
    totalUrls: finalEntries.length,
    staticCount: STATIC_PATHS.length,
    coursesCount: courseEntries.length,
    archiveCount: archiveEntries.length,
    verified: VERIFY_HTTP,
    staticPaths: STATIC_PATHS.map(toCanonicalUrl),
    courseUrls: courseEntries.map((e) => toCanonicalUrl(e.path)).sort(),
    archiveUrls: archiveEntries.map((e) => toCanonicalUrl(e.path)).sort(),
  };
  await writeFile("public/sitemap-status.json", JSON.stringify(status, null, 2), "utf8");

  console.log(`Sitemap generated: ${finalEntries.length} URLs`);
  console.log(
    `Includes ${STATIC_PATHS.length} static + ${courseEntries.length} course + ${archiveEntries.length} archive candidates`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
