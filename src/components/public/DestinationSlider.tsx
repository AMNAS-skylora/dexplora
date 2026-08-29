"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { getSafeImageUrl } from "@/lib/images";

export interface DestinationItem {
  id: string;
  name: string;
  slug: string;
  state?: string | null;
  coverImage?: string | null;
  shortDescription?: string | null;
  badge?: string | null;
}

interface DestinationSliderProps {
  destinations: DestinationItem[];
}

export function DestinationSlider({ destinations }: DestinationSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Fallback destination records with high-quality travel images
  const itemsToDisplay = destinations && destinations.length > 0 ? destinations : [
    { id: "1", name: "Kashmir", slug: "kashmir", state: "Jammu & Kashmir", coverImage: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80" },
    { id: "2", name: "Manali", slug: "manali", state: "Himachal Pradesh", coverImage: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80" },
    { id: "3", name: "Meghalaya", slug: "meghalaya", state: "Northeast India", coverImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80" },
    { id: "4", name: "Goa", slug: "goa", state: "West Coast", coverImage: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80" },
    { id: "5", name: "Munnar", slug: "munnar", state: "Kerala", coverImage: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80" },
    { id: "6", name: "Ladakh", slug: "ladakh", state: "North India", coverImage: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80" },
    { id: "7", name: "Ooty", slug: "ooty", state: "Tamil Nadu", coverImage: "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=800&q=80" },
    { id: "8", name: "Wayanad", slug: "wayanad", state: "Kerala", coverImage: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80" },
  ];

  const renderCardGroup = (ariaHidden = false) => (
    <div 
      className="flex gap-4 sm:gap-6 shrink-0" 
      aria-hidden={ariaHidden ? "true" : undefined}
    >
      {itemsToDisplay.map((dest, idx) => (
        <div
          key={`${dest.id}-${ariaHidden ? "dup" : "orig"}-${idx}`}
          className="w-[calc(100vw-32px)] max-w-[280px] sm:w-[270px] md:w-[295px] shrink-0 aspect-[4/5] min-w-0"
        >
          <Link
            href={`/packages?destination=${dest.slug}`}
            className="group relative block w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-900 border border-gray-100/10 shadow-[0_8px_25px_rgba(11,16,38,0.08)] hover:shadow-[0_16px_35px_rgba(11,16,38,0.16)] hover:-translate-y-1.5 transition-all duration-300"
            draggable={false}
            tabIndex={ariaHidden ? -1 : undefined}
          >
            {/* Image Container */}
            <div className="relative w-full h-full overflow-hidden">
              {dest.coverImage ? (
                <Image
                  src={getSafeImageUrl(dest.coverImage)}
                  alt={dest.name}
                  fill
                  sizes="(max-width: 480px) 230px, (max-width: 768px) 270px, 295px"
                  unoptimized={dest.coverImage.includes("unsplash.com")}
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out pointer-events-none"
                  draggable={false}
                  loading={idx < 4 && !ariaHidden ? "eager" : "lazy"}
                />
              ) : (
                <div className="w-full h-full bg-[#050A24]" />
              )}

              {/* Gradient Overlay for Text Visibility */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(to top, rgba(5,10,36,0.85) 0%, rgba(5,10,36,0.35) 40%, rgba(5,10,36,0.05) 70%, transparent 100%)"
                }}
              />

              {/* Optional Badge Tag */}
              {dest.badge && (
                <div className="absolute top-3.5 left-3.5 z-10 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-[10px] font-extrabold text-white uppercase tracking-wider shadow-xs">
                  {dest.badge}
                </div>
              )}

              {/* Content Box */}
              <div className="absolute bottom-4 left-4 right-14 z-10 text-white space-y-0.5 pointer-events-none">
                <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-white leading-tight tracking-tight drop-shadow-xs line-clamp-1">
                  {dest.name}
                </h3>
                {dest.state && (
                  <div className="flex items-center gap-1 text-xs text-white/80 font-medium truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#3478F6] shrink-0 stroke-[2]" />
                    <span className="truncate">{dest.state}</span>
                  </div>
                )}
              </div>

              {/* Circular Action Arrow Button */}
              <div className="absolute bottom-3.5 right-3.5 z-10 w-10 h-10 rounded-full bg-[#3478F6] text-white border border-white/20 flex items-center justify-center shadow-md group-hover:bg-[#2563EB] group-hover:scale-110 transition-all duration-200 pointer-events-none">
                <ArrowUpRight className="w-4 h-4 stroke-[2.5] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );

  return (
    <div 
      className="relative w-full overflow-hidden py-4 sm:py-6 select-none"
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Smooth Straight Infinite Marquee Track (0deg tilt) */}
      <div 
        className="flex gap-4 sm:gap-6 w-max will-change-transform py-2 px-4 destination-marquee-track"
        style={{
          animationPlayState: isPaused ? "paused" : "running"
        }}
      >
        {renderCardGroup(false)}
        {renderCardGroup(true)}
      </div>

      <style jsx global>{`
        @keyframes destinationMarquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        .destination-marquee-track {
          animation: destinationMarquee 38s linear infinite;
        }
      `}</style>
    </div>
  );
}
