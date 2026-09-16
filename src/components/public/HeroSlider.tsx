"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { formatPrice, getHeroImage } from "@/lib/utils";
import { getOptimizedImageUrl } from "@/lib/images";
import { openWhatsAppBooking } from "@/lib/whatsapp";
import { ArrowRight, MapPin, Timer, Check, ExternalLink } from "lucide-react";
import { HeroWordReveal } from "@/components/animation/HeroWordReveal";

export interface SlideData {
  id: string;
  type?: "EVENT" | "CUSTOM" | "SCHEDULED_OFFER";
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  badgeTag?: string | null;
  destination?: any;
  startingPrice?: number | null;
  realPrice?: number | null;
  currency?: string | null;
  discountLabel?: string | null;
  offerPoints?: string[];
  imageUrl?: string | null;
  desktopImage?: string | null;
  mobileImage?: string | null;
  videoUrl?: string | null;
  primaryBtnText?: string | null;
  primaryBtnUrl?: string | null;
  secondaryBtnText?: string | null;
  secondaryBtnUrl?: string | null;
  openInNewTab?: boolean;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  endDateTime?: string | Date | null;
  showCountdown?: boolean;
  showPrice?: boolean;
  showPoints?: boolean;
  showCTA?: boolean;
  textAlignment?: "left" | "center" | "right";
  overlayStrength?: "light" | "medium" | "dark" | "heavy";
  event?: any;
  package?: any;
}

interface HeroSliderProps {
  slides: SlideData[];
  whatsappNumber?: string;
  serverTime?: string;
}

function LiveCountdownTimer({
  targetDate,
  serverTimeOffset = 0,
  onExpire,
}: {
  targetDate: string | Date;
  serverTimeOffset?: number;
  onExpire?: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: false });

  const calculateTimeLeft = useCallback(() => {
    const endMs = new Date(targetDate).getTime();
    const nowMs = Date.now() + serverTimeOffset;
    const diff = endMs - nowMs;

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isExpired: false };
  }, [targetDate, serverTimeOffset]);

  useEffect(() => {
    const initial = calculateTimeLeft();
    setTimeLeft(initial);
    if (initial.isExpired && onExpire) {
      onExpire();
      return;
    }

    const timer = setInterval(() => {
      const updated = calculateTimeLeft();
      setTimeLeft(updated);
      if (updated.isExpired) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, onExpire]);

  if (timeLeft.isExpired) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="bg-[#080E26]/90 border border-amber-400/40 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 space-y-1.5 min-w-0 shadow-lg">
      <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-[10px] sm:text-xs uppercase tracking-wider">
        <Timer className="w-3.5 h-3.5 shrink-0 animate-pulse text-amber-400" />
        <span>Offer Ends In</span>
      </div>
      <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center font-extrabold text-white">
        <div className="bg-black/50 border border-white/10 rounded-xl p-1 sm:p-1.5 min-w-0">
          <span className="block text-xs sm:text-sm md:text-base text-amber-400 leading-tight font-black">
            {pad(timeLeft.days)}
          </span>
          <span className="text-[8px] sm:text-[9px] text-gray-300 uppercase tracking-tight block">Days</span>
        </div>
        <div className="bg-black/50 border border-white/10 rounded-xl p-1 sm:p-1.5 min-w-0">
          <span className="block text-xs sm:text-sm md:text-base text-amber-400 leading-tight font-black">
            {pad(timeLeft.hours)}
          </span>
          <span className="text-[8px] sm:text-[9px] text-gray-300 uppercase tracking-tight block">Hours</span>
        </div>
        <div className="bg-black/50 border border-white/10 rounded-xl p-1 sm:p-1.5 min-w-0">
          <span className="block text-xs sm:text-sm md:text-base text-amber-400 leading-tight font-black">
            {pad(timeLeft.minutes)}
          </span>
          <span className="text-[8px] sm:text-[9px] text-gray-300 uppercase tracking-tight block">Min</span>
        </div>
        <div className="bg-black/50 border border-white/10 rounded-xl p-1 sm:p-1.5 min-w-0">
          <span className="block text-xs sm:text-sm md:text-base text-amber-400 leading-tight font-black">
            {pad(timeLeft.seconds)}
          </span>
          <span className="text-[8px] sm:text-[9px] text-gray-300 uppercase tracking-tight block">Sec</span>
        </div>
      </div>
    </div>
  );
}

export function HeroSlider({ slides: initialSlides, whatsappNumber = "917034267985", serverTime }: HeroSliderProps) {
  const [activeSlides, setActiveSlides] = useState<SlideData[]>(initialSlides || []);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setActiveSlides(initialSlides || []);
  }, [initialSlides]);

  const serverTimeOffset = useMemo(() => {
    return serverTime ? new Date(serverTime).getTime() - Date.now() : 0;
  }, [serverTime]);

  const handleSlideExpire = useCallback((slideId: string) => {
    setActiveSlides((prev) => prev.filter((s) => s.id !== slideId));
  }, []);

  if (!activeSlides || activeSlides.length === 0) return null;

  const hasMultipleSlides = activeSlides.length > 1;
  const canLoop = activeSlides.length >= 2;

  return (
    <div className="relative w-full max-w-full overflow-hidden bg-[#050A24] rounded-none md:rounded-3xl shadow-xl">
      <style>{`
        .hero-title {
          font-size: clamp(20px, 6.5vw, 34px);
          line-height: 1.15;
          font-weight: 800;
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
          font-size: clamp(18px, 5vw, 24px);
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
        key={activeSlides.length}
        modules={[Autoplay, Pagination]}
        autoplay={
          canLoop
            ? { delay: 6000, disableOnInteraction: false }
            : false
        }
        pagination={hasMultipleSlides ? { clickable: true } : false}
        navigation={false}
        loop={canLoop}
        rewind={!canLoop && activeSlides.length > 1}
        watchOverflow={true}
        allowTouchMove={hasMultipleSlides}
        className="w-full h-[480px] sm:h-[560px] md:h-[620px] lg:h-[660px]"
      >
        {activeSlides.map((slide, index) => {
          const slideType = slide.type || (slide.event ? "EVENT" : "CUSTOM");
          const isOffer = slideType === "SCHEDULED_OFFER";

          const packageData = slide.event?.package || slide.package;
          const title = typeof slide.title === "string" ? slide.title.trim() : (packageData?.title || "");
          const subtitle = typeof slide.subtitle === "string" ? slide.subtitle.trim() : "";
          const bgImage = getHeroImage(slide) || "";
          const hasImageError = imageErrors[slide.id] || !bgImage;
          const isLcp = index === 0;

          const destinationName =
            packageData?.destination?.name ||
            packageData?.destinationName ||
            (typeof packageData?.destination === "string" ? packageData.destination : null) ||
            (typeof slide.destination === "string" ? slide.destination : slide.destination?.name) ||
            null;

          const eventId = slide.event?.id;
          const primaryUrl =
            slide.primaryBtnUrl ||
            (eventId
              ? `/packages/${packageData?.slug || ""}?departure=${eventId}`
              : packageData?.slug
              ? `/packages/${packageData.slug}`
              : "/packages");

          const isExternalLink = slide.openInNewTab || (primaryUrl.startsWith("http://") || primaryUrl.startsWith("https://"));

          // Overlay strength
          const overlayClass =
            slide.overlayStrength === "light"
              ? "bg-black/30"
              : slide.overlayStrength === "dark"
              ? "bg-black/70"
              : slide.overlayStrength === "heavy"
              ? "bg-black/85"
              : "bg-black/50";

          // Text Alignment
          const alignClass =
            slide.textAlignment === "center"
              ? "items-center text-center mx-auto"
              : slide.textAlignment === "right"
              ? "items-end text-right ml-auto"
              : "items-start text-left";

          const currencySymbol = slide.currency && slide.currency !== "INR" ? `${slide.currency} ` : "₹";
          const formattedOfferPrice = slide.startingPrice ? `${currencySymbol}${slide.startingPrice.toLocaleString("en-IN")}` : null;
          const formattedRealPrice = slide.realPrice ? `${currencySymbol}${slide.realPrice.toLocaleString("en-IN")}` : null;

          return (
            <SwiperSlide key={slide.id} className="relative w-full h-full">
              {/* Background Media & Overlay */}
              <div className="absolute inset-0 z-0 overflow-hidden bg-[#050A24]">
                {slide.videoUrl ? (
                  <video
                    src={slide.videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-cover w-full h-full"
                  />
                ) : !hasImageError ? (
                  <picture className="relative block w-full h-full">
                    {slide.mobileImage && (
                      <source media="(max-width: 640px)" srcSet={slide.mobileImage} />
                    )}
                    <Image
                      src={getOptimizedImageUrl(bgImage, "large")}
                      alt={title || "Hero slide"}
                      fill
                      sizes="100vw"
                      priority={isLcp}
                      loading={isLcp ? "eager" : "lazy"}
                      fetchPriority={isLcp ? "high" : "auto"}
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

                {/* Dynamic Gradient Overlays */}
                <div
                  className={`absolute inset-0 pointer-events-none transition-opacity ${overlayClass}`}
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: "linear-gradient(to bottom, rgba(5,10,20,0.1) 0%, rgba(5,10,20,0.45) 50%, rgba(5,10,20,0.92) 100%)",
                  }}
                />
                {slide.textAlignment !== "right" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-[#030A1C]/85 via-transparent to-transparent hidden md:block" />
                )}
              </div>

              {/* Responsive Content Wrapper */}
              <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-end p-4 sm:p-6 lg:p-8 pb-8 text-white">
                <div className={`w-full max-w-xl flex flex-col gap-2.5 sm:gap-3.5 min-w-0 ${alignClass}`}>
                  {/* Badge Tag */}
                  {(slide.badgeTag || slide.badge) && (
                    <div className="inline-flex items-center gap-1.5 bg-[#3478F6] text-white text-[10px] sm:text-xs font-extrabold uppercase px-3 py-1 rounded-full tracking-wider shadow-md">
                      <span>{slide.badgeTag || slide.badge}</span>
                      {slide.discountLabel && (
                        <span className="bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full font-black text-[9px]">
                          {slide.discountLabel}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Responsive Title */}
                  {title ? (
                    <h1 className="text-white drop-shadow-md hero-title">
                      <HeroWordReveal text={title} />
                    </h1>
                  ) : null}

                  {/* Subtitle */}
                  {subtitle ? (
                    <p className="text-white/90 font-medium line-clamp-2 hero-subtitle">
                      {subtitle}
                    </p>
                  ) : null}

                  {/* Offer Highlights List */}
                  {isOffer && slide.showPoints !== false && Array.isArray(slide.offerPoints) && slide.offerPoints.length > 0 && (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-white/95 font-semibold pt-0.5 max-w-full">
                      {slide.offerPoints.map((point, pIdx) => (
                        <li key={pIdx} className="flex items-center gap-1.5 truncate bg-black/30 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 stroke-[3]" />
                          <span className="truncate">{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Price & Countdown Grid */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Price Card */}
                    {slide.showPrice !== false && slide.startingPrice ? (
                      <div className="bg-[#0A1228]/85 border border-white/15 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 flex flex-col justify-center min-w-0 shadow-md">
                        <span className="text-gray-300 font-semibold uppercase tracking-wider info-label truncate">
                          {isOffer ? "Special Offer Price" : "Starting from"}
                        </span>
                        <div className="flex items-baseline gap-2 flex-wrap min-w-0 mt-0.5">
                          <span className="font-extrabold text-[#3478F6] leading-none price-value truncate">
                            {formattedOfferPrice}
                          </span>
                          {formattedRealPrice ? (
                            <span className="text-gray-400 line-through font-semibold info-label truncate">
                              {formattedRealPrice}
                            </span>
                          ) : null}
                          {slide.discountLabel && !slide.badgeTag && (
                            <span className="text-[10px] font-black bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md border border-rose-500/30">
                              {slide.discountLabel}
                            </span>
                          )}
                        </div>
                      </div>
                    ) : null}

                    {/* Live Countdown Timer Card */}
                    {isOffer && slide.showCountdown !== false && (slide.endDate || slide.endDateTime) ? (
                      <LiveCountdownTimer
                        targetDate={slide.endDate || slide.endDateTime!}
                        serverTimeOffset={serverTimeOffset}
                        onExpire={() => handleSlideExpire(slide.id)}
                      />
                    ) : destinationName ? (
                      <div className="bg-[#0A1228]/85 border border-white/15 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 flex items-center gap-2.5 min-w-0 shadow-md">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#3478F6]/20 text-[#3478F6] flex items-center justify-center shrink-0">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="truncate min-w-0">
                          <span className="text-gray-300 font-semibold uppercase tracking-wider block info-label truncate">
                            Destination
                          </span>
                          <span className="font-extrabold text-white truncate block info-value">
                            {destinationName}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Action Buttons */}
                  {slide.showCTA !== false && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-1 w-full sm:w-auto">
                      {isExternalLink ? (
                        <a
                          href={primaryUrl}
                          target={slide.openInNewTab ? "_blank" : "_self"}
                          rel={slide.openInNewTab ? "noopener noreferrer" : undefined}
                          className="w-full sm:w-auto h-11 sm:h-12 bg-[#3478F6] hover:bg-[#2563EB] text-white px-6 rounded-xl font-bold shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer hero-button"
                        >
                          <span className="truncate">{slide.primaryBtnText || (isOffer ? "Book Offer Now" : "View Package")}</span>
                          {slide.openInNewTab ? <ExternalLink className="w-4 h-4 shrink-0" /> : <ArrowRight className="w-4 h-4 shrink-0" />}
                        </a>
                      ) : (
                        <Link
                          href={primaryUrl}
                          className="w-full sm:w-auto h-11 sm:h-12 bg-[#3478F6] hover:bg-[#2563EB] text-white px-6 rounded-xl font-bold shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer hero-button"
                        >
                          <span className="truncate">{slide.primaryBtnText || (isOffer ? "Book Offer Now" : "View Package")}</span>
                          <ArrowRight className="w-4 h-4 shrink-0" />
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          openWhatsAppBooking({
                            packageData: {
                              title: slide.package?.title || slide.event?.package?.title || title,
                              slug: slide.package?.slug || slide.event?.package?.slug,
                              price: slide.startingPrice || slide.event?.priceOverride,
                              destination: destinationName,
                            },
                            selectedDeparture: slide.event
                              ? {
                                  id: slide.event.id,
                                  batchName: slide.event.batchName,
                                  startDate: slide.event.startDate,
                                  endDate: slide.event.endDate,
                                  price: slide.event.priceOverride,
                                  availableSeats: slide.event.availableSeats,
                                }
                              : undefined,
                            whatsappNumber,
                          })
                        }
                        className="w-full sm:w-auto h-11 sm:h-12 bg-[#080F23]/80 hover:bg-[#080F23] border border-white/20 text-white px-5 rounded-xl font-bold backdrop-blur-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer hero-button"
                      >
                        <span className="truncate">{slide.secondaryBtnText || "WhatsApp Now"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
