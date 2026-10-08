import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PRIVATE_ROUTE_PREFIXES, SEO_PAGES, SITE_ORIGIN, breadcrumbSchema, setSeoMetadata } from "@/lib/seo";

export default function SeoHead() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname.replace(/\/+$/, "") || "/";
    const page = SEO_PAGES[pathname as keyof typeof SEO_PAGES];
    const isCourse = /^\/course\/[^/]+$/.test(pathname);
    const isArticle = /^\/blog\/[^/]+$/.test(pathname);

    if (page) {
      const schemas = pathname === "/" ? [] : [breadcrumbSchema([
        { name: "Home", url: SITE_ORIGIN },
        { name: page.h1, url: `${SITE_ORIGIN}${pathname}` },
      ])];
      setSeoMetadata({ ...page, pathname, schemas });
    } else if (!isCourse && !isArticle) {
      const isPrivate = PRIVATE_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
      setSeoMetadata({
        pathname,
        title: isPrivate ? "Account | HTB Consult Academy" : "Page not found | HTB Consult Academy",
        description: isPrivate
          ? "Sign in to access your HTB Consult Academy account."
          : "The page you requested could not be found. Explore HTB Consult Academy courses and learning pathways.",
        noindex: true,
      });
    }

    document.getElementById("seo-rendered-content")?.remove();
  }, [location.pathname]);

  return null;
}
