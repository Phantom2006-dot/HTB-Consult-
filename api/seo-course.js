import {
  SITE_ORIGIN,
  breadcrumbSchema,
  escapeHtml,
  fetchPublicJson,
  makePageTitle,
  sendSeoDocument,
} from "../shared/seo-server.js";

export default async function seoCourse(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("allow", "GET, HEAD");
    res.end("Method not allowed");
    return;
  }

  const requestUrl = new URL(req.url || "/", "https://internal.invalid");
  const id = requestUrl.searchParams.get("id") || "";
  const pathname = `/course/${encodeURIComponent(id)}`;
  if (!id || id.includes("/") || id.length > 128) {
    sendSeoDocument(res, {
      pathname: "/course/not-found",
      title: "Course not found | HTB Consult Academy",
      description: "Browse professional learning and published courses at HTB Consult Academy.",
      h1: "Course not found",
      status: 404,
      noindex: true,
    });
    return;
  }

  if (requestUrl.searchParams.get("preview") === "1") {
    sendSeoDocument(res, {
      pathname,
      title: "Administrator course preview | HTB Consult Academy",
      description: "Administrator-only course preview.",
      h1: "Course preview",
      body: '<p>This preview is not indexed. Sign in as an administrator to view unpublished course details.</p>',
      noindex: true,
      cacheControl: "private, no-store, max-age=0",
    });
    return;
  }

  let courses;
  try {
    courses = await fetchPublicJson("/api/courses");
  } catch {
    sendSeoDocument(res, {
      pathname,
      title: "Course temporarily unavailable | HTB Consult Academy",
      description: "This course is temporarily unavailable. Browse published HTB Consult Academy courses.",
      h1: "Course temporarily unavailable",
      body: '<p><a href="/courses">Browse all courses</a></p>',
      status: 503,
      noindex: true,
    });
    return;
  }

  const course = Array.isArray(courses)
    ? courses.find((candidate) => String(candidate?.id) === id && candidate?.published !== false)
    : null;
  if (!course || !course.title) {
    sendSeoDocument(res, {
      pathname,
      title: "Course not found | HTB Consult Academy",
      description: "Browse professional learning and published courses at HTB Consult Academy.",
      h1: "Course not found",
      body: '<p><a href="/courses">Browse all courses</a></p>',
      status: 404,
      noindex: true,
    });
    return;
  }

  const description = String(course.description || `Explore ${course.title}, a professional course from HTB Consult Academy.`).replace(/\s+/g, " ").trim().slice(0, 155);
  const canonical = `${SITE_ORIGIN}${pathname}`;
  const price = Number(course.price);
  const image = /^https?:\/\//i.test(course.thumbnail_url || "") ? course.thumbnail_url : undefined;
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: String(course.description || description),
    url: canonical,
    inLanguage: "en-GB",
    provider: { "@type": "Organization", name: "HTB Consult Academy", url: SITE_ORIGIN },
    ...(image ? { image } : {}),
    ...(Number.isFinite(price) && !course.is_locked ? {
      offers: {
        "@type": "Offer",
        price: Math.max(0, price).toFixed(2),
        priceCurrency: "GBP",
        availability: "https://schema.org/InStock",
        url: canonical,
      },
    } : {}),
  };
  const crumbs = breadcrumbSchema([
    { name: "Home", url: SITE_ORIGIN },
    { name: "Courses", url: `${SITE_ORIGIN}/courses` },
    { name: course.title, url: canonical },
  ]);
  const priceText = Number.isFinite(price) ? (price > 0 ? `£${price.toLocaleString("en-GB")}` : "Free") : "Contact us for course details";
  const body = `<p><strong>Pathway:</strong> ${escapeHtml(course.category || "Professional development")}</p><p><strong>Level:</strong> ${escapeHtml(course.skill_level || "All levels")}</p><p><strong>Price:</strong> ${escapeHtml(priceText)}</p><p><a href="/courses">Browse all Academy courses</a></p>`;

  sendSeoDocument(res, {
    pathname,
    title: makePageTitle(course.title),
    description,
    h1: course.title,
    image,
    body,
    schemas: [crumbs, courseSchema],
  });
}
