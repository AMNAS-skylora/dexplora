"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Link from "next/link";
import { Star, Quote, MessageSquarePlus } from "lucide-react";

export interface TestimonialData {
  id: string;
  customerName: string;
  tripName: string;
  rating: number;
  review: string;
  customerPhoto?: string | null;
  travelDate?: string | Date | null;
  createdAt?: string | Date | null;
}

interface TestimonialSliderProps {
  testimonials: TestimonialData[];
}

function formatReviewDate(dateInput?: string | Date | null): string {
  if (!dateInput) return "May 2026";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(d);
  } catch {
    return String(dateInput);
  }
}

export function TestimonialSlider({ testimonials }: TestimonialSliderProps) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <div className="relative w-full">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        breakpoints={{
          320: { slidesPerView: 1, spaceBetween: 16 },
          768: { slidesPerView: 2, spaceBetween: 20 },
          1024: { slidesPerView: 3, spaceBetween: 24 },
        }}
        className="pb-14 w-full"
      >
        {testimonials.map((t) => {
          const displayDate = formatReviewDate(t.travelDate || t.createdAt);

          return (
            <SwiperSlide key={t.id} className="h-auto">
              <div className="bg-white rounded-[16px] border border-[#E5EAF2] p-[clamp(14px,4vw,24px)] shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-md transition-all flex flex-col justify-between h-full relative min-w-0">
                {/* Top Quote Decoration */}
                <Quote className="w-[clamp(20px,5vw,26px)] h-[clamp(20px,5vw,26px)] text-[#3478F6]/12 absolute top-4 right-4 pointer-events-none" />

                <div className="space-y-[clamp(10px,2.5vw,14px)] min-w-0">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-[clamp(14px,3.8vw,18px)] h-[clamp(14px,3.8vw,18px)] ${
                          i < t.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-[clamp(13px,3.5vw,16px)] text-[#0B1026] leading-[1.55] font-normal italic break-words">
                    &ldquo;{t.review}&rdquo;
                  </p>
                </div>

                {/* Clean Bottom Metadata (No Photo / Avatar) */}
                <div className="mt-[clamp(14px,3vw,20px)] pt-[clamp(12px,3vw,18px)] border-t border-[#E8EDF4] flex flex-col items-start gap-0.5 min-w-0">
                  <h4 className="font-semibold text-[clamp(13px,3.4vw,15px)] text-[#0B1026] leading-[1.25] break-words">
                    {t.customerName}
                  </h4>
                  <p className="text-[clamp(11px,3vw,13px)] text-[#3478F6] font-medium leading-[1.3] break-words">
                    {t.tripName}
                  </p>
                  <span className="text-[clamp(10.5px,2.8vw,12px)] text-[#667085] leading-snug block mt-0.5">
                    {displayDate}
                  </span>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="text-center mt-4">
        <Link
          href="/reviews"
          className="inline-flex items-center gap-2 bg-[#F3F7FF] hover:bg-[#3478F6] text-[#3478F6] hover:text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-colors min-h-[44px]"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>Share Your Travel Experience</span>
        </Link>
      </div>
    </div>
  );
}
