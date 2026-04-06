const BASE = "/api";

export async function api<T = any>(
  path: string,
  options?: RequestInit & { apiKey?: string }
): Promise<T> {
  const { apiKey, ...init } = options ?? {};

  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string>),
  };

  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  // Only set Content-Type for JSON bodies (not FormData)
  if (init.body && !(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }

  return data as T;
}
