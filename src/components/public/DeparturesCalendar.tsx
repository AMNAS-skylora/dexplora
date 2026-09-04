"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  UsersRound,
  ArrowRight,
  X,
  Clock,
  Send,
} from "lucide-react";
import { formatPrice, formatDate } from "@/lib/utils";

export interface MergedCalendarItem {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  eventType: string; // TRIP, SPECIAL_EVENT, HOLIDAY, ANNIVERSARY, OFFER, CLOSED_DAY
  status: string; // OPEN, FILLING_FAST, ALMOST_FULL, SOLD_OUT, COMPLETED, CANCELLED, CLOSED
  price?: number | null;
  totalSeats?: number;
  availableSeats?: number;
  destinationName?: string;
  duration?: string;
  packageSlug?: string;
  tripBatchId?: string;
  coverImage?: string | null;
  customColor?: string | null;
  description?: string | null;
}

interface DeparturesCalendarProps {
  batches: Array<{
    id: string;
    startDate: Date | string;
    endDate: Date | string;
    totalSeats: number;
    availableSeats: number;
    status: string;
    priceOverride?: number | null;
    batchName?: string | null;
    package: {
      title: string;
      slug: string;
      coverImage: string;
      price: number;
      duration: string;
      destination: { name: string };
    };
  }>;
  customEvents?: Array<{
    id: string;
    title: string;
    slug: string;
    eventType: string;
    startDate: Date | string;
    endDate: Date | string;
    description?: string | null;
    color?: string | null;
    status: string;
    package?: { slug: string; coverImage: string; price: number; duration: string; destination: { name: string } } | null;
    tripBatchId?: string | null;
  }>;
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
  if (dateInput instanceof Date) return dateInput;

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

export function DeparturesCalendar({ batches = [], customEvents = [] }: DeparturesCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<MergedCalendarItem[] | null>(null);
  const [activeCalloutDayNum, setActiveCalloutDayNum] = useState<number | null>(null);
  const [hoveredDayNum, setHoveredDayNum] = useState<number | null>(null);
  const [imgErrorMap, setImgErrorMap] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // 1. Merge TripBatches and CustomEvents
  const mergedItems = useMemo<MergedCalendarItem[]>(() => {
    const items: MergedCalendarItem[] = [];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    (batches || []).forEach((b) => {
      const sDate = parseLocalDate(b.startDate);
      const sDateStart = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());
      if (sDateStart.getTime() < todayStart.getTime()) {
        return; // Filter out expired/past batch dates
      }

      const eDate = parseLocalDate(b.endDate);
      const total = b.totalSeats || 30;
      const avail = b.availableSeats !== undefined ? b.availableSeats : 30;
      const ratio = total > 0 ? avail / total : 0;

      let calcStatus = b.status || "OPEN";
      if (b.status !== "CANCELLED" && b.status !== "COMPLETED") {
        if (avail <= 0) calcStatus = "SOLD_OUT";
        else if (ratio > 0.5) calcStatus = "OPEN";
        else if (ratio >= 0.25) calcStatus = "FILLING_FAST";
        else calcStatus = "ALMOST_FULL";
      }

      items.push({
        id: b.id,
        title: b.batchName ? `${b.package?.title || "Group Departure"} (${b.batchName})` : (b.package?.title || "Group Departure"),
        startDate: sDate,
        endDate: eDate,
        eventType: "TRIP",
        status: calcStatus,
        price: b.priceOverride || b.package?.price,
        totalSeats: total,
        availableSeats: avail,
        destinationName: b.package?.destination?.name || (b as any).destinationName || (b as any).destination?.name || undefined,
        duration: b.package?.duration || "Multi-day",
        packageSlug: b.package?.slug || "trip",
        tripBatchId: b.id,
        coverImage: b.package?.coverImage,
      });
    });

    (customEvents || []).forEach((ev) => {
      const sDate = parseLocalDate(ev.startDate);
      const sDateStart = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate());
      if (sDateStart.getTime() < todayStart.getTime()) {
        return; // Filter out expired/past custom events
      }

      const eDate = parseLocalDate(ev.endDate);

      items.push({
        id: ev.id,
        title: ev.title,
        startDate: sDate,
        endDate: eDate,
        eventType: ev.eventType || "SPECIAL_EVENT",
        status: ev.status || "OPEN",
        price: ev.package?.price || null,
        destinationName: ev.package?.destination?.name || undefined,
        duration: ev.package?.duration || undefined,
        packageSlug: ev.package?.slug || undefined,
        tripBatchId: ev.tripBatchId || undefined,
        coverImage: ev.package?.coverImage || null,
        customColor: ev.color || null,
        description: ev.description || null,
      });
    });

    return items;
  }, [batches, customEvents]);

  // 2. Pre-computed Day Event Map for O(1) Calendar Lookups via getDateKey
  const eventsByDateMap = useMemo(() => {
    const map = new Map<string, MergedCalendarItem[]>();
    mergedItems.forEach((item) => {
      const key = getDateKey(item.startDate);
      const existing = map.get(key) || [];
      existing.push(item);
      map.set(key, existing);
    });
    return map;
  }, [mergedItems]);

  const firstDayIndex = useMemo(() => new Date(currentYear, currentMonth, 1).getDay(), [currentYear, currentMonth]);
  const daysInMonth = useMemo(() => new Date(currentYear, currentMonth + 1, 0).getDate(), [currentYear, currentMonth]);
  const prevMonthDays = useMemo(() => new Date(currentYear, currentMonth, 0).getDate(), [currentYear, currentMonth]);

  const todayObj = useMemo(() => new Date(), []);
  const isCurrentMonthView = todayObj.getFullYear() === currentYear && todayObj.getMonth() === currentMonth;
  const todayDateNumber = todayObj.getDate();

  const getEventsForDay = useCallback(
    (dayNum: number) => {
      const key = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      return eventsByDateMap.get(key) || [];
    },
    [eventsByDateMap, currentYear, currentMonth]
  );

  // Auto-find initial featured callout day
  useEffect(() => {
    let nearestDay: number | null = null;
    for (let day = 1; day <= daysInMonth; day++) {
      const evs = getEventsForDay(day);
      if (evs.length > 0) {
        nearestDay = day;
        break;
      }
    }
    setActiveCalloutDayNum(nearestDay);
  }, [currentYear, currentMonth, daysInMonth, mergedItems]);

  // Lock body scroll when departure details modal is open
  useEffect(() => {
    if (selectedDayEvents) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedDayEvents]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDayEvents(null);
    setActiveCalloutDayNum(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDayEvents(null);
    setActiveCalloutDayNum(null);
  };

  // Helper to find nearest upcoming event on or after today
  const nextUpcomingEvent = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const upcoming = mergedItems
      .filter((item) => {
        const itemStart = new Date(item.startDate.getFullYear(), item.startDate.getMonth(), item.startDate.getDate()).getTime();
        return itemStart >= todayStart;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return upcoming.length > 0 ? upcoming[0] : null;
  }, [mergedItems]);

  const handleNextEvent = () => {
    if (!nextUpcomingEvent) return;

    const sDate = new Date(nextUpcomingEvent.startDate);
    const targetYear = sDate.getFullYear();
    const targetMonth = sDate.getMonth();
    const targetDay = sDate.getDate();

    // 1. Move calendar view to target month/year
    setCurrentDate(new Date(targetYear, targetMonth, 1));

    // 2. Focus and highlight the day's event callout
    const targetDateObj = new Date(targetYear, targetMonth, targetDay);
    const dayEvents = mergedItems.filter((item) => {
      const itemStart = new Date(item.startDate.getFullYear(), item.startDate.getMonth(), item.startDate.getDate());
      return itemStart.getTime() === targetDateObj.getTime();
    });

    setSelectedDayEvents(dayEvents.length > 0 ? dayEvents : null);
    setActiveCalloutDayNum(targetDay);
  };

  const getEventDotColor = (item: MergedCalendarItem) => {
    if (item.customColor) return item.customColor;
    switch (item.eventType) {
      case "ANNIVERSARY": return "#7C3AED";
      case "OFFER": return "#3478F6";
      case "HOLIDAY": return "#64748B";
      case "CLOSED_DAY": return "#EF4444";
      default: break;
    }
    switch (item.status) {
      case "OPEN": return "#16A36A";
      case "FILLING_FAST": return "#F59E0B";
      case "ALMOST_FULL": return "#EF4444";
      case "SOLD_OUT":
      case "CLOSED": return "#B42318";
      case "COMPLETED": return "#98A2B3";
      default: return "#16A36A";
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto bg-white border border-[#E5EAF2] rounded-[18px] p-3.5 sm:p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] relative overflow-visible">
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          onClick={handleNextEvent}
          disabled={!nextUpcomingEvent}
          className={`h-[36px] px-2.5 sm:px-3 rounded-[10px] text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
            nextUpcomingEvent
              ? "bg-[#3478F6]/10 border border-[#3478F6]/20 text-[#3478F6] hover:bg-[#3478F6] hover:text-white cursor-pointer"
              : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
          }`}
          aria-label="Jump to next upcoming trip"
          title={nextUpcomingEvent ? `Jump to ${nextUpcomingEvent.destinationName || nextUpcomingEvent.title}` : "No upcoming events"}
        >
          <span className="hidden sm:inline">Next Event</span>
          <span className="sm:hidden">Next</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <h3 className="text-[15px] sm:text-[17px] font-semibold text-[#0B1026] text-center truncate min-w-0">
          {MONTH_NAMES[currentMonth]} {currentYear}
        </h3>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handlePrevMonth}
            className="w-[38px] h-[38px] rounded-[10px] border border-[#E5EAF2] bg-[#F8FAFC] flex items-center justify-center text-[#0B1026] hover:text-[#3478F6] hover:bg-[#F3F7FF] transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextMonth}
            className="w-[38px] h-[38px] rounded-[10px] border border-[#E5EAF2] bg-[#F8FAFC] flex items-center justify-center text-[#0B1026] hover:text-[#3478F6] hover:bg-[#F3F7FF] transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Weekday Row */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5 pb-2 border-b border-[#E5EAF2]">
        {WEEKDAY_NAMES.map((day, idx) => (
          <div key={idx} className="text-[10px] sm:text-[11px] font-semibold text-[#64748B] text-center">
            {day}
          </div>
        ))}
      </div>

      {/* 3. Calendar Grid (Strict 7 columns, square aspect ratio cells) */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {/* Previous Month Cells */}
        {Array.from({ length: firstDayIndex }).map((_, i) => {
          const prevNum = prevMonthDays - firstDayIndex + i + 1;
          return (
            <div
              key={`prev-${i}`}
              className="w-full aspect-square rounded-[10px] border border-transparent flex items-center justify-center text-[11px] sm:text-xs font-medium text-gray-300 pointer-events-none select-none opacity-40"
            >
              {prevNum}
            </div>
          );
        })}

        {/* Current Month Cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const isToday = isCurrentMonthView && dayNum === todayDateNumber;
          const dayEvents = getEventsForDay(dayNum);
          const hasEvents = dayEvents.length > 0;
          
          const isCalloutActive = hasEvents && (activeCalloutDayNum === dayNum || hoveredDayNum === dayNum);

          const cellGridIndex = firstDayIndex + i;
          const isTopRow = cellGridIndex < 7;
          const isRightEdge = cellGridIndex % 7 >= 5;
          const isLeftEdge = cellGridIndex % 7 <= 1;

          const primaryEvent = hasEvents ? dayEvents[0] : null;
          const calloutLabel = primaryEvent ? primaryEvent.destinationName || primaryEvent.title : "";

          return (
            <div
              key={`day-${dayNum}`}
              className="relative w-full aspect-square min-w-0"
              onMouseEnter={() => setHoveredDayNum(dayNum)}
              onMouseLeave={() => setHoveredDayNum(null)}
            >
              {/* Premium Speech Bubble / Comic Callout */}
              {isCalloutActive && (
                <div
                  className={`absolute z-50 bg-[#111827] text-white text-[11px] sm:text-[12px] font-semibold px-2.5 py-1.5 rounded-[10px] shadow-[0_6px_18px_rgba(15,23,42,0.22)] whitespace-normal break-words pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 w-max max-w-[min(240px,calc(100vw-32px))] text-center leading-tight ${
                    isTopRow ? "top-full mt-2" : "bottom-full mb-2"
                  } ${
                    isRightEdge ? "right-0" : isLeftEdge ? "left-0" : "left-1/2 -translate-x-1/2"
                  }`}
                >
                  <span>{calloutLabel}</span>
                  {dayEvents.length > 1 && (
                    <span className="ml-1 text-[#3478F6] font-bold shrink-0">+{dayEvents.length - 1}</span>
                  )}

                  {/* Speech Bubble Pointer Arrow */}
                  <div
                    className={`absolute border-x-[5px] border-x-transparent ${
                      isTopRow
                        ? "bottom-full border-b-[6px] border-b-[#111827]"
                        : "top-full border-t-[6px] border-t-[#111827]"
                    } ${
                      isRightEdge
                        ? "right-3"
                        : isLeftEdge
                        ? "left-3"
                        : "left-1/2 -translate-x-1/2"
                    }`}
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (hasEvents) {
                    setSelectedDayEvents(dayEvents);
                    setActiveCalloutDayNum(dayNum);
                  }
                }}
                aria-label={`${dayNum} ${MONTH_NAMES[currentMonth]} ${currentYear}${hasEvents ? ` - ${dayEvents.length} departure` : ""}`}
                className={`w-full h-full rounded-[10px] border flex flex-col items-center justify-center transition-all duration-150 select-none touch-manipulation outline-none focus:ring-2 focus:ring-[#3478F6] focus:ring-offset-1 ${
                  isCalloutActive
                    ? "border-[#3478F6] bg-[#3478F6]/15 text-[#3478F6] font-bold shadow-xs"
                    : isToday
                    ? "border-[#3478F6] bg-[#3478F6]/10 text-[#3478F6] font-bold"
                    : hasEvents
                    ? "border-[#3478F6]/35 bg-white hover:bg-[#F8FAFC] hover:border-[#3478F6] cursor-pointer text-[#0B1026]"
                    : "border-[#E5EAF2] bg-white text-[#0B1026] hover:bg-[#F8FAFC]"
                }`}
              >
                {/* Date Number */}
                <span className="text-[12px] sm:text-[13px] leading-none">
                  {dayNum}
                </span>

                {/* Event Bottom Indicator Bar */}
                {hasEvents && (
                  <span
                    style={{ backgroundColor: getEventDotColor(dayEvents[0]) }}
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3.5 sm:w-4 h-1 rounded-full shadow-2xs"
                  />
                )}
              </button>
            </div>
          );
        })}

        {/* Next Month Padding Cells */}
        {Array.from({ length: (42 - (firstDayIndex + daysInMonth)) % 7 }).map((_, i) => (
          <div
            key={`next-${i}`}
            className="w-full aspect-square rounded-[10px] border border-transparent flex items-center justify-center text-[11px] sm:text-xs font-medium text-gray-300 pointer-events-none select-none opacity-40"
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Legend Strip */}
      <div className="mt-3 pt-2.5 border-t border-[#E5EAF2] flex flex-wrap items-center justify-center gap-3 text-[10px] sm:text-[11px] font-medium text-[#64748B]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#16A36A]" />
          <span>Open</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          <span>Filling Fast</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
          <span>Almost Full</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#B42318]" />
          <span>Sold Out</span>
        </div>
      </div>

      {/* View All Trips Link */}
      <div className="mt-3 text-center">
        <Link
          href="/upcoming-trips"
          className="w-full inline-flex items-center justify-center gap-2 bg-[#3478F6] hover:bg-[#2563EB] text-white px-4 py-2.5 rounded-[12px] font-semibold text-xs transition-all active:scale-95 min-h-[42px]"
        >
          <span>View All Upcoming Trips</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Mobile / Desktop Event Details Modal Overlay rendered via React Portal at Body Root */}
      {mounted && selectedDayEvents && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-[#050A1A]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 min-h-[100dvh] w-screen animate-in fade-in duration-200"
          onClick={() => setSelectedDayEvents(null)}
          role="dialog"
          aria-modal="true"
        >
          <div 
            className="bg-white w-[min(100%,440px)] rounded-[20px] p-4 sm:p-5 shadow-2xl space-y-3.5 max-h-[calc(100dvh-28px)] overflow-y-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E5EAF2]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3478F6]">
                  Departures ({selectedDayEvents.length})
                </span>
                <h4 className="text-base font-bold text-[#0B1026]">
                  {formatDate(selectedDayEvents[0].startDate)}
                </h4>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center transition-colors min-w-[36px] min-h-[36px]"
                aria-label="Close modal"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              {selectedDayEvents.map((ev) => {
                const isSoldOut = ev.status === "SOLD_OUT" || ev.status === "CLOSED" || ev.status === "COMPLETED";
                const hasImgError = imgErrorMap[ev.id];

                return (
                  <div key={ev.id} className="bg-[#F8FAFC] rounded-[14px] overflow-hidden border border-[#E5EAF2] p-3 space-y-2.5">
                    {ev.coverImage && !hasImgError ? (
                      <div className="relative h-[120px] w-full rounded-[12px] overflow-hidden bg-gray-200">
                        <Image
                          src={ev.coverImage}
                          alt={ev.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 400px"
                          className="object-cover object-center"
                          onError={() => setImgErrorMap((prev) => ({ ...prev, [ev.id]: true }))}
                        />
                      </div>
                    ) : null}

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className="font-semibold text-sm text-[#0B1026] leading-snug">{ev.title}</h5>
                        {ev.destinationName && (
                          <div className="flex items-center gap-1 text-[11px] text-[#3478F6] font-medium mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{ev.destinationName}</span>
                          </div>
                        )}
                      </div>
                      {ev.price && (
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-[#64748B] block">Price</span>
                          <span className="text-base font-bold text-[#3478F6] leading-none">{formatPrice(ev.price)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748B] pt-1.5 border-t border-[#E5EAF2]">
                      {ev.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>{ev.duration}</span>
                        </div>
                      )}
                      {ev.availableSeats !== undefined && (
                        <div className="flex items-center gap-1">
                          <UsersRound className="w-3 h-3 text-[#3478F6]" />
                          <span>{ev.availableSeats} seats left</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1.5">
                      {ev.packageSlug && (
                        <Link
                          href={`/packages/${ev.packageSlug}`}
                          onClick={() => setSelectedDayEvents(null)}
                          className="h-[40px] bg-[#3478F6] hover:bg-[#2563EB] text-white rounded-[10px] font-semibold text-xs flex items-center justify-center gap-1 flex-1 shadow-xs"
                        >
                          <span>View Trip</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
