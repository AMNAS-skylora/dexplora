"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import Image from "next/image";
import { ArrowUpRight, Sparkles, Film, Image as ImageIcon } from "lucide-react";

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
  instagramUrl: string;
  thumbnailUrl?: string | null;
  mediaType?: "post" | "reel" | null;
  title?: string | null;
  isActive: boolean;
  displayOrder?: number;
}

interface InstagramSliderProps {
  posts: InstagramPostItem[];
}

function SliderCard({ post }: { post: InstagramPostItem }) {
  const [imageError, setImageError] = useState(false);

  const hasValidThumbnail = Boolean(post.thumbnailUrl && !imageError);

  return (
    <a
      href={post.instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={post.title ? `View Instagram post: ${post.title}` : "View Instagram post on Instagram"}
      className="group relative block w-full aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-[#050A24] to-[#0B143A] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform-gpu hover:-translate-y-1 select-none"
    >
      {/* Thumbnail Image or Branded Fallback */}
      {hasValidThumbnail ? (
        <Image
          src={post.thumbnailUrl!}
          alt={post.title || "Dexplora Instagram Post"}
          fill
          sizes="(max-width: 640px) 75vw, (max-width: 1024px) 33vw, 25vw"
          onError={() => setImageError(true)}
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full p-6 flex flex-col justify-between bg-gradient-to-br from-[#833ab4]/90 via-[#fd1d1d]/80 to-[#fcb045]/90 text-white">
          <div className="flex justify-between items-center">
            <InstagramIcon className="w-8 h-8 text-white drop-shadow-md" />
            <Sparkles className="w-5 h-5 text-white/80" />
          </div>
          <div className="space-y-2">
            <p className="text-xs font-extrabold text-white/90 uppercase tracking-widest flex items-center gap-1.5">
              {post.mediaType === "reel" ? (
                <>
                  <Film className="w-3.5 h-3.5" />
                  <span>Instagram Reel</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Instagram Post</span>
                </>
              )}
            </p>
            <p className="text-sm font-bold line-clamp-3 leading-snug">
              {post.title || "Watch our latest group trip content on Instagram!"}
            </p>
          </div>
          <div className="inline-flex items-center gap-1 text-xs font-bold text-white/90">
            <span>Tap to watch</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      )}

      {/* Gradient Overlay for Thumbnail */}
      {hasValidThumbnail && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity flex flex-col justify-between p-4">
          {/* Top Badge */}
          <div className="flex justify-between items-center">
            <div className="bg-black/50 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-md border border-white/20 flex items-center gap-1">
              <InstagramIcon className="w-3 h-3 text-pink-400" />
              <span>{post.mediaType === "reel" ? "Reel" : "Post"}</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-4 h-4 text-pink-300" />
            </div>
          </div>

          {/* Bottom Info */}
          <div className="space-y-1">
            {post.title && (
              <p className="text-xs font-semibold text-white line-clamp-2 leading-tight">
                {post.title}
              </p>
            )}
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-300">
              <span>View on Instagram</span>
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

  return (
    <section className="w-full py-8 sm:py-12 bg-white overflow-hidden border-y border-[#E8ECF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border border-pink-500/20 mb-2">
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
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3478F6] hover:text-[#2563EB] transition-colors"
          >
            <span>Follow Us on Instagram</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* Swiper Slider */}
        <div className="relative">
          <Swiper
            modules={[Autoplay, Navigation]}
            spaceBetween={16}
            slidesPerView={1.25}
            loop={posts.length > 2}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
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
                slidesPerView: 4,
                spaceBetween: 24,
              },
            }}
            className="w-full !pb-4"
          >
            {posts.map((post) => (
              <SwiperSlide key={post.id} className="h-auto">
                <SliderCard post={post} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
