export function getSafeImageUrl(src?: string | null, fallback: string = "/images/logo/logoblack.png"): string {
  if (!src || typeof src !== "string") return fallback;

  const trimmed = src.trim();
  if (
    !trimmed ||
    trimmed === "image" ||
    trimmed === "/image" ||
    trimmed === "undefined" ||
    trimmed === "null" ||
    trimmed === "[object Object]"
  ) {
    return fallback;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) {
    return trimmed;
  }

  return `/${trimmed}`;
}
