"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { ArrowRight, MapPin } from "lucide-react";
import { HeroWordReveal } from "@/components/animation/HeroWordReveal";

interface SlideData {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  destination?: string | null;
  startingPrice?: number | null;
  desktopImage: string;
  mobileImage?: string | null;
  primaryBtnText: string;
  primaryBtnUrl: string;
  secondaryBtnText?: string | null;
  secondaryBtnUrl?: string | null;
}

interface HeroSliderProps {
  slides: SlideData[];
  whatsappNumber?: string;
}

export function HeroSlider({ slides, whatsappNumber = "917034267985" }: HeroSliderProps) {
  if (!slides || slides.length === 0) return null;

  const cleanWhatsapp = whatsappNumber.replace(/\D/g, "");

  return (
    <div className="relative w-full overflow-hidden bg-[#050A24] rounded-none md:rounded-3xl shadow-xl">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={slides.length > 1}
        className="w-full h-[520px] sm:h-[580px] lg:h-[640px]"
      >
        {slides.map((slide, index) => {
          const whatsappUrl = slide.secondaryBtnUrl && slide.secondaryBtnUrl.includes("wa.me")
            ? slide.secondaryBtnUrl
            : `https://wa.me/${cleanWhatsapp}?text=Hi%20Dexplora,%20I%20am%20interested%20in%20the%20${encodeURIComponent(slide.title)}`;

          return (
            <SwiperSlide key={slide.id} className="relative w-full h-full">
              {/* Background Image & Overlay */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <picture className="relative block w-full h-full">
                  {slide.mobileImage && (
                    <source media="(max-width: 640px)" srcSet={slide.mobileImage} />
                  )}
                  <Image
                    src={slide.desktopImage}
                    alt={slide.title}
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    quality={85}
                    className="object-cover object-[center_45%] transform scale-105 hover:scale-100 transition-transform duration-7000 ease-out"
                  />
                </picture>

                {/* Gradient Overlay for Text Readability */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(to bottom, rgba(5,10,20,0.10) 0%, rgba(5,10,20,0.30) 45%, rgba(5,10,20,0.85) 100%)"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#030A1C]/80 via-transparent to-transparent hidden md:block" />
              </div>

              {/* Single Unified Responsive Content Wrapper */}
              <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-end p-[clamp(14px,4vw,24px)] pt-[clamp(14px,3vh,28px)] pb-[clamp(16px,4vh,32px)] text-white">
                <div className="w-full max-w-[520px] flex flex-col gap-[clamp(8px,1.8vh,16px)] min-w-0">
                  {/* Clean Text Badge (No Icon) */}
                  <div className="w-fit max-w-full px-[clamp(10px,3vw,14px)] py-[clamp(5px,1vw,7px)] bg-[#3478F6] rounded-full text-[clamp(10px,2.7vw,12px)] font-bold uppercase tracking-wider text-white shadow-md">
                    <span>{slide.badge || "BUDGET FRIENDLY DEPARTURE"}</span>
                  </div>

                  {/* Fluid Responsive Title */}
                  <h1 className="text-[clamp(27px,7.5vw,44px)] leading-[0.95] tracking-tight font-extrabold text-white drop-shadow-md overflow-wrap-normal">
                    <HeroWordReveal text={slide.title} />
                  </h1>

                  {/* Fluid Subtitle */}
                  {slide.subtitle && (
                    <p className="text-[clamp(13.5px,3.6vw,17px)] leading-[1.35] text-white/92 font-medium max-w-[95%] line-clamp-2">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* Equal-Height Fluid Info Cards Grid */}
                  <div className="grid grid-cols-2 gap-[clamp(8px,2vw,12px)] pt-0.5">
                    {slide.startingPrice && (
                      <div className="bg-[#0A1228]/75 border border-white/16 backdrop-blur-md rounded-[14px] p-[clamp(10px,3vw,14px)] min-h-[clamp(60px,16vw,74px)] flex flex-col justify-center">
                        <span className="text-[clamp(9px,2.3vw,11px)] text-gray-300 font-semibold block uppercase tracking-wider">
                          Starting from
                        </span>
                        <span className="text-[clamp(19px,5vw,25px)] font-bold text-[#3478F6] leading-none mt-0.5">
                          {formatPrice(slide.startingPrice)}
                        </span>
                      </div>
                    )}

                    <div className="bg-[#0A1228]/75 border border-white/16 backdrop-blur-md rounded-[14px] p-[clamp(10px,3vw,14px)] min-h-[clamp(60px,16vw,74px)] flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#3478F6]/20 text-[#3478F6] flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate min-w-0">
                        <span className="text-[clamp(9px,2.3vw,11px)] text-gray-300 font-semibold uppercase tracking-wider block">
                          Destination
                        </span>
                        <span className="text-[clamp(12px,3.2vw,15px)] font-semibold text-white truncate block">
                          {slide.destination || "Meghalaya"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Fluid Action Buttons Stack */}
                  <div className="flex flex-col gap-[clamp(6px,1.5vh,10px)] pt-1">
                    <Link
                      href={slide.primaryBtnUrl}
                      className="w-full h-[clamp(46px,12.5vw,54px)] bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 rounded-[14px] font-semibold text-[clamp(15px,4vw,17px)] shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      <span>{slide.primaryBtnText || "View Package"}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                    </Link>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-[clamp(42px,11.5vw,48px)] bg-[#080F23]/80 hover:bg-[#080F23] border border-white/18 text-white px-5 rounded-[14px] font-semibold text-[clamp(13px,3.4vw,15px)] backdrop-blur-md transition-all active:scale-98 flex items-center justify-center gap-2"
                    >
                      <span>{slide.secondaryBtnText || "Book Seats Now"}</span>
                    </a>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
