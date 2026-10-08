import { PRIVATE_ROUTE_PREFIXES, SEO_PAGES, SITE_ORIGIN, SOCIAL_IMAGE_URL, makePageTitle } from "../../shared/seo-content.js";

export { PRIVATE_ROUTE_PREFIXES, SEO_PAGES, SITE_ORIGIN, SOCIAL_IMAGE_URL, makePageTitle };

export interface SeoMetadata {
  title: string;
  description: string;
  pathname: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  schemas?: Record<string, unknown>[];
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "HTB Consult Academy",
    url: SITE_ORIGIN,
    parentOrganization: {
      "@type": "Organization",
      name: "HTB Consult Ltd",
      url: "https://htbconsults.com",
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function setMeta(attribute: "name" | "property", key: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = value;
}

export function setSeoMetadata(metadata: SeoMetadata) {
  if (typeof document === "undefined") return;
  const canonical = `${SITE_ORIGIN}${metadata.pathname}`;
  const image = metadata.image || SOCIAL_IMAGE_URL;
  const robots = metadata.noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large";
  document.title = metadata.title;
  setMeta("name", "description", metadata.description);
  setMeta("name", "robots", robots);
  setMeta("property", "og:type", metadata.type || "website");
  setMeta("property", "og:site_name", "HTB Consult Academy");
  setMeta("property", "og:title", metadata.title);
  setMeta("property", "og:description", metadata.description);
  setMeta("property", "og:url", canonical);
  setMeta("property", "og:image", image);
  setMeta("name", "twitter:card", "summary_large_image");
  setMeta("name", "twitter:title", metadata.title);
  setMeta("name", "twitter:description", metadata.description);
  setMeta("name", "twitter:image", image);

  let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.rel = "canonical";
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = canonical;

  document.head.querySelectorAll('script[type="application/ld+json"]').forEach((node) => node.remove());
  const schemas = [organizationSchema(), ...(metadata.schemas || [])];
  const jsonLd = document.createElement("script");
  jsonLd.type = "application/ld+json";
  jsonLd.textContent = JSON.stringify(schemas).replace(/</g, "\\u003c");
  document.head.appendChild(jsonLd);
}
