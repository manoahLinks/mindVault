const API_BASE = import.meta.env.VITE_API_URL || "";

export function getAccessUrl(resourceId: string): string {
  const base = API_BASE || window.location.origin + "/api";
  return `${base}/resources/${resourceId}`;
}
