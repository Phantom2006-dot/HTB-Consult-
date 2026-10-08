import { PRIVATE_ROUTE_PREFIXES, SEO_PAGES, SITE_ORIGIN, SOCIAL_IMAGE_URL, makePageTitle } from "./seo-content.js";

export { PRIVATE_ROUTE_PREFIXES, SEO_PAGES, SITE_ORIGIN, SOCIAL_IMAGE_URL, makePageTitle };

const PUBLIC_API_ORIGIN = (process.env.VITE_API_URL || "https://htbconsult.fly.dev")
  .replace(/\/$/, "")
  .replace(/\/api$/, "");

export function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

export function safeJsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function stripMarkup(value = "") {
  return String(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#*_>`~|]/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchPublicJson(apiPath, timeoutMs = 4500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${PUBLIC_API_ORIGIN}${apiPath}`, {
      headers: { accept: "application/json" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      const error = new Error(`Public API returned HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return await response.json();
  } catch (error) {
    if (error?.name === "AbortError") error.status = 503;
    throw error;
  } finally {
    clearTimeout(timeout);
  }
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

export function breadcrumbSchema(items) {
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

export function siteBreadcrumb(pathname, currentLabel) {
  if (pathname === "/") return [];
  return breadcrumbSchema([
    { name: "Home", url: SITE_ORIGIN },
    { name: currentLabel, url: `${SITE_ORIGIN}${pathname}` },
  ]);
}

export function sendSeoDocument(res, options) {
  const {
    pathname = "/",
    title = "HTB Consult Academy",
    description = "Practical training and professional learning from HTB Consult Academy.",
    h1 = title,
    image = SOCIAL_IMAGE_URL,
    body = "",
    status = 200,
    noindex = false,
    cacheControl,
    type = "website",
    schemas = [],
  } = options;
  const canonical = `${SITE_ORIGIN}${pathname}`;
  const robots = noindex ? "noindex,nofollow" : "index,follow,max-image-preview:large";
  const allSchemas = [organizationSchema(), ...schemas].filter(Boolean);
  const schemaHtml = allSchemas.map((schema) =>
    `<script type="application/ld+json">${safeJsonLd(schema)}</script>`
  ).join("\n    ");
  const document = `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${escapeHtml(canonical)}" />
    <meta property="og:type" content="${escapeHtml(type)}" />
    <meta property="og:site_name" content="HTB Consult Academy" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonical)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:alt" content="HTB Consult Academy" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    <link rel="stylesheet" href="/assets/app.css" />
    ${schemaHtml}
  </head>
  <body>
    <div id="seo-rendered-content" class="seo-fallback">
      <header><a href="${SITE_ORIGIN}/" aria-label="HTB Consult Academy home">HTB Consult Academy</a></header>
      <main><h1>${escapeHtml(h1)}</h1><p>${escapeHtml(description)}</p>${body}</main>
    </div>
    <div id="root"></div>
    <script type="module" src="/assets/app.js"></script>
  </body>
</html>`;

  res.statusCode = status;
  res.setHeader("content-type", "text/html; charset=utf-8");
  res.setHeader("cache-control", cacheControl || (status === 200 ? "public, max-age=0, s-maxage=300, stale-while-revalidate=600" : "public, max-age=0, s-maxage=60"));
  if (noindex) res.setHeader("x-robots-tag", "noindex, nofollow");
  res.end(document);
}
