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

export async function fetchInstagramThumbnail(instagramUrl: string): Promise<string | null> {
  const parsed = parseInstagramUrl(instagramUrl);
  if (!parsed) return null;

  const { shortcode, mediaType, normalizedUrl } = parsed;

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
        return data.thumbnail_url;
      }
    }
  } catch (err) {
    console.warn("Instagram oEmbed fetch failed, trying fallback:", err);
  }

  // 2. Try direct media redirect endpoint: https://www.instagram.com/p/SHORTCODE/media/?size=l
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
      return res.url;
    }
  } catch (err) {
    console.warn("Instagram media redirect fetch failed, trying OpenGraph fallback:", err);
  }

  // 3. Try OpenGraph / HTML meta tags extraction using Facebook/Googlebot User-Agent
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
          return imageUrl;
        }
      }
    }
  } catch (err) {
    console.warn("Instagram OpenGraph extraction failed:", err);
  }

  return null;
}
