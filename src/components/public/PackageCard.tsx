import Link from "next/link";
import Image from "next/image";
import { Clock3, MapPin, UsersRound, CalendarDays, ArrowRight } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

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
  tripType: string;
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
  tripType,
  destination,
  batches,
  featured,
}: PackageCardProps) {
  const nextBatch = batches && batches.length > 0 ? batches[0] : null;

  return (
    <div className="group bg-white rounded-[18px] border border-[#E7ECF3] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-auto hover:-translate-y-1 w-full max-w-full min-w-0">
      {/* 16:10 Aspect Ratio Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 min-w-0">
        <Image
          src={coverImage}
          alt={title}
          fill
          sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050A24]/75 via-transparent to-transparent opacity-85 pointer-events-none" />

        {/* Top Fluid Badges */}
        <div className="absolute top-[clamp(8px,2.2vw,12px)] left-[clamp(8px,2.2vw,12px)] right-[clamp(8px,2.2vw,12px)] flex items-center justify-between gap-1.5 min-w-0">
          <span className="py-[clamp(4px,1.2vw,6px)] px-[clamp(8px,2.4vw,11px)] inline-flex items-center bg-[#3478F6] text-white text-[clamp(9px,2.5vw,11px)] font-bold rounded-full uppercase tracking-wider shadow-md shrink-0">
            {tripType || "GROUP DEPARTURE"}
          </span>
          {featured && (
            <span className="py-[clamp(4px,1.2vw,6px)] px-[clamp(8px,2.4vw,11px)] inline-flex items-center bg-[#F59E0B] text-white text-[clamp(9px,2.5vw,11px)] font-bold rounded-full uppercase tracking-wider shadow-md shrink-0">
              FEATURED
            </span>
          )}
        </div>

        {/* Destination & Duration Bottom Overlay Chips */}
        <div className="absolute bottom-[clamp(8px,2.2vw,12px)] left-[clamp(8px,2.2vw,12px)] right-[clamp(8px,2.2vw,12px)] flex items-center justify-between gap-[clamp(6px,2vw,10px)] min-w-0">
          <div className="flex items-center gap-1 bg-[#050A24]/80 border border-white/14 backdrop-blur-md px-[clamp(6px,2vw,10px)] py-[clamp(4px,1.2vw,6px)] rounded-[8px] text-[clamp(9.5px,2.7vw,11.5px)] font-semibold text-white min-w-0">
            <MapPin className="w-[clamp(11px,3vw,13px)] h-[clamp(11px,3vw,13px)] text-[#3478F6] shrink-0" />
            <span className="truncate">{destination.name}</span>
          </div>
          <div className="flex items-center gap-1 bg-[#050A24]/80 border border-white/14 backdrop-blur-md px-[clamp(6px,2vw,10px)] py-[clamp(4px,1.2vw,6px)] rounded-[8px] text-[clamp(9.5px,2.7vw,11.5px)] font-semibold text-white shrink-0">
            <Clock3 className="w-[clamp(11px,3vw,13px)] h-[clamp(11px,3vw,13px)] text-amber-400 shrink-0" />
            <span>{duration}</span>
          </div>
        </div>
      </div>

      {/* Content Area with Fluid Padding */}
      <div className="p-[clamp(12px,3.5vw,18px)] flex flex-col justify-between space-y-[clamp(8px,2vw,12px)] flex-1 min-w-0">
        <div className="space-y-1 min-w-0">
          <h3 className="font-bold text-[clamp(16px,4.5vw,20px)] text-[#050A24] group-hover:text-[#3478F6] transition-colors leading-[1.2] break-words">
            {title}
          </h3>
          <p className="text-[clamp(12px,3.2vw,13.5px)] text-[#667085] leading-snug line-clamp-2 break-words">
            {shortDescription}
          </p>
        </div>

        {/* Boarding Location Row */}
        <div className="flex items-start gap-1.5 text-[clamp(11px,3vw,12.5px)] pt-2 border-t border-[#E7ECF3] min-w-0">
          <MapPin className="w-3.5 h-3.5 text-[#3478F6] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1 break-words">
            <span className="text-[#667085]">Boarding: </span>
            <span className="font-semibold text-[#0B1026]">{departureLocation}</span>
          </div>
        </div>

        {/* Next Departure & Seats Badge Row */}
        {nextBatch && (
          <div className="grid grid-cols-[1fr_auto] items-center gap-[clamp(6px,2vw,10px)] p-[clamp(6px,2vw,10px)] px-[clamp(8px,2.4vw,12px)] rounded-[9px] bg-[#F5F8FF] border border-[#E2E9F8] text-[clamp(10.5px,2.8vw,12.5px)] font-medium text-[#0B1026] min-w-0">
            <div className="flex items-center gap-1.5 text-[#667085] min-w-0 truncate">
              <CalendarDays className="w-3.5 h-3.5 text-[#3478F6] shrink-0" />
              <span className="truncate">Next: {formatDate(nextBatch.startDate)}</span>
            </div>
            <span className="text-[#3478F6] font-bold flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-[#3478F6]/20 shrink-0 text-[clamp(10px,2.6vw,12px)]">
              <UsersRound className="w-3 h-3 shrink-0" />
              <span>{nextBatch.availableSeats} seats left</span>
            </span>
          </div>
        )}

        {/* Responsive Price & View Details Button Footer */}
        <div className="grid grid-cols-[1fr_auto] items-end gap-2 pt-2 border-t border-[#E7ECF3] min-w-0">
          <div className="min-w-0">
            <span className="text-[clamp(10px,2.6vw,11.5px)] text-[#667085] block leading-none mb-1">Starting price</span>
            <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
              <span className="text-[clamp(20px,5.8vw,26px)] font-bold text-[#050A24] leading-none">
                {formatPrice(price)}
              </span>
              {originalPrice && (
                <span className="text-[clamp(10px,2.8vw,12px)] text-gray-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          </div>

          <Link
            href={`/packages/${slug}`}
            className="min-h-[clamp(42px,11.5vw,48px)] px-[clamp(12px,3.2vw,16px)] rounded-[10px] bg-[#3478F6] hover:bg-[#2563EB] text-white font-semibold text-[clamp(12px,3.2vw,14px)] shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 active:scale-98"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
