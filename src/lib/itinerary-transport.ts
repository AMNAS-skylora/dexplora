/**
 * Safe itinerary transport icon registry. Stored as keys on each embedded
 * itinerary day; no external icon URLs, dynamic imports or image assets needed.
 */
export const ITINERARY_TRANSPORT_MODES = [
  { value: "none", label: "No transfer" },
  { value: "car", label: "Car" },
  { value: "van", label: "Van / Traveller" },
  { value: "bus", label: "Bus" },
  { value: "train", label: "Train" },
  { value: "plane", label: "Flight" },
  { value: "ship", label: "Boat / Ship" },
  { value: "bike", label: "Bike" },
  { value: "walk", label: "Walking" },
] as const;

export type ItineraryTransportMode = typeof ITINERARY_TRANSPORT_MODES[number]["value"];

export function normalizeItineraryTransportMode(value: unknown): ItineraryTransportMode {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  return ITINERARY_TRANSPORT_MODES.some((mode) => mode.value === normalized)
    ? (normalized as ItineraryTransportMode)
    : "none";
}
