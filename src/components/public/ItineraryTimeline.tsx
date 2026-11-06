import Image from "next/image";

export interface ItineraryTimelineDay {
  id?: string;
  dayNumber: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  meals?: string | null;
  accommodation?: string | null;
}

export interface ItineraryTimelineProps {
  days: ItineraryTimelineDay[];
  departureDate?: string | Date | null;
}

interface Activity {
  time?: string;
  activity: string;
}

/** Existing package descriptions use one time/activity entry per line. */
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
  const matched = String(startDate instanceof Date ? startDate.toISOString() : startDate)
    .match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!matched) return null;
  const start = new Date(Date.UTC(+matched[1], +matched[2] - 1, +matched[3]));
  if (!Number.isFinite(start.getTime())) return null;
  start.setUTCDate(start.getUTCDate() + Math.max(0, dayNumber - 1));
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
  }).format(start);
}

function photoUrl(value: string | null | undefined): string | null {
  const url = String(value || "").trim();
  return (url.startsWith("/") && !url.startsWith("//")) || /^https:\/\//i.test(url) ? url : null;
}

/** Photo-first vertical itinerary, in a soft sky-blue / navy palette. */
export function ItineraryTimeline({ days, departureDate }: ItineraryTimelineProps) {
  const ordered = (Array.isArray(days) ? days : [])
    .filter((day) => Number.isFinite(Number(day.dayNumber)))
    .slice()
    .sort((a, b) => a.dayNumber - b.dayNumber);
  if (!ordered.length) return null;

  return (
    <section
      aria-label="Day-by-day detailed itinerary"
      className="w-full min-w-0 overflow-hidden rounded-[24px] bg-[#F2F7FF] px-3.5 py-6 text-[#192B4A] sm:px-6 sm:py-8 lg:px-9"
    >
      <header className="mb-6 sm:mb-9">
        <p className="mb-1.5 text-[10px] font-extrabold tracking-[0.2em] text-[#3769B3]">
          YOUR JOURNEY
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[clamp(23px,5vw,34px)] font-extrabold leading-tight tracking-[-0.03em]">
            Day-by-Day Itinerary
          </h2>
          <span className="rounded-full bg-[#D7E9FF] px-3 py-1.5 text-xs font-bold text-[#174B8C]">
            {ordered.length} {ordered.length === 1 ? "Day" : "Days"}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#62748D] sm:text-sm">
          Explore every memorable stop of your journey.
        </p>
      </header>

      <ol className="space-y-6 sm:space-y-9">
        {ordered.map((day, index) => {
          const dayNum = Number(day.dayNumber) || index + 1;
          const photo = photoUrl(day.imageUrl || day.image);
          const activities = parseItineraryActivities(day.description);
          const date = dayDate(departureDate, dayNum);

          return (
            <li key={day.id || "itinerary-day-" + dayNum + "-" + index}
              className="grid min-w-0 grid-cols-[minmax(79px,25%)_minmax(0,1fr)] items-start gap-2.5 sm:grid-cols-[minmax(128px,27%)_minmax(0,1fr)] sm:gap-7"
            >
              <div className="min-w-0 pt-2 sm:pt-1">
                <div className={"relative mx-auto w-[94%] max-w-[210px] bg-white p-[5px] pb-4 shadow-[0_12px_25px_rgba(28,72,137,0.17)] transition-transform hover:rotate-0 sm:p-[9px] sm:pb-7 " + (index % 2 ? "rotate-[4deg]" : "-rotate-[4deg]")}>
                  <div className="relative aspect-[4/4.4] w-full overflow-hidden bg-[#E4EEFB]">
                    {photo ? (
                      <Image
                        src={photo}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 120px, (max-width: 1024px) 190px, 240px"
                        className="object-cover"
                        alt={"Photo for Day " + dayNum + ": " + (day.title || "Travel itinerary")}
                      />
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 px-1 text-center text-[#4275B8]">
                        <span className="text-2xl" aria-hidden="true">✦</span>
                        <span className="text-[9px] font-bold uppercase tracking-wide sm:text-xs">Day {dayNum}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="relative min-w-0 border-l-2 border-[#AEC6E8] pb-5 pl-4 sm:pl-8">
                <span aria-hidden="true"
                  className="absolute -left-[10px] top-1 h-[18px] w-[18px] rounded-full border-[3px] border-[#F2F7FF] bg-[#83BAFF] sm:-left-[13px] sm:h-6 sm:w-6"
                />
                <header className="mb-3 space-y-2 sm:mb-5 sm:space-y-3">
                  <div className="inline-flex min-h-8 items-center rounded-full bg-[#D7E9FF] px-3 py-1 text-sm font-extrabold text-[#163E78] sm:px-5 sm:py-1.5 sm:text-lg">
                    Day {dayNum}
                  </div>
                  <h3 className="break-words text-[15px] font-extrabold leading-snug tracking-[-0.015em] text-[#192B4A] sm:text-xl">
                    {day.title || "Day " + dayNum}
                  </h3>
                  {date && <time className="block text-[11px] font-semibold text-[#657A99] sm:text-xs">{date}</time>}
                </header>

                {activities.length ? (
                  <ul className="space-y-2.5 sm:space-y-3">
                    {activities.map((entry, entryIndex) => (
                      <li key={dayNum + "-activity-" + entryIndex}
                        className="grid min-w-0 grid-cols-[minmax(0,61px)_minmax(0,1fr)] gap-2 sm:grid-cols-[minmax(0,91px)_minmax(0,1fr)] sm:gap-4"
                      >
                        <span className="break-words border-r border-[#C8D7EB] pr-2 text-[10px] font-bold leading-relaxed text-[#244876] sm:pr-3 sm:text-sm">
                          {entry.time || ""}
                        </span>
                        <span className="min-w-0 break-words text-[11px] leading-relaxed text-[#455B77] sm:text-sm">
                          {entry.activity}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-[#6B7F98]">Activities will be updated soon.</p>
                )}

                {(day.meals || day.accommodation) && (
                  <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold text-[#22558D] sm:text-xs">
                    {day.meals && <span className="rounded-lg bg-[#E0EDFF] px-2.5 py-1.5">Meals: {day.meals}</span>}
                    {day.accommodation && <span className="rounded-lg bg-[#E0EDFF] px-2.5 py-1.5">Stay: {day.accommodation}</span>}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
