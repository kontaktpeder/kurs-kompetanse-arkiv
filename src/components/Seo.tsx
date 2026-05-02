import { useEffect } from "react";

const SITE_NAME = "Kragerø Maskin og Opplæring";
const SITE_URL = "https://kurskragero.no";
const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`;

interface SeoProps {
  title?: string;
  description?: string;
  /** Path or absolute URL of canonical page. Defaults to current path. */
  canonical?: string;
  image?: string;
  /** "website" | "article" | "product" etc. */
  type?: string;
  /** Optional JSON-LD object(s) injected as <script type="application/ld+json"> */
  jsonLd?: object | object[];
  /** If true, do not append site name to title. */
  noSuffix?: boolean;
}

function setMeta(attr: "name" | "property", key: string, value: string) {
  if (!value) return;
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const JSONLD_ATTR = "data-seo-jsonld";

function setJsonLd(data?: object | object[]) {
  // Remove previous SEO JSON-LD blocks
  document.head
    .querySelectorAll(`script[${JSONLD_ATTR}="true"]`)
    .forEach((n) => n.parentNode?.removeChild(n));
  if (!data) return;
  const arr = Array.isArray(data) ? data : [data];
  for (const obj of arr) {
    const s = document.createElement("script");
    s.setAttribute("type", "application/ld+json");
    s.setAttribute(JSONLD_ATTR, "true");
    s.text = JSON.stringify(obj);
    document.head.appendChild(s);
  }
}

export default function Seo({
  title,
  description,
  canonical,
  image,
  type = "website",
  jsonLd,
  noSuffix = false,
}: SeoProps) {
  useEffect(() => {
    const fullTitle = title
      ? noSuffix
        ? title
        : `${title} | ${SITE_NAME}`
      : SITE_NAME;
    document.title = fullTitle;

    const desc =
      description ??
      "Sertifisert og dokumentert kursopplæring for industri, bygg og anlegg. På norsk, engelsk og tegnspråk – siden 2006.";

    const path = canonical ?? window.location.pathname + window.location.search;
    const canonicalUrl = path.startsWith("http") ? path : `${SITE_URL}${path}`;
    const img = image ?? DEFAULT_IMAGE;

    setMeta("name", "description", desc);
    setLink("canonical", canonicalUrl);

    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:type", type);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", img);
    setMeta("property", "og:locale", "nb_NO");

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", img);

    setJsonLd(jsonLd);

    return () => {
      // Clean up JSON-LD when component unmounts so next page is clean
      setJsonLd(undefined);
    };
  }, [title, description, canonical, image, type, noSuffix, JSON.stringify(jsonLd)]);

  return null;
}

export { SITE_NAME, SITE_URL };
