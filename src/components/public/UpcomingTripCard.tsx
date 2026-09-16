"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, MapPin, UsersRound, ArrowRight, Compass, Loader2 } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { openWhatsAppBooking } from "@/lib/whatsapp";
import { TravelImage } from "./TravelImage";
import { sanitizePlaceName } from "@/lib/images";

interface UpcomingTripCardProps {
  id: string;
  batchName?: string | null;
  startDate: Date | string;
  endDate: Date | string;
  totalSeats: number;
  availableSeats: number;
  status: string;
  priceOverride?: number | null;
  whatsappNumber?: string | null;
  packageItem: {
    title: string;
    slug: string;
    coverImage: string;
    price: number;
    destination: {
      name: string;
    };
  };
}

export function UpcomingTripCard({
  id,
  batchName,
  startDate,
  endDate,
  totalSeats,
  availableSeats,
  status,
  priceOverride,
  whatsappNumber,
  packageItem,
}: UpcomingTripCardProps) {
  const [isBooking, setIsBooking] = useState(false);
  const [isNavigating, startTransition] = useTransition();
  const router = useRouter();

  const currentPrice = priceOverride || packageItem.price;

  const cleanTitle = sanitizePlaceName(packageItem.title);
  const cleanDestination = sanitizePlaceName(packageItem.destination?.name);

  const handleNavigate = () => {
    startTransition(() => {
      router.push(`/packages/${packageItem.slug}?departure=${id}`);
    });
  };

  const handleBookNow = () => {
    if (isBooking) return;
    setIsBooking(true);
    try {
      openWhatsAppBooking({
        packageData: {
          title: cleanTitle,
          slug: packageItem.slug,
          price: currentPrice,
          destination: cleanDestination ? { name: cleanDestination } : packageItem.destination,
        },
        selectedDeparture: {
          id,
          batchName,
          startDate,
          endDate,
          price: currentPrice,
          availableSeats,
          totalSeats,
        },
        whatsappNumber,
      });
    } catch (err) {
      console.error("Booking error:", err);
    } finally {
      setTimeout(() => setIsBooking(false), 1200);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case "FILLING_FAST":
        return <span className="bg-[#F59E0B] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-sm">Filling Fast</span>;
      case "ALMOST_FULL":
        return <span className="bg-[#EF4444] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-sm">Almost Full</span>;
      case "SOLD_OUT":
        return <span className="bg-[#98A2B3] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-sm">Sold Out</span>;
      case "UPCOMING":
        return <span className="bg-[#3478F6] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-sm">Upcoming</span>;
      default:
        return <span className="bg-[#16A36A] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase shadow-sm">Open</span>;
    }
  };

  const availRatio = totalSeats > 0 ? availableSeats / totalSeats : 0;
  const bookedPercent = Math.min(100, Math.max(0, Math.round(((totalSeats - availableSeats) / totalSeats) * 100)));

  const getProgressColor = () => {
    if (status === "SOLD_OUT" || availableSeats <= 0) return "bg-[#98A2B3]";
    if (availRatio > 0.5) return "bg-[#16A36A]";
    if (availRatio >= 0.25) return "bg-[#F59E0B]";
    return "bg-[#EF4444]";
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8ECF3] p-3.5 sm:p-4 flex flex-col md:flex-row items-center gap-4 md:gap-5 shadow-sm hover:shadow-md transition-all">
      {/* Image Thumbnail */}
      <div className="relative w-full md:w-48 h-[160px] md:h-40 rounded-xl overflow-hidden shrink-0 bg-[#050A24]/10 flex items-center justify-center">
        <TravelImage
          src={packageItem.coverImage}
          alt={cleanTitle}
          variant="medium"
          sizes="(max-width: 768px) 100vw, 200px"
          className="object-cover object-center"
        />
        <div className="absolute top-2.5 left-2.5 z-10">
          {getStatusBadge(status)}
        </div>
      </div>

      {/* Details Stack */}
      <div className="flex-1 w-full space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3478F6]">
          <MapPin className="w-3.5 h-3.5" />
          <span>{cleanDestination}</span>
          {batchName && <span className="text-[#667085]">• {batchName}</span>}
        </div>

        <h3 className="font-bold text-base sm:text-lg text-[#0B1026] hover:text-[#3478F6] transition-colors leading-tight line-clamp-2">
          <Link href={`/packages/${packageItem.slug}?departure=${id}`}>{cleanTitle}</Link>
        </h3>

        <div className="space-y-1.5 text-xs text-[#667085]">
          <div className="flex items-center gap-1.5 font-medium text-[#344054]">
            <CalendarDays className="w-4 h-4 text-[#3478F6] shrink-0" />
            <span>
              {formatDate(startDate)} — {formatDate(endDate)}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-[#667085]">
            <UsersRound className="w-4 h-4 text-gray-500 shrink-0" />
            <span>{availableSeats} seats remaining</span>
          </div>
        </div>

        {/* Dynamic Availability Progress Bar */}
        <div className="w-full bg-[#EEF2F6] h-1.5 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${bookedPercent}%` }}
          />
        </div>
      </div>

      {/* Pricing & Dual Action Buttons */}
      <div className="w-full md:w-auto flex flex-row md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#E8ECF3] shrink-0 min-w-0">
        <div className="text-left md:text-right shrink-0">
          <span className="text-[11px] text-[#667085] block leading-none mb-1">Trip Price</span>
          <span className="text-xl sm:text-[22px] font-extrabold text-[#3478F6] leading-none">
            {formatPrice(currentPrice)}
          </span>
        </div>

        <div className="flex items-center gap-2 justify-end shrink-0">
          <button
            type="button"
            onClick={handleNavigate}
            disabled={isNavigating}
            className="h-[44px] px-3 sm:px-3.5 rounded-[11px] bg-[#F3F7FF] hover:bg-[#3478F6] text-[#3478F6] hover:text-white font-semibold text-xs transition-colors border border-[#E5EDFF] flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-wait"
          >
            {isNavigating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <span>View Trip</span>
            )}
          </button>
          <button
            type="button"
            disabled={isBooking}
            onClick={handleBookNow}
            className="h-[44px] px-3.5 sm:px-4 rounded-[11px] bg-[#3478F6] hover:bg-[#2563EB] disabled:bg-[#3478F6]/70 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer disabled:cursor-wait"
          >
            {isBooking ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Booking...</span>
              </>
            ) : (
              <>
                <span>Book Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
