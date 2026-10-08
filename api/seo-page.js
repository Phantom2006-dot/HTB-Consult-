import {
  PRIVATE_ROUTE_PREFIXES,
  SEO_PAGES,
  SITE_ORIGIN,
  breadcrumbSchema,
  escapeHtml,
  fetchPublicJson,
  makePageTitle,
  sendSeoDocument,
  siteBreadcrumb,
  stripMarkup,
} from "../shared/seo-server.js";

function normalizePath(value = "/") {
  let pathname = String(value || "/");
  try { pathname = decodeURIComponent(pathname); } catch { /* keep malformed escapes unchanged */ }
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  pathname = pathname.replace(/\/{2,}/g, "/");
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, "");
  return pathname;
}

function requestPath(req) {
  const url = new URL(req.url || "/", "https://internal.invalid");
  return normalizePath(url.searchParams.get("path") || "/");
}

function courseCards(courses = []) {
  const publicCourses = (Array.isArray(courses) ? courses : []).filter((course) =>
    course && course.id && course.title && course.published !== false
  );
  if (!publicCourses.length) return "";
  return `<section aria-labelledby="available-courses"><h2 id="available-courses">Available courses</h2><ul>${publicCourses.map((course) =>
    `<li><a href="${SITE_ORIGIN}/course/${encodeURIComponent(String(course.id))}">${escapeHtml(course.title)}</a><p>${escapeHtml(course.description || "Explore practical professional training from HTB Consult Academy.")}</p></li>`
  ).join("")}</ul></section>`;
}

function articleCards(articles = []) {
  const publicArticles = (Array.isArray(articles) ? articles : []).filter((article) =>
    article && article.slug && article.title && article.published !== false && !String(article.slug).includes("/")
  );
  if (!publicArticles.length) return "";
  return `<section aria-labelledby="published-articles"><h2 id="published-articles">Latest published articles</h2><ul>${publicArticles.map((article) =>
    `<li><a href="${SITE_ORIGIN}/blog/${encodeURIComponent(String(article.slug))}">${escapeHtml(article.title)}</a>${article.excerpt ? `<p>${escapeHtml(article.excerpt)}</p>` : ""}</li>`
  ).join("")}</ul></section>`;
}

function mentorCards(mentors = []) {
  const publicMentors = (Array.isArray(mentors) ? mentors : []).filter((mentor) =>
    mentor && mentor.id && mentor.name && mentor.published !== false
  );
  if (!publicMentors.length) return "";
  return `<section aria-labelledby="academy-mentors"><h2 id="academy-mentors">Meet our mentors</h2><ul>${publicMentors.map((mentor) =>
    `<li><a href="${SITE_ORIGIN}/mentor/${encodeURIComponent(String(mentor.id))}">${escapeHtml(mentor.name)}</a>${mentor.title ? `<p>${escapeHtml(mentor.title)}</p>` : ""}${mentor.bio ? `<p>${escapeHtml(String(mentor.bio).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 360))}</p>` : ""}</li>`
  ).join("")}</ul></section>`;
}

function isPrivateRoute(pathname) {
  return PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

async function sendStaticPublicPage(res, pathname) {
  const page = SEO_PAGES[pathname];
  if (!page) return false;
  let body = "";
  if (pathname === "/courses") {
    try { body = courseCards(await fetchPublicJson("/api/courses")); } catch { /* Keep the public page available if the API is temporarily offline. */ }
  } else if (pathname === "/blog") {
    try { body = articleCards(await fetchPublicJson("/api/articles")); } catch { /* Keep the public page available if the API is temporarily offline. */ }
  } else if (pathname === "/mentors") {
    try { body = mentorCards(await fetchPublicJson("/api/mentors")); } catch { /* Keep the public page available if the API is temporarily offline. */ }
  }
  if (page.intro) body = `<p>${escapeHtml(page.intro)}</p>${body}`;
  const schemas = siteBreadcrumb(pathname, page.h1) ? [siteBreadcrumb(pathname, page.h1)] : [];
  sendSeoDocument(res, { pathname, ...page, body, schemas });
  return true;
}

async function sendArticlePage(res, pathname, slug) {
  let article;
  try {
    article = await fetchPublicJson(`/api/articles/${encodeURIComponent(slug)}`);
  } catch (error) {
    const missing = error?.status === 404;
    sendSeoDocument(res, {
      pathname,
      title: missing ? "Article not found | HTB Consult Academy" : "Article temporarily unavailable | HTB Consult Academy",
      description: "Browse practical insights and learning resources from HTB Consult Academy.",
      h1: missing ? "Article not found" : "Article temporarily unavailable",
      body: '<p><a href="/blog">Return to the Academy blog</a></p>',
      status: missing ? 404 : 503,
      noindex: true,
    });
    return;
  }
  if (!article || article.published === false || !article.title) {
    sendSeoDocument(res, {
      pathname,
      title: "Article not found | HTB Consult Academy",
      description: "Browse practical insights and learning resources from HTB Consult Academy.",
      h1: "Article not found",
      body: '<p><a href="/blog">Return to the Academy blog</a></p>',
      status: 404,
      noindex: true,
    });
    return;
  }
  const text = stripMarkup(article.content || "");
  const description = String(article.excerpt || text || `Read ${article.title} from HTB Consult Academy.`).slice(0, 155);
  const canonical = `${SITE_ORIGIN}${pathname}`;
  const image = /^https?:\/\//i.test(article.cover_image_url || "") ? article.cover_image_url : undefined;
  const datePublished = article.created_at && !Number.isNaN(Date.parse(article.created_at))
    ? new Date(article.created_at).toISOString()
    : undefined;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description,
    mainEntityOfPage: canonical,
    datePublished,
    author: { "@type": "Organization", name: article.author_name || "HTB Consult Academy" },
    publisher: { "@type": "Organization", name: "HTB Consult Academy", url: SITE_ORIGIN },
    ...(image ? { image } : {}),
  };
  const crumb = breadcrumbSchema([
    { name: "Home", url: SITE_ORIGIN },
    { name: "Blog", url: `${SITE_ORIGIN}/blog` },
    { name: article.title, url: canonical },
  ]);
  const body = `${article.excerpt ? `<p>${escapeHtml(article.excerpt)}</p>` : ""}${text ? `<p>${escapeHtml(text.slice(0, 2400))}</p>` : ""}<p><a href="/blog">More Academy insights</a></p>`;
  sendSeoDocument(res, {
    pathname,
    title: makePageTitle(article.title),
    description,
    h1: article.title,
    image,
    body,
    type: "article",
    schemas: [crumb, schema],
  });
}

async function sendMentorPage(res, pathname, id) {
  let mentors;
  try {
    mentors = await fetchPublicJson("/api/mentors");
  } catch {
    sendSeoDocument(res, {
      pathname,
      title: "Mentor temporarily unavailable | HTB Consult Academy",
      description: "Meet the HTB Consult Academy mentors supporting professional learning.",
      h1: "Mentor temporarily unavailable",
      status: 503,
      noindex: true,
    });
    return;
  }
  const mentor = Array.isArray(mentors)
    ? mentors.find((candidate) => String(candidate?.id) === id && candidate?.published !== false)
    : null;
  if (!mentor || !mentor.name) {
    sendSeoDocument(res, {
      pathname,
      title: "Mentor not found | HTB Consult Academy",
      description: "Browse published HTB Consult Academy mentors and courses.",
      h1: "Mentor not found",
      body: '<p><a href="/mentors">Browse our mentors</a></p>',
      status: 404,
      noindex: true,
    });
    return;
  }
  const biography = stripMarkup(mentor.bio || "");
  const description = String(biography || `${mentor.name}${mentor.title ? ` — ${mentor.title}` : ""} is an HTB Consult Academy industry mentor.`).slice(0, 155);
  const canonical = `${SITE_ORIGIN}${pathname}`;
  const image = /^https?:\/\//i.test(mentor.avatar_url || "") ? mentor.avatar_url : undefined;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: mentor.name,
    ...(mentor.title ? { jobTitle: mentor.title } : {}),
    description,
    url: canonical,
    ...(image ? { image } : {}),
    worksFor: { "@type": "Organization", name: "HTB Consult Academy", url: SITE_ORIGIN },
  };
  const crumbs = breadcrumbSchema([
    { name: "Home", url: SITE_ORIGIN },
    { name: "Mentors", url: `${SITE_ORIGIN}/mentors` },
    { name: mentor.name, url: canonical },
  ]);
  const body = `${mentor.title ? `<p><strong>${escapeHtml(mentor.title)}</strong></p>` : ""}${biography ? `<p>${escapeHtml(biography.slice(0, 2400))}</p>` : ""}${Array.isArray(mentor.specializations) && mentor.specializations.length ? `<p><strong>Specialisms:</strong> ${escapeHtml(mentor.specializations.join(", "))}</p>` : ""}<p><a href="/mentors">Browse Academy mentors</a></p>`;
  sendSeoDocument(res, {
    pathname,
    title: makePageTitle(`${mentor.name} | Academy Mentor`),
    description,
    h1: mentor.name,
    image,
    body,
    schemas: [crumbs, schema],
  });
}

export default async function seoPage(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("allow", "GET, HEAD");
    res.end("Method not allowed");
    return;
  }

  const pathname = requestPath(req);
  if (isPrivateRoute(pathname)) {
    sendSeoDocument(res, {
      pathname,
      title: "Account | HTB Consult Academy",
      description: "Sign in to access your HTB Consult Academy account.",
      h1: "Sign in to continue",
      body: '<p><a href="/auth">Sign in to your Academy account</a></p>',
      noindex: true,
    });
    return;
  }

  if (await sendStaticPublicPage(res, pathname)) return;

  const articleMatch = pathname.match(/^\/blog\/([^/]+)$/);
  if (articleMatch) {
    await sendArticlePage(res, pathname, articleMatch[1]);
    return;
  }

  const mentorMatch = pathname.match(/^\/mentor\/([^/]+)$/);
  if (mentorMatch) {
    await sendMentorPage(res, pathname, mentorMatch[1]);
    return;
  }

  sendSeoDocument(res, {
    pathname,
    title: "Page not found | HTB Consult Academy",
    description: "The page you requested could not be found. Explore HTB Consult Academy courses and learning pathways.",
    h1: "Page not found",
    body: '<p><a href="/courses">Browse Academy courses</a> or <a href="/">return home</a>.</p>',
    status: 404,
    noindex: true,
  });
}
