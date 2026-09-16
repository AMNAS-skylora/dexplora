"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { getInstagramThumbnail } from "@/lib/instagram-client";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export interface InstagramPostItem {
  id: string;
  instagram_media_id?: string | null;
  instagramUrl: string;
  normalizedUrl?: string | null;
  shortcode?: string | null;
  media_type?: string | null;
  mediaType?: "post" | "reel" | null;
  media_product_type?: string | null;
  thumbnail_url?: string | null;
  thumbnailUrl?: string | null;
  cloudinary_thumbnail_url?: string | null;
  media_url?: string | null;
  preview_url?: string | null;
  title?: string | null;
  isActive: boolean;
  displayOrder?: number;
}

interface InstagramSliderProps {
  posts: InstagramPostItem[];
}

function SliderCard({ post }: { post: InstagramPostItem }) {
  const [imageFailed, setImageFailed] = useState(false);

  const thumbnail = getInstagramThumbnail(post);
  const hasValidThumbnail = Boolean(thumbnail && !imageFailed);
  const isReel =
    post.mediaType === "reel" ||
    post.media_type === "VIDEO" ||
    post.media_product_type === "REELS";

  return (
    <a
      href={post.instagramUrl || post.normalizedUrl || "#"}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={post.title ? `View Instagram post: ${post.title}` : "View on Instagram"}
      className="group relative block w-full aspect-[4/5] rounded-2xl overflow-hidden bg-white border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-300 transform-gpu hover:-translate-y-1 select-none"
    >
      {/* Real Thumbnail Image or White Fallback with Instagram Icon */}
      {hasValidThumbnail && thumbnail ? (
        <Image
          src={thumbnail}
          alt={post.title || "Instagram Post"}
          fill
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 30vw"
          onError={() => setImageFailed(true)}
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="absolute inset-0 bg-white flex items-center justify-center">
          <InstagramIcon className="w-14 h-14 text-pink-500" />
        </div>
      )}

      {/* Dark Overlay with Details (Only when real thumbnail is visible) */}
      {hasValidThumbnail && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/70 flex flex-col justify-between p-4">
          {/* Top Badge */}
          <div className="flex justify-between items-center">
            <div className="bg-black/50 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1">
              <InstagramIcon className="w-3 h-3 text-pink-400" />
              <span>{isReel ? "Reel" : "Post"}</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4 text-pink-300" />
            </div>
          </div>

          {/* Bottom Info */}
          <div className="space-y-1">
            {post.title && (
              <p className="text-xs font-semibold text-white line-clamp-2 leading-tight drop-shadow-sm">
                {post.title}
              </p>
            )}
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-300">
              <span>Tap to watch</span>
              <ArrowUpRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      )}
    </a>
  );
}

export function InstagramSlider({ posts }: InstagramSliderProps) {
  if (!posts || posts.length === 0) return null;

  const canLoop = posts.length >= 8;

  return (
    <section className="w-full py-8 sm:py-12 bg-white border-y border-[#E8ECF3] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-200/80 mb-2">
              <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-pink-600">
                @Dexplora_Tour_Planners
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1026] tracking-tight">
              Featured Instagram Posts & Reels
            </h2>
          </div>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3478F6] hover:text-[#2563EB] transition-colors shrink-0"
          >
            <span>Follow Us on Instagram</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* Swiper Slider */}
        <div className="relative w-full overflow-hidden">
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={16}
            slidesPerView={1.15}
            loop={canLoop}
            rewind={!canLoop && posts.length > 1}
            watchOverflow={true}
            autoplay={
              canLoop
                ? {
                    delay: 3500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                  }
                : false
            }
            breakpoints={{
              480: {
                slidesPerView: 1.6,
                spaceBetween: 16,
              },
              640: {
                slidesPerView: 2.3,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
            }}
            className="w-full !pb-4"
          >
            {posts.map((post) => (
              <SwiperSlide key={post.id || post.instagram_media_id || post.shortcode} className="h-auto">
                <SliderCard post={post} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}

