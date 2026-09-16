export interface InstagramMetadata {
  shortcode: string;
  mediaType: "post" | "reel";
  normalizedUrl: string;
}

export function parseInstagramUrl(url: string): InstagramMetadata | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  // Match /p/SHORTCODE or /reel/SHORTCODE or /reels/SHORTCODE or /tv/SHORTCODE
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/i;
  const match = trimmed.match(regex);

  if (!match) return null;

  const rawType = match[1].toLowerCase();
  const shortcode = match[2];
  const mediaType: "post" | "reel" = rawType.startsWith("reel") ? "reel" : "post";
  const normalizedUrl = `https://www.instagram.com/${mediaType === "reel" ? "reel" : "p"}/${shortcode}/`;

  return {
    shortcode,
    mediaType,
    normalizedUrl,
  };
}

export interface InstagramItemThumbnailData {
  cloudinary_thumbnail_url: string | null;
  thumbnail_url: string | null;
  thumbnail_source_url: string | null;
  thumbnail_status: "PROCESSING" | "READY" | "FAILED";
}

export function getInstagramThumbnail(item: any): string | null {
  if (!item) return null;

  // 1. Cloudinary thumbnail URL (cached)
  if (item.cloudinary_thumbnail_url) return item.cloudinary_thumbnail_url;
  if (item.cloudinaryThumbnailUrl) return item.cloudinaryThumbnailUrl;

  // 2. Direct Instagram thumbnail URL
  if (item.thumbnail_url) return item.thumbnail_url;
  if (item.thumbnailUrl) return item.thumbnailUrl;

  // 3. media_url if media_type is IMAGE / post
  const mType = (item.media_type || item.mediaType || "").toUpperCase();
  if (mType === "IMAGE" || mType === "POST") {
    if (item.media_url) return item.media_url;
    if (item.mediaUrl) return item.mediaUrl;
  }

  // 4. Cached preview image / preview_url
  if (item.preview_url) return item.preview_url;
  if (item.previewUrl) return item.previewUrl;

  // 5. Fallback null
  return null;
}

export async function uploadImageToCloudinary(rawImageUrl: string): Promise<string | null> {
  try {
    const { cloudinary } = await import("@/lib/cloudinary");
    if (!cloudinary || !process.env.CLOUDINARY_CLOUD_NAME) return null;

    const result = await cloudinary.uploader.upload(rawImageUrl, {
      folder: "dexplora/instagram",
      resource_type: "image",
      transformation: [{ quality: "auto:good", fetch_format: "auto", width: 1200, crop: "limit" }],
    });

    return result?.secure_url || null;
  } catch (err) {
    console.error("Failed to upload Instagram media to Cloudinary:", err);
    return null;
  }
}

export async function fetchInstagramThumbnailDetails(instagramUrl: string): Promise<InstagramItemThumbnailData> {
  const parsed = parseInstagramUrl(instagramUrl);
  if (!parsed) {
    return {
      cloudinary_thumbnail_url: null,
      thumbnail_url: null,
      thumbnail_source_url: null,
      thumbnail_status: "FAILED",
    };
  }

  const { shortcode, mediaType, normalizedUrl } = parsed;
  let rawThumbnailUrl: string | null = null;

  // 1. Try fetching via oEmbed API endpoint
  try {
    const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(normalizedUrl)}`;
    const res = await fetch(oembedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.thumbnail_url === "string" && data.thumbnail_url.length > 0) {
        rawThumbnailUrl = data.thumbnail_url;
      }
    }
  } catch (err) {
    console.warn("Instagram oEmbed fetch failed, trying fallback:", err);
  }

  // 2. Try direct media redirect endpoint: https://www.instagram.com/p/SHORTCODE/media/?size=l
  if (!rawThumbnailUrl) {
    try {
      const mediaUrl = `https://www.instagram.com/${mediaType === "reel" ? "reel" : "p"}/${shortcode}/media/?size=l`;
      const res = await fetch(mediaUrl, {
        method: "HEAD",
        redirect: "follow",
        headers: {
          "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        },
      });

      if (res.ok && res.url && res.url !== mediaUrl && !res.url.includes("instagram.com/accounts/login")) {
        rawThumbnailUrl = res.url;
      }
    } catch (err) {
      console.warn("Instagram media redirect fetch failed, trying OpenGraph fallback:", err);
    }
  }

  // 3. Try OpenGraph / HTML meta tags extraction using Facebook/Googlebot User-Agent
  if (!rawThumbnailUrl) {
    try {
      const pageRes = await fetch(normalizedUrl, {
        headers: {
          "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (pageRes.ok) {
        const html = await pageRes.text();
        
        // Check og:image or twitter:image
        const ogMatch =
          html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
          html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i) ||
          html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);

        if (ogMatch && ogMatch[1]) {
          const imageUrl = ogMatch[1].replace(/&amp;/g, "&");
          if (imageUrl.startsWith("http")) {
            rawThumbnailUrl = imageUrl;
          }
        }
      }
    } catch (err) {
      console.warn("Instagram OpenGraph extraction failed:", err);
    }
  }

  if (!rawThumbnailUrl) {
    return {
      cloudinary_thumbnail_url: null,
      thumbnail_url: null,
      thumbnail_source_url: null,
      thumbnail_status: "FAILED",
    };
  }

  // If already hosted on Cloudinary or local assets
  if (rawThumbnailUrl.includes("cloudinary.com") || rawThumbnailUrl.startsWith("/")) {
    return {
      cloudinary_thumbnail_url: rawThumbnailUrl,
      thumbnail_url: rawThumbnailUrl,
      thumbnail_source_url: rawThumbnailUrl,
      thumbnail_status: "READY",
    };
  }

  // Upload to Cloudinary to get permanent non-expiring URL and bypass cdninstagram 403s
  const cloudinaryUrl = await uploadImageToCloudinary(rawThumbnailUrl);

  return {
    cloudinary_thumbnail_url: cloudinaryUrl,
    thumbnail_url: rawThumbnailUrl,
    thumbnail_source_url: rawThumbnailUrl,
    thumbnail_status: cloudinaryUrl ? "READY" : "FAILED",
  };
}

export async function fetchInstagramThumbnail(instagramUrl: string): Promise<string | null> {
  const details = await fetchInstagramThumbnailDetails(instagramUrl);
  return details.cloudinary_thumbnail_url || details.thumbnail_url;
}

