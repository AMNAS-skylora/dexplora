"use client";

import { useEffect, useId, useRef } from "react";
import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { itineraryTransportIcons } from "@/components/ItineraryTransportIcons";
import { ITINERARY_TRANSPORT_MODES, normalizeItineraryTransportMode } from "@/lib/itinerary-transport";

export interface ItineraryTimelineDay {
  id?: string;
  dayNumber: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  meals?: string | null;
  accommodation?: string | null;
  stopName?: string | null;
  transportMode?: string | null;
  transportNote?: string | null;
}

export interface ItineraryTimelineProps {
  days: ItineraryTimelineDay[];
  departureDate?: string | Date | null;
}

interface Activity {
  time?: string;
  activity: string;
}

/** One activity per line; timed rows also accept "10:00 AM - Description". */
export function parseItineraryActivities(description: string | null | undefined): Activity[] {
  if (!description) return [];
  return description
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|li|div)>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/^[•\-*]\s*/, ""))
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^((?:0?[1-9]|1[0-2]):[0-5]\d\s*(?:AM|PM)|(?:[01]?\d|2[0-3]):[0-5]\d)\s*(?:[-–—|:]\s*|\s+)(.+)$/i);
      return match
        ? { time: match[1].replace(/\s+/g, " ").toUpperCase(), activity: match[2].trim() }
        : { activity: line };
    });
}

function dayDate(startDate: Date | string | null | undefined, dayNumber: number): string | null {
  if (!startDate) return null;
  const match = String(startDate instanceof Date ? startDate.toISOString() : startDate)
    .match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
  if (!Number.isFinite(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + Math.max(0, dayNumber - 1));
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  }).format(date);
}

function safePhotoUrl(value: string | null | undefined): string | null {
  const url = String(value || "").trim();
  return (url.startsWith("/") && !url.startsWith("//")) || /^https:\/\//i.test(url) ? url : null;
}

function routeCaption(current: ItineraryTimelineDay, next: ItineraryTimelineDay): string {
  const custom = String(current.transportNote || "").trim();
  if (custom) return custom;
  const stop = String(next.stopName || next.title || "").trim();
  if (stop) return "Travel to " + stop;
  const mode = normalizeItineraryTransportMode(current.transportMode);
  const modeLabel = ITINERARY_TRANSPORT_MODES.find((entry) => entry.value === mode)?.label;
  return mode !== "none" && modeLabel ? "Travel by " + modeLabel : "Continue the journey";
}

const ROUTE_VIEWBOX_HEIGHT = 240;

function TransportRoute({
  from, to, index,
}: {
  from: ItineraryTimelineDay;
  to: ItineraryTimelineDay;
  index: number;
}) {
  const clipId = useId();
  const mode = normalizeItineraryTransportMode(from.transportMode);
  const Icon = itineraryTransportIcons[mode];
  const modeLabel = ITINERARY_TRANSPORT_MODES.find((entry) => entry.value === mode)?.label;
  const caption = routeCaption(from, to);
  const curve = index % 2 === 0
    ? "M 72 0 C 110 85 290 120 500 120 S 860 156 928 240"
    : "M 928 0 C 890 85 710 120 500 120 S 140 156 72 240";

  return (
    <div className="relative grid min-h-36 w-full grid-rows-2 justify-items-center text-center sm:min-h-44">
      <svg
        aria-hidden="true"
        focusable="false"
        data-itinerary-route
        viewBox={`0 0 1000 ${ROUTE_VIEWBOX_HEIGHT}`}
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 w-full"
        style={{ height: "100%" }}
      >
        <defs>
          <clipPath id={clipId}>
            <rect data-route-fill width="1000" height="0" />
          </clipPath>
        </defs>
        <path
          d={curve}
          fill="none"
          stroke="#A8BBDD"
          strokeWidth="3"
          strokeDasharray="3 7"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={curve}
          fill="none"
          stroke="var(--primary-blue)"
          strokeWidth="4"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          clipPath={`url(#${clipId})`}
        />
      </svg>
      <span className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#C9DBF8] bg-white text-[#2563EB] shadow-sm sm:size-14">
        <Icon size={25} strokeWidth={1.8} aria-hidden="true" />
        {mode !== "none" && <span className="sr-only">{modeLabel}</span>}
      </span>
      <p className="relative row-start-2 mx-5 mb-2 mt-7 max-w-[85%] self-start rounded-lg bg-[#F2F7FF] px-2 py-1 text-[13px] font-bold text-[#213450] [overflow-wrap:anywhere] sm:mt-8 sm:text-base">
        {caption}
      </p>
    </div>
  );
}

export function ItineraryTimeline({ days, departureDate }: ItineraryTimelineProps) {
  const headingId = useId();
  const routeList = useRef<HTMLOListElement>(null);
  const ordered = (Array.isArray(days) ? days : [])
    .filter((day) => Number.isFinite(Number(day.dayNumber)))
    .sort((a, b) => Number(a.dayNumber) - Number(b.dayNumber));
  const dayCount = ordered.length;

  useEffect(() => {
    const list = routeList.current;
    if (!list || dayCount < 2) return;

    const fills = Array.from(list.querySelectorAll<SVGRectElement>("[data-route-fill]"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame: number | null = null;

    function paintRoutes() {
      frame = null;
      const readingLine = window.innerHeight * 0.68;
      const heights = fills.map((fill) => {
        if (reducedMotion.matches) return ROUTE_VIEWBOX_HEIGHT;

        const bounds = fill.ownerSVGElement?.getBoundingClientRect();
        if (!bounds?.height) return 0;

        // Both curves descend throughout, so clipping by height follows the scroll position.
        const progress = (readingLine - bounds.top) / bounds.height;
        return ROUTE_VIEWBOX_HEIGHT * Math.min(1, Math.max(0, progress));
      });
      fills.forEach((fill, index) => {
        const height = String(heights[index]);
        if (fill.getAttribute("height") !== height) fill.setAttribute("height", height);
      });
    }

    function schedulePaint() {
      if (frame === null) frame = window.requestAnimationFrame(paintRoutes);
    }

    const observer = new ResizeObserver(schedulePaint);
    observer.observe(list);
    window.addEventListener("scroll", schedulePaint, { passive: true });
    window.addEventListener("resize", schedulePaint);
    reducedMotion.addEventListener("change", schedulePaint);
    schedulePaint();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedulePaint);
      window.removeEventListener("resize", schedulePaint);
      reducedMotion.removeEventListener("change", schedulePaint);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [dayCount]);

  if (!dayCount) return null;

  return (
    <section
      aria-labelledby={headingId}
      className="w-full min-w-0 rounded-[24px] bg-[#F2F7FF] px-3.5 py-6 text-[#192B4A] sm:px-6 sm:py-8 lg:px-9"
    >
      <header className="mb-6 sm:mb-9">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={headingId} className="text-[clamp(23px,5vw,34px)] font-extrabold leading-tight tracking-[-0.03em]">
            Day-by-Day Itinerary
          </h2>
          <span className="rounded-full bg-[#D7E9FF] px-3 py-1.5 text-xs font-bold text-[#174B8C]">
            {ordered.length} {ordered.length === 1 ? "Day" : "Days"}
          </span>
        </div>
      </header>

      <div className="ml-[7.2%] flex items-center gap-2 pb-3 text-sm font-bold text-[#174B8C]">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-white">
          <MapPin size={19} aria-hidden="true" />
        </span>
        Trip starts
      </div>

      <ol ref={routeList} className="min-w-0">
        {ordered.map((day, index) => {
          const number = Number(day.dayNumber) || index + 1;
          const date = dayDate(departureDate, number);
          const imageUrl = safePhotoUrl(day.imageUrl || day.image);
          const activities = parseItineraryActivities(day.description);
          const stop = String(day.stopName || "").trim();
          const title = String(day.title || "").trim();
          return (
            <li key={day.id || "day-" + number + "-" + index} className="relative min-w-0">
              <article className="relative z-10 min-w-0 overflow-hidden rounded-[22px] border border-[#CFDFF5] bg-[#E6F1FF] shadow-[0_5px_14px_rgba(31,77,136,0.05)]">
                <h3 className="flex min-h-16 items-center gap-3 px-3.5 py-3.5 text-[17px] font-extrabold leading-tight sm:min-h-20 sm:gap-4 sm:px-6 sm:text-[22px]">
                  <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#2563EB] sm:size-8">
                    <span className="size-2.5 rounded-full bg-white sm:size-3" />
                  </span>
                  <span className="shrink-0">Day {String(number).padStart(2, "0")}</span>
                  {stop && (
                    <>
                      <span aria-hidden="true" className="shrink-0 text-[#3478F6]">•</span>
                      <span className="min-w-0 [overflow-wrap:anywhere]">{stop}</span>
                    </>
                  )}
                </h3>

                <div className="rounded-b-[22px] border-t border-[#C8DBF6] bg-white/85 px-4 pb-5 pt-5 sm:px-6 sm:pb-7">
                  <div className={"min-w-0 " + (imageUrl ? "grid grid-cols-1 items-start gap-5 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-7 lg:grid-cols-[205px_minmax(0,1fr)]" : "")}>
                    {imageUrl && (
                      <div className="mx-auto w-[200px] max-w-[88%] -rotate-[2deg] bg-white p-2 pb-5 shadow-[0_12px_26px_rgba(28,72,137,0.16)] sm:mx-0 sm:w-full">
                        <div className="relative aspect-[4/4.3] w-full overflow-hidden bg-[#E4EEFB]">
                          <Image src={imageUrl} fill unoptimized
                            sizes="(max-width: 640px) 200px, 210px"
                            className="object-cover"
                            alt={"Day " + number + " — " + (stop || title || "travel photo")}
                          />
                        </div>
                      </div>
                    )}
                    <div className="min-w-0">
                      {((title && title !== stop) || date) && (
                        <div className="mb-4 space-y-2">
                          {title && title !== stop && (
                            <h4 className="text-[18px] font-extrabold leading-snug text-[#192B4A] [overflow-wrap:anywhere] sm:text-[21px]">
                              {title}
                            </h4>
                          )}
                          {date && (
                            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#59749B]">
                              <CalendarDays size={15} aria-hidden="true" />
                              <time>{date}</time>
                            </p>
                          )}
                        </div>
                      )}
                      {activities.length > 0 ? (
                        <ul className="space-y-3.5" aria-label={"Day " + number + " activities"}>
                          {activities.map((entry, activityIndex) => (
                            <li key={"day-" + number + "-activity-" + activityIndex}
                              className="flex min-w-0 items-start gap-2.5 sm:gap-3">
                              <span aria-hidden="true" className="mt-[9px] h-2 w-2 shrink-0 rounded-full bg-[#3679D1]" />
                              <div className="flex min-w-0 flex-1 flex-wrap gap-x-3 gap-y-1 sm:flex-nowrap">
                                {entry.time && (
                                  <span className="w-auto shrink-0 text-[12px] font-extrabold text-[#316395] sm:w-[95px] sm:text-[14px]">
                                    {entry.time}
                                  </span>
                                )}
                                <span className="min-w-0 break-words text-[14px] font-semibold leading-[1.65] text-[#253D5D] sm:text-[16px] sm:font-bold">
                                  {entry.activity}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[14px] font-medium text-[#6B7F98] sm:text-[15px]">
                          Activities will be updated soon.
                        </p>
                      )}
                      {(day.meals || day.accommodation) && (
                        <div className="mt-5 flex flex-wrap gap-2 text-[11px] font-semibold text-[#22558D] sm:text-xs">
                          {day.meals && (
                            <span className="rounded-lg bg-[#E0EDFF] px-2.5 py-1.5">Meals: {day.meals}</span>
                          )}
                          {day.accommodation && (
                            <span className="rounded-lg bg-[#E0EDFF] px-2.5 py-1.5">Stay: {day.accommodation}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>

              {index < ordered.length - 1 && (
                <TransportRoute from={day} to={ordered[index + 1]} index={index} />
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
