export type ImageVariant = "thumbnail" | "medium" | "large" | "original";

export function sanitizePlaceName(text?: string | null): string {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/\bAll keralam\b/gi, "All Kerala")
    .replace(/\bKeralam\b/gi, "Kerala")
    .trim();
}

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

export interface OptimizeImageOptions {
  variant?: ImageVariant;
  customWidth?: number;
  quality?: number;
  fallback?: string;
}

/**
 * Transforms an image URL into a size-optimized asset URL using platform CDNs (Cloudinary / Unsplash).
 * Prevents over-downloading huge raw images for small components.
 */
export function getOptimizedImageUrl(
  src?: string | null,
  options: ImageVariant | OptimizeImageOptions = "medium"
): string {
  const opts: OptimizeImageOptions =
    typeof options === "string" ? { variant: options } : options;
  const variant = opts.variant || "medium";
  const fallback = opts.fallback || "/images/logo/logoblack.png";

  const safeUrl = getSafeImageUrl(src, fallback);
  if (!safeUrl || safeUrl === fallback) return fallback;

  // Cloudinary Optimization
  if (safeUrl.includes("res.cloudinary.com") && safeUrl.includes("/upload/")) {
    let widthParam = "";
    if (opts.customWidth) {
      widthParam = `w_${opts.customWidth},c_limit,`;
    } else if (variant === "thumbnail") {
      widthParam = "w_400,c_limit,";
    } else if (variant === "medium") {
      widthParam = "w_800,c_limit,";
    } else if (variant === "large") {
      widthParam = "w_1280,c_limit,";
    }

    const qualityParam = opts.quality ? `q_${opts.quality},` : "q_auto,";
    const transformStr = `f_auto,${qualityParam}${widthParam}`.replace(/,$/, "");

    // Avoid duplicate transformations
    if (safeUrl.includes("/upload/f_auto") || safeUrl.includes("/upload/w_")) {
      return safeUrl;
    }

    return safeUrl.replace("/upload/", `/upload/${transformStr}/`);
  }

  // Unsplash Optimization
  if (safeUrl.includes("images.unsplash.com")) {
    let width = opts.customWidth;
    if (!width) {
      if (variant === "thumbnail") width = 400;
      else if (variant === "medium") width = 800;
      else if (variant === "large") width = 1280;
    }

    try {
      const url = new URL(safeUrl);
      if (width) url.searchParams.set("w", String(width));
      url.searchParams.set("q", String(opts.quality || 80));
      url.searchParams.set("auto", "format");
      return url.toString();
    } catch {
      return safeUrl;
    }
  }

  return safeUrl;
}
