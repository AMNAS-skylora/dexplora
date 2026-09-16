"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { TravelImage } from "./TravelImage";
import { sanitizePlaceName, getOptimizedImageUrl } from "@/lib/images";

export interface GalleryItem {
  id: string;
  url: string;
  title?: string | null;
  caption?: string | null;
  category: string;
  destination?: { name: string } | null;
}

interface GalleryGridProps {
  images: GalleryItem[];
}

export function GalleryGrid({ images }: GalleryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = ["All", ...Array.from(new Set(images.map((img) => img.category).filter(Boolean)))];

  const filteredImages =
    selectedCategory === "All"
      ? images
      : images.filter((img) => img.category === selectedCategory);

  const displayedImages = filteredImages.slice(0, visibleCount);

  const handleNext = useCallback(() => {
    if (lightboxIndex !== null && lightboxIndex < filteredImages.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  }, [lightboxIndex, filteredImages.length]);

  const handlePrev = useCallback(() => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  }, [lightboxIndex]);

  const handleClose = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    if (lightboxIndex === null) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, handleClose, handlePrev, handleNext]);

  const activeImage = lightboxIndex !== null ? filteredImages[lightboxIndex] : null;

  // Deterministic repeating pattern for the "All" filter view (1x1 normal squares vs 2x2 featured squares)
  const isFeaturedItem = (index: number) => {
    if (selectedCategory !== "All") return false;
    return index % 6 === 2;
  };

  return (
    <div className="relative space-y-6 sm:space-y-8 w-full min-w-0">
      {/* Background Atmosphere Radial Blobs */}
      <div className="absolute -top-10 -left-20 w-72 h-72 rounded-full bg-radial from-[#3478F6]/10 via-transparent to-transparent blur-xl pointer-events-none" />
      <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-radial from-[#6366F1]/8 via-transparent to-transparent blur-xl pointer-events-none" />

      {/* Horizontally Scrollable Category Chips */}
      {categories.length > 1 && (
        <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x -mx-3 px-3 sm:mx-0 sm:px-0 sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`h-[36px] px-4 rounded-xl text-[12.5px] font-semibold transition-all shrink-0 snap-align-start cursor-pointer flex items-center justify-center ${
                selectedCategory === cat
                  ? "bg-[#3478F6] text-white shadow-xs"
                  : "bg-[#F6F8FC] border border-[#E3E8F1] text-[#0B1026] hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid: 2 cols on mobile, 3 on tablet, 4 on desktop */}
      {displayedImages.length > 0 ? (
        <div className="space-y-8">
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 grid-flow-dense gap-2 sm:gap-3.5 min-w-0 transition-opacity duration-300">
            {displayedImages.map((img, idx) => {
              const isFeatured = isFeaturedItem(idx);
              const cleanTitle = sanitizePlaceName(img.title);
              const cleanDestination = sanitizePlaceName(img.destination?.name);

              return (
                <div
                  key={img.id}
                  onClick={() => setLightboxIndex(idx)}
                  className={`relative aspect-square w-full ${
                    isFeatured ? "col-span-2 row-span-2 rounded-[16px] p-[2px] bg-gradient-to-br from-[#3478F6]/35 via-[#6366F1]/15 to-white/60 shadow-md" : "col-span-1 row-span-1 rounded-[12px] border border-[#E5EAF2] shadow-xs"
                  } overflow-hidden cursor-pointer group bg-[#EEF2F7] min-w-0 transition-all duration-300 active:scale-[0.98]`}
                >
                  <div className={`relative w-full h-full ${isFeatured ? "rounded-[14px]" : "rounded-[11px]"} overflow-hidden`}>
                    <TravelImage
                      src={img.url}
                      alt={cleanTitle || cleanDestination || "Travel memory photo"}
                      variant="medium"
                      sizes={isFeatured ? "(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 50vw" : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"}
                      priority={idx < 4}
                      className="object-cover object-center group-hover:scale-[1.025] transition-transform duration-350 ease-out"
                    />

                    {/* Overlay for Destination / Title Info */}
                    {(cleanDestination || cleanTitle) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-[#040A14]/75 via-transparent to-transparent opacity-90 p-3 sm:p-4 flex flex-col justify-end text-white pointer-events-none z-10">
                        {cleanDestination && (
                          <span className={`font-bold text-[#3478F6] uppercase tracking-wider flex items-center gap-1 ${isFeatured ? "text-xs" : "text-[10.5px]"}`}>
                            <MapPin className={`${isFeatured ? "w-3.5 h-3.5" : "w-3 h-3"} text-[#3478F6] shrink-0`} />
                            <span className="truncate">{cleanDestination}</span>
                          </span>
                        )}
                        {cleanTitle && (
                          <h4 className={`font-semibold text-white leading-tight truncate mt-0.5 ${isFeatured ? "text-sm sm:text-base font-bold" : "text-[12px]"}`}>
                            {cleanTitle}
                          </h4>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {visibleCount < filteredImages.length && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="h-11 px-6 rounded-2xl bg-[#3478F6] hover:bg-[#2563EB] text-white font-bold text-xs shadow-sm transition-all cursor-pointer min-h-[44px]"
              >
                Load More Memories ({filteredImages.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-10 text-center py-16 text-[#64748B] text-sm bg-[#F8FAFF] rounded-2xl border border-[#DBE6FF]">
          No photos available in this category.
        </div>
      )}

      {/* Fullscreen Lightbox Overlay */}
      {mounted && activeImage && (
        <div className="fixed inset-0 z-[99999] bg-[#030712]/94 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 min-h-[100dvh] w-screen">
          {/* Top Bar Controls */}
          <div className="w-full max-w-5xl flex items-center justify-between z-20">
            <span className="text-xs font-semibold text-gray-400">
              {lightboxIndex! + 1} / {filteredImages.length}
            </span>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors min-w-[40px] min-h-[40px] cursor-pointer"
              aria-label="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Central Full View Image Container */}
          <div className="relative w-full max-w-[min(94vw,1200px)] h-[calc(100dvh-140px)] flex items-center justify-center my-auto">
            {lightboxIndex! > 0 && (
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 text-white hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={getOptimizedImageUrl(activeImage.url, "large")}
                alt={sanitizePlaceName(activeImage.title) || "Travel photo"}
                fill
                sizes="100vw"
                className="object-contain max-h-[88dvh]"
              />
            </div>

            {lightboxIndex! < filteredImages.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-2 sm:right-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 text-white hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Bottom Caption & Destination Info */}
          {(activeImage.title || activeImage.caption || activeImage.destination) && (
            <div className="text-center text-white space-y-1 z-20 max-w-xl pb-2">
              {activeImage.destination && (
                <span className="text-xs font-bold text-[#3478F6] uppercase tracking-wider block">
                  {sanitizePlaceName(activeImage.destination.name)}
                </span>
              )}
              {activeImage.title && <h3 className="text-base font-bold">{sanitizePlaceName(activeImage.title)}</h3>}
              {activeImage.caption && (
                <p className="text-xs text-gray-300 line-clamp-2">{sanitizePlaceName(activeImage.caption)}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
