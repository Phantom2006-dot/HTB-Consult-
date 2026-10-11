import { SEO_PAGES, SITE_ORIGIN, fetchPublicJson } from "../shared/seo-server.js";

function xmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[char]);
}

function validSlug(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 180 && !value.includes("/");
}

export default async function seoSitemap(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("allow", "GET, HEAD");
    res.end("Method not allowed");
    return;
  }

  const urls = new Map();
  for (const pathname of Object.keys(SEO_PAGES)) {
    const loc = `${SITE_ORIGIN}${pathname === "/" ? "/" : pathname}`;
    urls.set(loc, null);
  }

  const [coursesResult, articlesResult, mentorsResult] = await Promise.allSettled([
    fetchPublicJson("/api/courses"),
    fetchPublicJson("/api/articles"),
    fetchPublicJson("/api/mentors"),
  ]);
  if (coursesResult.status === "fulfilled" && Array.isArray(coursesResult.value)) {
    for (const course of coursesResult.value) {
      if (!course?.id || !course?.title || course.published === false) continue;
      const loc = `${SITE_ORIGIN}/course/${encodeURIComponent(String(course.id))}`;
      const modified = course.updated_at || course.created_at;
      urls.set(loc, modified && !Number.isNaN(Date.parse(modified)) ? new Date(modified).toISOString() : null);
    }
  }
  if (articlesResult.status === "fulfilled" && Array.isArray(articlesResult.value)) {
    for (const article of articlesResult.value) {
      if (!article?.title || article.published === false || !validSlug(article.slug)) continue;
      const loc = `${SITE_ORIGIN}/blog/${encodeURIComponent(article.slug)}`;
      const modified = article.updated_at || article.created_at;
      urls.set(loc, modified && !Number.isNaN(Date.parse(modified)) ? new Date(modified).toISOString() : null);
    }
  }
  if (mentorsResult.status === "fulfilled" && Array.isArray(mentorsResult.value)) {
    for (const mentor of mentorsResult.value) {
      if (!mentor?.id || !mentor?.name || mentor.published === false) continue;
      const loc = `${SITE_ORIGIN}/mentor/${encodeURIComponent(String(mentor.id))}`;
      const modified = mentor.updated_at || mentor.created_at;
      urls.set(loc, modified && !Number.isNaN(Date.parse(modified)) ? new Date(modified).toISOString() : null);
    }
  }

  const entries = [...urls.entries()].map(([loc, lastmod]) =>
    `  <url><loc>${xmlEscape(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`
  ).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;

  res.statusCode = 200;
  res.setHeader("content-type", "application/xml; charset=utf-8");
  res.setHeader("cache-control", "public, max-age=0, s-maxage=60, must-revalidate");
  res.setHeader("x-content-type-options", "nosniff");
  res.end(req.method === "HEAD" ? "" : xml);
}
