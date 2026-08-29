"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PackageCard } from "@/components/public/PackageCard";

interface PackagesSliderProps {
  packages: any[];
}

export function PackagesSlider({ packages }: PackagesSliderProps) {
  if (!packages || packages.length === 0) {
    return (
      <div className="bg-[#F3F7FF] rounded-2xl p-12 text-center text-[#667085]">
        <p>No tour packages available at the moment. New adventures coming soon!</p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-hidden packages-slider-container relative py-2">
      <style>{`
        .packages-slider-container .swiper {
          width: 100%;
          overflow: visible;
        }
        .packages-slider-container .swiper-slide {
          height: auto;
          display: flex;
        }
        .packages-slider-container .swiper-pagination-bullet {
          background: #CBD5E1;
          opacity: 0.6;
          width: 8px;
          height: 8px;
          transition: all 0.3s ease;
        }
        .packages-slider-container .swiper-pagination-bullet-active {
          background: #3478F6;
          opacity: 1;
          width: 24px;
          border-radius: 4px;
        }
      `}</style>

      {/* Desktop Navigation Arrows */}
      <div className="hidden md:flex items-center gap-2 absolute -top-16 right-0 z-20">
        <button
          aria-label="Previous Package"
          className="pkg-prev w-9 h-9 rounded-full border border-[#E2E8F0] bg-white text-[#0B1026] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] flex items-center justify-center transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          aria-label="Next Package"
          className="pkg-next w-9 h-9 rounded-full border border-[#E2E8F0] bg-white text-[#0B1026] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] flex items-center justify-center transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <Swiper
        modules={[Navigation, Pagination]}
        navigation={{ prevEl: ".pkg-prev", nextEl: ".pkg-next" }}
        pagination={{ clickable: true, el: ".pkg-pagination" }}
        slidesPerView={1.12}
        spaceBetween={12}
        grabCursor={true}
        allowTouchMove={true}
        touchRatio={1}
        resistance={true}
        observer={true}
        observeParents={true}
        centeredSlides={false}
        breakpoints={{
          0: {
            slidesPerView: 1.10,
            spaceBetween: 12,
          },
          640: {
            slidesPerView: 1.8,
            spaceBetween: 16,
          },
          768: {
            slidesPerView: 2.2,
            spaceBetween: 18,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1280: {
            slidesPerView: 3.2,
            spaceBetween: 22,
          },
        }}
        className="w-full min-w-0"
      >
        {packages.map((pkg) => (
          <SwiperSlide key={pkg.id}>
            <PackageCard {...pkg} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Subtle Pagination Indicator */}
      <div className="pkg-pagination flex justify-center items-center gap-1.5 mt-6 min-h-[16px]" />
    </div>
  );
}
