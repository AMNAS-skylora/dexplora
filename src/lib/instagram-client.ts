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
