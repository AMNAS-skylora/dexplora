"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  UsersRound,
  ArrowRight,
  Clock,
  CalendarDays,
  Sparkles,
  Loader2,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";
import { openWhatsAppBooking } from "@/lib/whatsapp";
import Link from "next/link";

export interface PackageDepartureBatch {
  id: string;
  packageId?: string;
  batchName?: string | null;
  startDate: Date | string;
  endDate: Date | string;
  totalSeats: number;
  availableSeats: number;
  status: string; // OPEN, FILLING_FAST, ALMOST_FULL, SOLD_OUT, COMPLETED, CANCELLED
  priceOverride?: number | null;
}

interface PackageDeparturesCalendarProps {
  packageId: string;
  packageTitle: string;
  packageSlug: string;
  destinationName?: string;
  duration?: string;
  startingPrice?: number;
  batches: PackageDepartureBatch[];
  initialDepartureId?: string;
  whatsappNumber?: string | null;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function parseLocalDate(dateInput: Date | string): Date {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return new Date(dateInput.getTime());

  const str = String(dateInput);
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const y = parseInt(match[1], 10);
    const m = parseInt(match[2], 10) - 1;
    const d = parseInt(match[3], 10);
    return new Date(y, m, d);
  }
  return new Date(dateInput);
}

function getDateKey(dateValue: Date | string): string {
  const d = parseLocalDate(dateValue);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function PackageDeparturesCalendar({
  packageId,
  packageTitle,
  packageSlug,
  destinationName = "India",
  duration = "Multi-day",
  startingPrice = 0,
  batches = [],
  initialDepartureId,
  whatsappNumber,
}: PackageDeparturesCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter out past dates and cancelled/completed status
  const activeBatches = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (batches || []).filter((b) => {
      if (!b.startDate) return false;
      const sDate = parseLocalDate(b.startDate);
      sDate.setHours(0, 0, 0, 0);

      const isFuture = sDate.getTime() >= today.getTime();
      const isActiveStatus = b.status !== "CANCELLED" && b.status !== "COMPLETED";

      return isFuture && isActiveStatus;
    });
  }, [batches]);

  // Map batches by date key for O(1) lookups
  const batchesByDateKey = useMemo(() => {
    const map = new Map<string, PackageDepartureBatch[]>();
    activeBatches.forEach((b) => {
      const key = getDateKey(b.startDate);
      const list = map.get(key) || [];
      list.push(b);
      map.set(key, list);
    });
    return map;
  }, [activeBatches]);

  // Initial target batch if initialDepartureId matches
  const targetInitialBatch = useMemo(() => {
    if (!initialDepartureId) return null;
    return activeBatches.find((b) => b.id === initialDepartureId) || null;
  }, [initialDepartureId, activeBatches]);

  // Initial month view
  const [currentDate, setCurrentDate] = useState(() => {
    if (targetInitialBatch) {
      return parseLocalDate(targetInitialBatch.startDate);
    }
    if (activeBatches.length > 0) {
      return parseLocalDate(activeBatches[0].startDate);
    }
    return new Date();
  });

  // Selected batch for preview card below calendar
  const [selectedBatch, setSelectedBatch] = useState<PackageDepartureBatch | null>(() => {
    if (targetInitialBatch) return targetInitialBatch;
    if (activeBatches.length > 0) return activeBatches[0];
    return null;
  });

  // Auto-scroll to section if initialDepartureId was passed
  useEffect(() => {
    if (targetInitialBatch && containerRef.current) {
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [targetInitialBatch]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const firstDayIndex = useMemo(
    () => new Date(currentYear, currentMonth, 1).getDay(),
    [currentYear, currentMonth]
  );
  const daysInMonth = useMemo(
    () => new Date(currentYear, currentMonth + 1, 0).getDate(),
    [currentYear, currentMonth]
  );
  const prevMonthDays = useMemo(
    () => new Date(currentYear, currentMonth, 0).getDate(),
    [currentYear, currentMonth]
  );

  const todayObj = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const isCurrentMonthView =
    todayObj.getFullYear() === currentYear && todayObj.getMonth() === currentMonth;
  const todayDateNumber = new Date().getDate();

  const getBatchesForDay = useCallback(
    (dayNum: number) => {
      const key = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(
        dayNum
      ).padStart(2, "0")}`;
      return batchesByDateKey.get(key) || [];
    },
    [batchesByDateKey, currentYear, currentMonth]
  );

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const [isBookingLoading, setIsBookingLoading] = useState(false);

  const handleBookSeat = async (batch: PackageDepartureBatch) => {
    if (isBookingLoading) return;
    setIsBookingLoading(true);

    try {
      openWhatsAppBooking({
        packageData: {
          title: packageTitle,
          slug: packageSlug,
          price: batch.priceOverride || startingPrice,
          destination: destinationName,
        },
        selectedDeparture: {
          id: batch.id,
          batchName: batch.batchName,
          startDate: batch.startDate,
          endDate: batch.endDate,
          price: batch.priceOverride || startingPrice,
          availableSeats: batch.availableSeats,
          totalSeats: batch.totalSeats,
        },
        whatsappNumber,
      });
    } catch (error) {
      console.error("Error opening booking:", error);
    } finally {
      setTimeout(() => {
        setIsBookingLoading(false);
      }, 1200);
    }
  };

  const getStatusBadge = (batch: PackageDepartureBatch) => {
    const total = batch.totalSeats || 30;
    const avail = batch.availableSeats !== undefined ? batch.availableSeats : 30;
    const ratio = total > 0 ? avail / total : 0;

    let st = batch.status || "OPEN";
    if (avail <= 0) st = "SOLD_OUT";
    else if (ratio <= 0.25) st = "ALMOST_FULL";
    else if (ratio <= 0.5) st = "FILLING_FAST";

    switch (st) {
      case "FILLING_FAST":
        return (
          <span className="bg-amber-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shadow-xs">
            Filling Fast
          </span>
        );
      case "ALMOST_FULL":
        return (
          <span className="bg-rose-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shadow-xs">
            Almost Full
          </span>
        );
      case "SOLD_OUT":
        return (
          <span className="bg-gray-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shadow-xs">
            Sold Out
          </span>
        );
      default:
        return (
          <span className="bg-emerald-600 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shadow-xs">
            Seats Available
          </span>
        );
    }
  };

  return (
    <div
      ref={containerRef}
      id="upcoming-departures"
      className="w-full bg-white rounded-[22px] border border-[#E5EAF2] p-4 sm:p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] space-y-6"
    >
      {/* Header Title */}
      <div className="space-y-1 text-left border-b border-[#F1F5F9] pb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#3478F6] flex items-center gap-1.5">
          <CalendarDays className="w-4 h-4 text-[#3478F6]" />
          <span>Upcoming Departures</span>
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#0B1026]">
          Book Your Seat for the Next Trip
        </h2>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Tap any highlighted calendar date to preview trip details, pricing, and live seat availability.
        </p>
      </div>

      {activeBatches.length === 0 ? (
        <div className="bg-[#F8FAFC] border border-[#E5EAF2] rounded-2xl p-8 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-gray-400 mx-auto" />
          <h3 className="font-bold text-sm text-[#0B1026]">No Fixed Departures Currently Scheduled</h3>
          <p className="text-xs text-[#64748B]">
            Custom dates and private group bookings are available on request!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Calendar Navigation & Month Controller */}
          <div className="max-w-[460px] mx-auto bg-[#F8FAFC] rounded-[18px] border border-[#E5EAF2] p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-base sm:text-lg font-bold text-[#0B1026]">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h3>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-9 h-9 rounded-xl border border-[#E5EAF2] bg-white flex items-center justify-center text-[#0B1026] hover:text-[#3478F6] hover:bg-[#F3F7FF] transition-colors cursor-pointer"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-9 h-9 rounded-xl border border-[#E5EAF2] bg-white flex items-center justify-center text-[#0B1026] hover:text-[#3478F6] hover:bg-[#F3F7FF] transition-colors cursor-pointer"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Row */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2 pb-2 border-b border-[#E5EAF2]">
              {WEEKDAY_NAMES.map((day, idx) => (
                <div key={idx} className="text-[10px] sm:text-xs font-bold text-[#64748B]">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
              {/* Previous Month Cells */}
              {Array.from({ length: firstDayIndex }).map((_, i) => {
                const prevNum = prevMonthDays - firstDayIndex + i + 1;
                return (
                  <div
                    key={`prev-${i}`}
                    className="w-full aspect-square rounded-xl border border-transparent flex items-center justify-center text-xs font-medium text-gray-300 pointer-events-none opacity-40"
                  >
                    {prevNum}
                  </div>
                );
              })}

              {/* Current Month Cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isToday = isCurrentMonthView && dayNum === todayDateNumber;
                const dayBatches = getBatchesForDay(dayNum);
                const hasDeparture = dayBatches.length > 0;
                const firstBatch = hasDeparture ? dayBatches[0] : null;

                const isSelected =
                  selectedBatch &&
                  hasDeparture &&
                  dayBatches.some((b) => b.id === selectedBatch.id);

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    disabled={!hasDeparture}
                    onClick={() => {
                      if (firstBatch) {
                        setSelectedBatch(firstBatch);
                      }
                    }}
                    className={`relative w-full aspect-square rounded-xl border flex flex-col items-center justify-center transition-all duration-150 select-none outline-none ${
                      isSelected
                        ? "border-[#3478F6] bg-[#3478F6] text-white font-extrabold shadow-md scale-105 z-10 cursor-pointer"
                        : hasDeparture
                        ? "border-[#3478F6]/40 bg-[#F0F5FF] text-[#0B1026] font-bold hover:bg-[#3478F6]/15 hover:border-[#3478F6] cursor-pointer"
                        : isToday
                        ? "border-[#E5EAF2] bg-white text-[#94A3B8] font-medium"
                        : "border-[#E5EAF2] bg-white text-gray-400 font-normal opacity-60"
                    }`}
                  >
                    <span className="text-xs sm:text-sm leading-none">{dayNum}</span>

                    {hasDeparture && (
                      <span
                        className={`absolute bottom-1 w-2 h-2 rounded-full ${
                          isSelected ? "bg-white" : "bg-[#3478F6]"
                        }`}
                      />
                    )}
                  </button>
                );
              })}

              {/* Next Month Padding Cells */}
              {Array.from({ length: (42 - (firstDayIndex + daysInMonth)) % 7 }).map((_, i) => (
                <div
                  key={`next-${i}`}
                  className="w-full aspect-square rounded-xl border border-transparent flex items-center justify-center text-xs font-medium text-gray-300 pointer-events-none opacity-40"
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Calendar Legend */}
            <div className="mt-3 pt-2.5 border-t border-[#E5EAF2] flex items-center justify-center gap-4 text-[11px] font-medium text-[#64748B]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3478F6]" />
                <span>Available Departure</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3478F6] ring-2 ring-[#3478F6]/30" />
                <span>Selected Date</span>
              </div>
            </div>
          </div>

          {/* Departure Information Preview Card */}
          {selectedBatch && (
            <div className="bg-[#F8FAFF] rounded-[20px] border border-[#DBE6FF] p-4.5 sm:p-6 shadow-xs space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DBE6FF] pb-3.5">
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#3478F6]">
                    Selected Departure Batch
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0B1026] mt-0.5">
                    {selectedBatch.batchName || packageTitle}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#3478F6]" />
                    <span>{destinationName}</span>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">{getStatusBadge(selectedBatch)}</div>
              </div>

              {/* Trip Dates & Duration Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-[#E5EAF2] p-3 space-y-0.5">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase block">
                    Departure Date
                  </span>
                  <span className="text-sm font-bold text-[#0B1026] flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-[#3478F6]" />
                    {formatDate(selectedBatch.startDate)}
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-[#E5EAF2] p-3 space-y-0.5">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase block">
                    Return Date / Duration
                  </span>
                  <span className="text-sm font-bold text-[#0B1026] flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-500" />
                    {formatDate(selectedBatch.endDate)} ({duration})
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-[#E5EAF2] p-3 space-y-0.5">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase block">
                    Seat Availability
                  </span>
                  <span className="text-sm font-bold text-[#0B1026] flex items-center gap-1.5">
                    <UsersRound className="w-4 h-4 text-[#3478F6]" />
                    {selectedBatch.availableSeats} / {selectedBatch.totalSeats || 30} Seats Left
                  </span>
                </div>
              </div>

              {/* Price & Primary CTA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
                <div>
                  <span className="text-xs text-[#64748B] font-bold uppercase tracking-wider block">
                    Departure Price
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-[#3478F6]">
                      {formatPrice(selectedBatch.priceOverride || startingPrice)}
                    </span>
                    <span className="text-xs font-semibold text-[#64748B]">/ person</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <Link
                    href={`/book-now?packageId=${packageSlug}&batchId=${selectedBatch.id}`}
                    className="w-full sm:w-auto h-[48px] px-6 bg-white hover:bg-gray-50 border border-[#3478F6] text-[#3478F6] font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Reserve via Form</span>
                  </Link>

                  <button
                    type="button"
                    disabled={isBookingLoading}
                    onClick={() => handleBookSeat(selectedBatch)}
                    className="w-full sm:w-auto h-[48px] px-7 bg-[#3478F6] hover:bg-[#2563EB] disabled:bg-[#3478F6]/70 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:cursor-wait shadow-md"
                  >
                    {isBookingLoading ? (
                      <>
                        <Loader2 className="w-4.5 h-4.5 animate-spin shrink-0" />
                        <span>Preparing Booking...</span>
                      </>
                    ) : (
                      <>
                        <span>Book Your Seat</span>
                        <ArrowRight className="w-4.5 h-4.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
