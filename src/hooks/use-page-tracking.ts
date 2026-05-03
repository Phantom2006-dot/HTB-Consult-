import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

function getSessionId(): string {
  const key = "htb_sid";
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

export function usePageTracking() {
  const location = useLocation();
  const { user } = useAuth();
  const lastTracked = useRef<string>("");

  useEffect(() => {
    const page = location.pathname;
    if (page === lastTracked.current) return;
    lastTracked.current = page;

    const payload = {
      session_id: getSessionId(),
      page,
      referrer: document.referrer || null,
      user_id: user?.id || null,
    };

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }, [location.pathname, user?.id]);
}
