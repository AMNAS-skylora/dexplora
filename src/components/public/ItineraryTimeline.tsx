"use client";

import { useId, useState } from "react";
import Image from "next/image";
import {
  Bike, BusFront, CalendarDays, CarFront, ChevronDown,
  Footprints, MapPin, Plane, Route, Ship, TrainFront, Truck,
} from "lucide-react";
import {
  ITINERARY_TRANSPORT_MODES,
  normalizeItineraryTransportMode,
  type ItineraryTransportMode,
} from "@/lib/itinerary-transport";

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

const travelIcons = {
  none: Route,
  car: CarFront,
  van: Truck,
  bus: BusFront,
  train: TrainFront,
  plane: Plane,
  ship: Ship,
  bike: Bike,
  walk: Footprints,
} as const;

function routeCaption(current: ItineraryTimelineDay, next: ItineraryTimelineDay): string {
  const custom = String(current.transportNote || "").trim();
  if (custom) return custom;
  const stop = String(next.stopName || next.title || "").trim();
  if (stop) return "Travel to " + stop;
  const mode = normalizeItineraryTransportMode(current.transportMode);
  const modeLabel = ITINERARY_TRANSPORT_MODES.find((entry) => entry.value === mode)?.label;
  return mode !== "none" && modeLabel ? "Travel by " + modeLabel : "Continue the journey";
}

function TransportRoute({
  from, to, index,
}: {
  from: ItineraryTimelineDay;
  to: ItineraryTimelineDay;
  index: number;
}) {
  const mode: ItineraryTransportMode = normalizeItineraryTransportMode(from.transportMode);
  const Icon = travelIcons[mode];
  const caption = routeCaption(from, to);
  const isReversed = index % 2 === 1;
  return (
    <div className="relative z-0 h-[166px] w-full overflow-visible sm:h-[190px]" aria-label={caption}>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1000 240"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <path
          d={isReversed
            ? "M 920 -10 C 880 90 710 150 500 123 S 160 100 72 252"
            : "M 72 -10 C 116 86 296 153 500 121 S 852 105 930 252"}
          fill="none"
          stroke="#A1AFD0"
          strokeWidth="5"
          strokeDasharray="12 13"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="absolute inset-x-0 top-[42%] flex -translate-y-1/2 flex-col items-center justify-center gap-2 px-8 text-center">
        <span
          className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full border-2 border-[#BACBE9] bg-[#F9FBFF] text-[#3D619C] shadow-[0_4px_18px_rgba(31,77,136,0.12)] sm:h-[76px] sm:w-[76px]"
          title={ITINERARY_TRANSPORT_MODES.find((entry) => entry.value === mode)?.label || "Travel route"}
        >
          <Icon size={31} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <p className="max-w-[270px] break-words rounded-lg bg-[#F2F7FF]/95 px-2 py-1 text-center text-[13px] font-bold leading-snug text-[#213450] sm:max-w-[450px] sm:text-[16px]">
          {caption}
        </p>
      </div>
    </div>
  );
}

/**
 * Interactive accordion itinerary with the user's screenshot-style serpentine
 * travel route. A journey day retains its picture, time-stamped activities and
 * departure-specific date. No database operation happens on expand/collapse.
 */
export function ItineraryTimeline({ days, departureDate }: ItineraryTimelineProps) {
  const headingId = useId();
  const ordered = (Array.isArray(days) ? days : [])
    .filter((day) => Number.isFinite(Number(day.dayNumber)))
    .slice()
    .sort((a, b) => Number(a.dayNumber) - Number(b.dayNumber));
  const [expanded, setExpanded] = useState<number[]>([0]);

  if (!ordered.length) return null;

  function toggleDay(index: number) {
    setExpanded((previous) =>
      previous.includes(index)
        ? previous.filter((item) => item !== index)
        : [...previous, index],
    );
  }

  return (
    <section
      aria-labelledby={headingId}
      className="w-full min-w-0 rounded-[24px] bg-[#F2F7FF] px-3.5 py-6 text-[#192B4A] sm:px-6 sm:py-8 lg:px-9"
    >
      <header className="mb-6 sm:mb-9">
        <p className="mb-1.5 text-[10px] font-extrabold tracking-[0.2em] text-[#3769B3]">
          YOUR JOURNEY
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={headingId} className="text-[clamp(23px,5vw,34px)] font-extrabold leading-tight tracking-[-0.03em]">
            Day-by-Day Itinerary
          </h2>
          <span className="rounded-full bg-[#D7E9FF] px-3 py-1.5 text-xs font-bold text-[#174B8C]">
            {ordered.length} {ordered.length === 1 ? "Day" : "Days"}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#62748D] sm:text-sm">
          Explore the route, transport and highlights of each day.
        </p>
      </header>

      <ol className="min-w-0">
        {ordered.map((day, index) => {
          const number = Number(day.dayNumber) || index + 1;
          const date = dayDate(departureDate, number);
          const imageUrl = safePhotoUrl(day.imageUrl || day.image);
          const activities = parseItineraryActivities(day.description);
          const opened = expanded.includes(index);
          const panelId = headingId + "-day-" + index;
          const stop = String(day.stopName || "").trim();
          const title = String(day.title || "").trim();
          return (
            <li key={day.id || "day-" + number + "-" + index} className="relative min-w-0">
              <article className="relative z-10 min-w-0 rounded-[22px] border border-[#CFDFF5] bg-[#E6F1FF] shadow-[0_5px_14px_rgba(31,77,136,0.05)]">
                <h3>
                  <button
                    type="button"
                    aria-expanded={opened}
                    aria-controls={panelId}
                    onClick={() => toggleDay(index)}
                    className="group flex min-h-[80px] w-full min-w-0 items-center gap-3 rounded-[22px] px-3.5 py-3.5 text-left transition-colors hover:bg-[#DCEBFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3478F6] sm:min-h-[94px] sm:gap-5 sm:px-6"
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#316DA8] sm:h-9 sm:w-9"
                    >
                      <span className="h-3.5 w-3.5 rounded-full bg-white sm:h-4 sm:w-4" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1 text-[17px] font-extrabold leading-tight text-[#192B4A] sm:gap-x-3 sm:text-[22px]">
                      <span className="shrink-0">Day {String(number).padStart(2, "0")}</span>
                      {stop && (
                        <>
                          <span aria-hidden="true" className="shrink-0 text-[#7EB6F3]">•</span>
                          <span className="min-w-0 break-words">{stop}</span>
                        </>
                      )}
                    </span>
                    <span
                      aria-hidden="true"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#8DA5CB] bg-white/70 text-[#3C598A] transition-transform sm:h-12 sm:w-12"
                    >
                      <ChevronDown className={"h-6 w-6 transition-transform duration-200 " + (opened ? "rotate-180" : "rotate-0")} strokeWidth={2.3} />
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-label={"Details for day " + number}
                  hidden={!opened}
                  className="border-t border-[#C8DBF6] bg-white/85 px-4 pb-5 pt-5 sm:px-6 sm:pb-7"
                >
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
                      <div className="mb-4 space-y-2">
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-[#3769B3]">
                          DAILY HIGHLIGHTS
                        </p>
                        <h4 className="break-words text-[18px] font-extrabold leading-snug text-[#192B4A] sm:text-[21px]">
                          {title || stop || "Day " + number}
                        </h4>
                        {date && (
                          <p className="flex items-center gap-1.5 text-xs font-semibold text-[#59749B]">
                            <CalendarDays size={15} aria-hidden="true" />
                            <time>{date}</time>
                          </p>
                        )}
                      </div>
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
