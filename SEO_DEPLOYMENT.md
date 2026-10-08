# Academy SEO deployment notes

## Public crawl endpoints

- `https://academy.htbconsults.com/robots.txt` is a static public file in `public/` and points crawlers to the XML sitemap.
- `https://academy.htbconsults.com/sitemap.xml` is served by a Vercel function. It includes the fixed public Academy pages plus current published courses, articles and mentors from the public API; private and unpublished records are excluded.
- Public HTML routes are rewritten to SEO-aware Vercel functions. Course, article and mentor pages receive metadata and visible summary content before JavaScript runs. Missing records return HTTP 404; a temporarily unavailable content API returns HTTP 503 rather than a false 404.
- The functions use `VITE_API_URL` when available and otherwise use the API origin currently configured for the frontend (`https://htbconsult.fly.dev`). Keep this value aligned with the live API deployment.

## Restricted routes

The sitemap omits account, dashboard, admin, payment, personalized Explore/Sessions and mentor-authoring routes. `robots.txt` discourages crawling of those paths, and the page handler emits `noindex,nofollow`. Unpublished course previews require an administrator token at the API and remain `noindex`. Public course responses omit live-class links and paid lesson media; protected course resources require authentication plus enrollment (or administrator access). Unpublished course and mentor detail API responses are not public. Robots rules are not security controls: all private data and routes must continue enforcing authentication and authorization.

## Performance work

- Public routes and admin tools are lazy-loaded so visitors do not download every dashboard/editor bundle on initial navigation.
- The homepage hero image was converted from 1,981,132-byte PNG to an 81,804-byte WebP; the shared 1,536 × 1,024 logo was converted from 2,051,817-byte PNG to a 45,764-byte WebP. This removes about 3.9 MB from the two source assets; the hero is preloaded and card/author images are lazy-loaded.
- Course, blog and mentor hero imagery uses responsive 768/1,280 px source sets; social sharing uses a 67 KB raster preview rather than an SVG.

## GA4 setup (when the account is ready)

1. Add the Academy's `G-...` measurement ID as the Vercel environment variable `VITE_GA_MEASUREMENT_ID` for the intended deployment environments.
2. Connect the consent-manager UI to the existing helper by calling `updateAnalyticsConsent(true)` after consent or dispatching `htb:analytics-consent` with `{ detail: { granted: true } }`. Dispatch the same event with `granted: false` when consent is withdrawn.
3. Deploy the frontend and confirm a `page_view` event in GA4 DebugView after consent. No measurement ID is configured in this change; tracking remains disabled until both an ID and analytics consent are present.

## Post-deployment verification

After the branch is deployed to the Academy domain, verify:

```sh
curl -i https://academy.htbconsults.com/sitemap.xml
curl -i https://academy.htbconsults.com/robots.txt
curl -s https://academy.htbconsults.com/ | grep -E '<title>|name="description"|rel="canonical"|application/ld\+json'
curl -s https://academy.htbconsults.com/courses | grep -E 'Available courses|<h1>|name="description"'
curl -i https://academy.htbconsults.com/course/<published-course-id>
curl -i https://academy.htbconsults.com/course/does-not-exist
curl -i https://academy.htbconsults.com/a-route-that-does-not-exist
```

Then validate a published course with [Google Rich Results Test](https://search.google.com/test/rich-results) and measure the deployed site with [PageSpeed Insights](https://pagespeed.web.dev/) on both mobile and desktop. These live Google reports require the changed build to be deployed; they cannot be inferred from a local build or a pull request.
