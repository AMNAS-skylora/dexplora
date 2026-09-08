"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Clock3, MapPin, UsersRound, CalendarDays, ArrowRight, Loader2 } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { getSafeImageUrl } from "@/lib/images";

export interface PackageCardProps {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  coverImage: string;
  duration: string;
  price: number;
  originalPrice?: number | null;
  departureLocation: string;
  tripType?: string;
  destination: {
    name: string;
  };
  batches?: Array<{
    startDate: Date | string;
    availableSeats: number;
    status: string;
  }>;
  featured?: boolean;
}

export function PackageCard({
  title,
  slug,
  shortDescription,
  coverImage,
  duration,
  price,
  originalPrice,
  departureLocation,
  destination,
  batches,
}: PackageCardProps) {
  const [imgError, setImgError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const nextBatch = batches && batches.length > 0 ? batches[0] : null;
  const safeImg = imgError ? "/images/logo/logoblack.png" : getSafeImageUrl(coverImage);

  const handleNavigate = () => {
    startTransition(() => {
      router.push(`/packages/${slug}`);
    });
  };

  return (
    <div className="group bg-white rounded-[18px] border border-[#E7ECF3] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-full hover:-translate-y-1 w-full max-w-full min-w-0">
      {/* 16:10 Aspect Ratio Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 min-w-0 shrink-0">
        <Image
          src={safeImg}
          alt={title || "Tour Package"}
          fill
          sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 pointer-events-none"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050A24]/75 via-transparent to-transparent opacity-85 pointer-events-none" />

        {/* Compact Overlay Badges */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 min-w-0">
          {destination?.name && (
            <div className="flex items-center gap-1 bg-[#050A24]/80 border border-white/14 backdrop-blur-md px-2.5 h-[25px] rounded-[8px] text-[10px] sm:text-xs font-semibold text-white min-w-0 truncate">
              <MapPin className="w-3 h-3 text-[#3478F6] shrink-0" />
              <span className="truncate">{destination.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1 bg-[#050A24]/80 border border-white/14 backdrop-blur-md px-2.5 h-[25px] rounded-[8px] text-[10px] sm:text-xs font-semibold text-white shrink-0">
            <Clock3 className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{duration || "Multi-day"}</span>
          </div>
        </div>
      </div>

      {/* Content Area - 14px to 16px Padding */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between space-y-3 min-w-0">
        <div className="space-y-1.5 min-w-0">
          {/* Title: 16px-18px font-size, 2 lines max */}
          <h3 className="font-bold text-base sm:text-[17px] text-[#050A24] group-hover:text-[#3478F6] transition-colors leading-[1.25] line-clamp-2 min-h-[2.5em] overflow-hidden break-words">
            {title}
          </h3>

          {/* Description: 12px-13px font-size, 2 lines max */}
          <p className="text-xs sm:text-[13px] text-[#667085] leading-[1.4] line-clamp-2 min-h-[2.8em] overflow-hidden break-words">
            {shortDescription || title}
          </p>
        </div>

        {/* Boarding Row */}
        <div className="flex items-center gap-[5px] min-w-0 text-xs text-[#667085]">
          <MapPin className="w-3.5 h-3.5 text-[#3478F6] shrink-0" />
          <span className="shrink-0">Boarding:</span>
          <span className="font-semibold text-[#0B1026] truncate min-w-0">
            {departureLocation || "Kochi / Kerala"}
          </span>
        </div>

        {/* Next Batch Departure Badge */}
        {nextBatch && (
          <div className="flex items-center justify-between gap-1.5 p-2 rounded-xl bg-[#F5F8FF] border border-[#E2E9F8] text-[11px] font-medium text-[#0B1026] min-w-0">
            <div className="flex items-center gap-1 text-[#667085] min-w-0 truncate">
              <CalendarDays className="w-3 h-3 text-[#3478F6] shrink-0" />
              <span className="truncate">Next: {formatDate(nextBatch.startDate)}</span>
            </div>
            <span className="text-[#3478F6] font-bold flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-md border border-[#3478F6]/20 shrink-0 text-[10px]">
              <UsersRound className="w-3 h-3 shrink-0" />
              <span>{nextBatch.availableSeats} left</span>
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="my-2.5 border-t border-[#E7ECF3]" />

        {/* Footer: Price & View Details Button */}
        <div className="mt-auto flex items-end justify-between gap-2 min-w-0">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] leading-none mb-1 text-[#667085] block font-medium">
              Starting price
            </span>
            <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
              <span className="text-[22px] font-bold text-[#050A24] leading-none">
                {formatPrice(price)}
              </span>
              {originalPrice && (
                <span className="text-[10px] text-gray-400 line-through mt-[3px] block">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNavigate}
            disabled={isPending}
            className="h-[40px] px-3.5 rounded-[12px] bg-[#3478F6] hover:bg-[#2563EB] disabled:bg-[#3478F6]/70 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1 shrink-0 active:scale-98 cursor-pointer disabled:cursor-wait"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2] shrink-0" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
