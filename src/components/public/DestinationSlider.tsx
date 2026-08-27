"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

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

  // Sample destinations with proper image crops and location names
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
      className="flex gap-4 sm:gap-5 shrink-0" 
      aria-hidden={ariaHidden ? "true" : undefined}
    >
      {itemsToDisplay.map((dest, idx) => (
        <div
          key={`${dest.id}-${ariaHidden ? "dup" : "orig"}-${idx}`}
          className="w-[clamp(220px,64vw,290px)] shrink-0 aspect-[4/5] min-w-0"
        >
          <Link
            href={`/packages?destination=${dest.slug}`}
            className="group relative block w-full h-full rounded-[18px] overflow-hidden shadow-[0_8px_24px_rgba(15,23,42,0.10),0_2px_6px_rgba(15,23,42,0.06)] border border-white/14 transform-gpu transition-transform duration-300"
            draggable={false}
            tabIndex={ariaHidden ? -1 : undefined}
          >
            {/* Inner Counter-rotated Container */}
            <div className="relative w-full h-full transform-gpu rotate-[1.5deg] scale-[1.07]">
              {dest.coverImage ? (
                <Image
                  src={dest.coverImage}
                  alt={dest.name}
                  fill
                  sizes="(max-width: 480px) 240px, (max-width: 768px) 265px, 290px"
                  className="object-cover object-[center_45%] group-hover:scale-[1.025] transition-transform duration-500 ease-out pointer-events-none"
                  draggable={false}
                  loading={idx < 4 && !ariaHidden ? "eager" : "lazy"}
                />
              ) : (
                <div className="w-full h-full bg-[#050A24]" />
              )}

              {/* Bottom Gradient Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(to top, rgba(4,10,20,0.78) 0%, rgba(4,10,20,0.38) 28%, rgba(4,10,20,0.08) 52%, transparent 70%)"
                }}
              />

              {/* Badge */}
              {dest.badge && (
                <div className="absolute top-3.5 left-3.5 z-10 bg-white/20 backdrop-blur-md border border-white/25 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white tracking-wide shadow-xs">
                  {dest.badge}
                </div>
              )}

              {/* Content Overlay */}
              <div className="absolute bottom-4 left-4 right-[58px] z-10 text-white space-y-0.5 pointer-events-none">
                <h3 className="text-[18px] sm:text-[20px] font-semibold text-white leading-tight tracking-tight drop-shadow-xs line-clamp-1">
                  {dest.name}
                </h3>
                {dest.state && (
                  <div className="flex items-center gap-1 text-[12px] sm:text-[13px] font-medium text-white/75 truncate">
                    <MapPin className="w-3 h-3 text-white/70 shrink-0 stroke-[2]" />
                    <span className="truncate">{dest.state}</span>
                  </div>
                )}
              </div>

              {/* Arrow Action Button */}
              <div className="absolute bottom-3.5 right-3.5 z-10 w-[40px] h-[40px] rounded-full bg-[#3478F6] text-white border border-white/20 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.18)] group-hover:scale-[1.06] group-hover:bg-[#2563EB] transition-all duration-200 pointer-events-none">
                <ArrowUpRight className="w-[18px] h-[18px] stroke-[2.2] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );

  return (
    <div 
      className="relative w-full overflow-hidden py-8 sm:py-12 select-none"
      ref={containerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Slanted Marquee Track */}
      <div 
        className="flex gap-4 sm:gap-5 w-max will-change-transform py-4 px-4 sm:px-8 destination-marquee-track"
        style={{
          transform: "rotate(-1.5deg)",
          animationPlayState: isPaused ? "paused" : "running"
        }}
      >
        {renderCardGroup(false)}
        {renderCardGroup(true)}
      </div>

      <style jsx global>{`
        @keyframes destinationMarquee {
          0% {
            transform: rotate(-1.5deg) translate3d(0, 0, 0);
          }
          100% {
            transform: rotate(-1.5deg) translate3d(-50%, 0, 0);
          }
        }

        .destination-marquee-track {
          animation: destinationMarquee 35s linear infinite;
        }
      `}</style>
    </div>
  );
}
