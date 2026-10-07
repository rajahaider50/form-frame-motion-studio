export function formatProjectNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function compactText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

export function safeRedirectPath(value: string | null, fallback = "/atelier/console"): string {
  if (!value?.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
