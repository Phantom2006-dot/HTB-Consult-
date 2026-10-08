import { afterEach, describe, expect, it, vi } from "vitest";
import seoPage from "../../api/seo-page.js";
import seoCourse from "../../api/seo-course.js";
import seoSitemap from "../../api/seo-sitemap.js";

function responseRecorder() {
  return {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: "",
    setHeader(name: string, value: string) { this.headers[name.toLowerCase()] = value; },
    end(body = "") { this.body = String(body); },
  };
}

function jsonResponse(payload: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => payload };
}

function schemasFromHtml(html: string) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
}

afterEach(() => vi.unstubAllGlobals());

describe("Academy SEO server handlers", () => {
  it("builds valid XML with public pages and current published content only", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      const endpoint = new URL(url).pathname;
      if (endpoint === "/api/courses") return jsonResponse([
        { id: "course-1", title: "Public Course", published: true, created_at: "2026-01-10T00:00:00.000Z" },
        { id: "draft-course", title: "Draft Course", published: false },
      ]);
      if (endpoint === "/api/articles") return jsonResponse([
        { slug: "public-guide", title: "Public Guide", published: true },
        { slug: "draft-guide", title: "Draft Guide", published: false },
      ]);
      if (endpoint === "/api/mentors") return jsonResponse([
        { id: "mentor-1", name: "Published Mentor", published: true },
        { id: "mentor-draft", name: "Unpublished Mentor", published: false },
      ]);
      throw new Error(`Unexpected endpoint: ${endpoint}`);
    }));

    const res = responseRecorder();
    await seoSitemap({ method: "GET", url: "/api/seo-sitemap" }, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toContain("application/xml");
    expect(res.headers["cache-control"]).toContain("s-maxage=60");
    expect(res.headers["cache-control"]).toContain("must-revalidate");
    expect(res.body).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    const parsedXml = new DOMParser().parseFromString(res.body, "application/xml");
    expect(parsedXml.getElementsByTagName("parsererror")).toHaveLength(0);
    expect(res.body).toContain("https://academy.htbconsults.com/");
    expect(res.body).toContain("https://academy.htbconsults.com/course/course-1");
    expect(res.body).toContain("https://academy.htbconsults.com/blog/public-guide");
    expect(res.body).toContain("https://academy.htbconsults.com/mentor/mentor-1");
    expect(res.body).not.toContain("draft-course");
    expect(res.body).not.toContain("draft-guide");
    expect(res.body).not.toContain("mentor-draft");
    expect(res.body).not.toContain("/dashboard");
  });

  it("returns raw HTML with route-specific metadata and published course content", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse([
      { id: "course-1", title: "Business Analysis <Basics>", description: "Learn practical analysis methods.", category: "Business Analysis", skill_level: "Beginner", price: "19.99", published: true },
      { id: "course-2", title: "Leadership Foundations", description: "Build confident leadership skills.", published: true },
      { id: "course-3", title: "Agile Delivery", description: "Learn practical Agile delivery.", published: true },
      { id: "draft-course", title: "Secret Draft", description: "Not public", published: false },
    ])));

    const res = responseRecorder();
    await seoPage({ method: "GET", url: "/api/seo-page?path=%2Fcourses" }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("Business Analysis Courses | HTB Consult Academy");
    expect(res.body).toContain('<link rel="canonical" href="https://academy.htbconsults.com/courses"');
    expect(res.body).toContain("Learn practical analysis methods.");
    expect(res.body).toContain("Business Analysis &lt;Basics&gt;");
    expect(res.body).not.toContain("Secret Draft");
    expect(res.body).toContain('property="og:title"');
    expect(res.body).toContain('name="twitter:card"');
    const schemas = schemasFromHtml(res.body);
    expect(schemas.map((schema) => schema["@type"])).toEqual(["Organization", "BreadcrumbList", "ItemList"]);
    expect(schemas[2].itemListElement).toHaveLength(3);
    expect(schemas[2].itemListElement[0].url).toContain("/course/course-1");
  });

  it("returns Course, BreadcrumbList and Organization JSON-LD for published courses", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse([
      { id: "course-1", title: "Business Analysis Foundations", description: "Learn the essentials.", category: "Analysis", skill_level: "Beginner", price: "25", published: true },
    ])));

    const res = responseRecorder();
    await seoCourse({ method: "GET", url: "/api/seo-course?id=course-1" }, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toContain("Business Analysis Foundations | HTB Consult Academy");
    const schemas = schemasFromHtml(res.body);
    expect(schemas.map((schema) => schema["@type"])).toEqual(["Organization", "BreadcrumbList", "Course"]);
    expect(res.body).toContain('"priceCurrency":"GBP"');
    expect(res.body).toContain("Learn the essentials.");
  });

  it("renders safe published article and mentor pages with dynamic schema", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      const endpoint = new URL(url).pathname;
      if (endpoint === "/api/articles/practical-guide") return jsonResponse({
        slug: "practical-guide",
        title: "A Practical Guide",
        excerpt: "An introduction to practical work.",
        content: "Useful content.<script>doNotRun()</script>",
        created_at: "2026-02-01T00:00:00.000Z",
        cover_image_url: "https://cdn.example.test/guide.jpg",
        author_name: "HTB Team",
        published: true,
      });
      if (endpoint === "/api/mentors") return jsonResponse([
        { id: "mentor-1", name: "Published Mentor", title: "Industry Coach", bio: "<p>Practical learning support.</p>", specializations: ["Analysis"], avatar_url: "https://cdn.example.test/mentor.jpg", hourly_rate: 200, published: true },
        { id: "mentor-draft", name: "Draft Mentor", published: false },
      ]);
      throw new Error(`Unexpected endpoint: ${endpoint}`);
    }));

    const articleRes = responseRecorder();
    await seoPage({ method: "GET", url: "/api/seo-page?path=%2Fblog%2Fpractical-guide" }, articleRes);
    expect(articleRes.statusCode).toBe(200);
    expect(articleRes.body).toContain('property="og:type" content="article"');
    expect(schemasFromHtml(articleRes.body).map((schema) => schema["@type"])).toEqual(["Organization", "BreadcrumbList", "BlogPosting"]);
    expect(articleRes.body).toContain("Useful content.");
    expect(articleRes.body).not.toContain("doNotRun");

    const mentorRes = responseRecorder();
    await seoPage({ method: "GET", url: "/api/seo-page?path=%2Fmentor%2Fmentor-1" }, mentorRes);
    expect(mentorRes.statusCode).toBe(200);
    expect(mentorRes.body).toContain("Published Mentor");
    const mentorSchemas = schemasFromHtml(mentorRes.body);
    expect(mentorSchemas.map((schema) => schema["@type"])).toEqual(["Organization", "BreadcrumbList", "ProfilePage"]);
    expect(mentorSchemas[2].mainEntity["@type"]).toBe("Person");
    expect(mentorRes.body).not.toContain("hourly_rate");

    const draftRes = responseRecorder();
    await seoPage({ method: "GET", url: "/api/seo-page?path=%2Fmentor%2Fmentor-draft" }, draftRes);
    expect(draftRes.statusCode).toBe(404);
    expect(draftRes.body).toContain('name="robots" content="noindex,nofollow"');
  });

  it("returns real noindex 404 responses for missing courses and unknown routes", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse([
      { id: "published-course", title: "A published course", published: true },
    ])));

    const courseRes = responseRecorder();
    await seoCourse({ method: "GET", url: "/api/seo-course?id=not-published" }, courseRes);
    expect(courseRes.statusCode).toBe(404);
    expect(courseRes.body).toContain('name="robots" content="noindex,nofollow"');

    const routeRes = responseRecorder();
    await seoPage({ method: "GET", url: "/api/seo-page?path=%2Fdoes-not-exist" }, routeRes);
    expect(routeRes.statusCode).toBe(404);
    expect(routeRes.body).toContain("Page not found");
  });

  it("serves administrator preview shells as noindex and private/no-store", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const res = responseRecorder();
    await seoCourse({ method: "GET", url: "/api/seo-course?id=draft&preview=1" }, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers["x-robots-tag"]).toBe("noindex, nofollow");
    expect(res.headers["cache-control"]).toBe("private, no-store, max-age=0");
    expect(fetch).not.toHaveBeenCalled();
    expect(res.body).not.toContain("draft title");
  });

  it("keeps account paths out of indexing without exposing account data", async () => {
    const res = responseRecorder();
    await seoPage({ method: "GET", url: "/api/seo-page?path=%2Fdashboard" }, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers["x-robots-tag"]).toBe("noindex, nofollow");
    expect(res.body).toContain('name="robots" content="noindex,nofollow"');
    expect(res.body).not.toContain("enrollment");
  });
});
