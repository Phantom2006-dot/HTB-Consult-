const BASE = (import.meta.env.VITE_API_URL as string) ?? "";

function getToken(): string | null {
  return localStorage.getItem("htb_token");
}

export function setToken(token: string) {
  localStorage.setItem("htb_token", token);
}

export function clearToken() {
  localStorage.removeItem("htb_token");
  localStorage.removeItem("htb_user");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${BASE}${path}`;

  let res: Response;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (networkErr: any) {
    const e = new Error(`Network error: Unable to reach the server at ${url}. ${networkErr.message}`) as Error & { status: number };
    e.status = 0;
    throw e;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    const e = new Error(err.error || res.statusText) as Error & { status: number };
    e.status = res.status;
    throw e;
  }

  // Handle empty responses (e.g. 204)
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
