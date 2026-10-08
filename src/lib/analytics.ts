const measurementId = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined)?.trim();
let initialized = false;
let currentPath = "/";

function hasAnalyticsConsent() {
  try {
    return window.localStorage.getItem("htb_analytics_consent") === "granted";
  } catch {
    return false;
  }
}

function initializeAnalytics() {
  if (initialized || !measurementId || !/^G-[A-Z0-9]+$/.test(measurementId) || !hasAnalyticsConsent()) return;
  initialized = true;
  const gtag = (...args: unknown[]) => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(args);
  };
  window.gtag = window.gtag || gtag;
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  script.dataset.htbAnalytics = "true";
  document.head.appendChild(script);
}

export function trackPageView(path: string) {
  currentPath = path;
  if (!measurementId || !hasAnalyticsConsent()) return;
  initializeAnalytics();
  window.gtag?.("event", "page_view", {
    page_path: path,
    page_title: document.title,
    page_location: window.location.href,
  });
}

export function updateAnalyticsConsent(granted: boolean) {
  try {
    window.localStorage.setItem("htb_analytics_consent", granted ? "granted" : "denied");
  } catch {
    return;
  }
  if (granted) {
    initializeAnalytics();
    trackPageView(currentPath || window.location.pathname);
  } else if (initialized) {
    window.gtag?.("consent", "update", { analytics_storage: "denied" });
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("htb:analytics-consent", (event) => {
    const detail = (event as CustomEvent<{ granted?: boolean }>).detail;
    updateAnalyticsConsent(detail?.granted === true);
  });
}
