"use client";

import { useState } from "react";
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
  badgeTag?: string | null;
  destination?: string | null;
  startingPrice?: number | null;
  realPrice?: number | null;
  imageUrl?: string | null;
  desktopImage?: string | null;
  mobileImage?: string | null;
  primaryBtnText?: string | null;
  primaryBtnUrl?: string | null;
  secondaryBtnText?: string | null;
  secondaryBtnUrl?: string | null;
}

interface HeroSliderProps {
  slides: SlideData[];
  whatsappNumber?: string;
}

export function HeroSlider({ slides, whatsappNumber = "917034267985" }: HeroSliderProps) {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  if (!slides || slides.length === 0) return null;

  const cleanWhatsapp = whatsappNumber.replace(/\D/g, "");

  return (
    <div className="relative w-full max-w-full overflow-hidden bg-[#050A24] rounded-none md:rounded-3xl shadow-xl">
      <style>{`
        .hero-title {
          font-size: clamp(22px, 7vw, 32px);
          line-height: 1.1;
          font-weight: 700;
          max-width: 100%;
          overflow-wrap: break-word;
          word-break: break-word;
          min-width: 0;
        }
        .hero-subtitle {
          font-size: clamp(11px, 3.2vw, 14px);
          line-height: 1.4;
          max-width: 100%;
          overflow-wrap: break-word;
          min-width: 0;
        }
        .info-label {
          font-size: clamp(9px, 2.6vw, 11px);
          max-width: 100%;
          overflow-wrap: break-word;
          min-width: 0;
        }
        .info-value {
          font-size: clamp(12px, 3.4vw, 15px);
          max-width: 100%;
          overflow-wrap: break-word;
          min-width: 0;
        }
        .price-value {
          font-size: clamp(18px, 5vw, 23px);
          max-width: 100%;
          overflow-wrap: break-word;
          min-width: 0;
        }
        .hero-button {
          font-size: clamp(12px, 3.4vw, 14px);
          max-width: 100%;
          overflow-wrap: break-word;
          min-width: 0;
        }
      `}</style>
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={slides.length > 1}
        className="w-full h-[460px] sm:h-[540px] md:h-[600px] lg:h-[640px]"
      >
        {slides.map((slide, index) => {
          const bgImage = slide.imageUrl || slide.desktopImage || "";
          const whatsappUrl = slide.secondaryBtnUrl && slide.secondaryBtnUrl.includes("wa.me")
            ? slide.secondaryBtnUrl
            : `https://wa.me/${cleanWhatsapp}?text=Hi%20Dexplora,%20I%20am%20interested%20in%20the%20${encodeURIComponent(slide.title)}`;
          const hasImageError = imageErrors[slide.id] || !bgImage;

          return (
            <SwiperSlide key={slide.id} className="relative w-full h-full">
              {/* Background Image & Overlay */}
              <div className="absolute inset-0 z-0 overflow-hidden bg-[#0B1026]">
                {!hasImageError ? (
                  <picture className="relative block w-full h-full">
                    {slide.mobileImage && (
                      <source media="(max-width: 640px)" srcSet={slide.mobileImage} />
                    )}
                    <Image
                      src={bgImage}
                      alt={slide.title}
                      fill
                      sizes="100vw"
                      priority={index === 0}
                      loading={index === 0 ? "eager" : "lazy"}
                      quality={85}
                      onError={() => {
                        setImageErrors((prev) => ({ ...prev, [slide.id]: true }));
                      }}
                      className="object-cover object-center transition-opacity duration-500"
                    />
                  </picture>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#0B1026] via-[#050A24] to-[#111C44]" />
                )}

                {/* Gradient Overlay for Text Readability */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(to bottom, rgba(5,10,20,0.15) 0%, rgba(5,10,20,0.40) 45%, rgba(5,10,20,0.90) 100%)"
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#030A1C]/85 via-transparent to-transparent hidden md:block" />
              </div>

              {/* Responsive Content Wrapper */}
              <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-end p-4 sm:p-6 lg:p-8 pb-8 text-white">
                <div className="w-full max-w-xl flex flex-col gap-2.5 sm:gap-3.5 min-w-0">
                  {/* Responsive Title */}
                  <h1 className="text-white drop-shadow-md hero-title">
                    <HeroWordReveal text={slide.title} />
                  </h1>

                  {/* Subtitle */}
                  {slide.subtitle && (
                    <p className="text-white/90 font-medium line-clamp-2 hero-subtitle">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* Info Cards Grid */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
                    {slide.startingPrice && (
                      <div className="bg-[#0A1228]/80 border border-white/15 backdrop-blur-md rounded-xl p-2.5 sm:p-3 min-h-[58px] flex flex-col justify-center min-w-0">
                        <span className="text-gray-300 font-semibold block uppercase tracking-wider info-label truncate">
                          Starting from
                        </span>
                        <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                          <span className="font-bold text-[#3478F6] leading-none mt-0.5 price-value truncate">
                            {formatPrice(slide.startingPrice)}
                          </span>
                          {slide.realPrice && (
                            <span className="text-gray-400 line-through font-semibold info-label truncate">
                              {formatPrice(slide.realPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="bg-[#0A1228]/80 border border-white/15 backdrop-blur-md rounded-xl p-2.5 sm:p-3 min-h-[58px] flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#3478F6]/20 text-[#3478F6] flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div className="truncate min-w-0">
                        <span className="text-gray-300 font-semibold uppercase tracking-wider block info-label truncate">
                          Destination
                        </span>
                        <span className="font-semibold text-white truncate block info-value">
                          {slide.destination || "Meghalaya"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <Link
                      href={slide.primaryBtnUrl || "/packages"}
                      className="w-full sm:w-auto h-11 sm:h-12 bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 rounded-xl font-bold shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer hero-button"
                    >
                      <span className="truncate">{slide.primaryBtnText || "View Package"}</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </Link>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto h-11 sm:h-12 bg-[#080F23]/80 hover:bg-[#080F23] border border-white/20 text-white px-5 rounded-xl font-bold backdrop-blur-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer hero-button"
                    >
                      <span className="truncate">{slide.secondaryBtnText || "Book Seats Now"}</span>
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
