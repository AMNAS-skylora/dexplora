/**
 * Each TripBatch is an independent departure, including batches with the
 * SAME start date and package. Never use (packageId, startDate) as a unique key.
 */
export const DEPARTURE_STATUSES = [
  "UPCOMING", "OPEN", "FILLING_FAST", "ALMOST_FULL", "SOLD_OUT", "COMPLETED", "CANCELLED",
] as const;

export function parseDepartureDate(input: string | Date): Date {
  const value = input instanceof Date ? input.toISOString().slice(0, 10) : String(input).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Select a valid departure date (YYYY-MM-DD).");
  }
  const parsed = new Date(value + "T00:00:00.000Z");
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    throw new Error("Departure date is invalid.");
  }
  return parsed;
}

export function normalizeDepartureInput(input: {
  startDate: string | Date;
  endDate: string | Date;
  totalSeats: number;
  priceOverride?: number | null;
  status: string;
}, packagePrice: number, bookedSeats = 0) {
  const startDate = parseDepartureDate(input.startDate);
  const endDate = parseDepartureDate(input.endDate);
  if (endDate < startDate) throw new Error("End date must be on or after the departure date.");

  const totalSeats = Number(input.totalSeats);
  if (!Number.isSafeInteger(totalSeats) || totalSeats < 1) {
    throw new Error("Total seats must be a positive whole number.");
  }
  if (totalSeats < bookedSeats) {
    throw new Error("Cannot set fewer seats than currently booked travellers.");
  }

  const hasCustomPrice = input.priceOverride !== null && input.priceOverride !== undefined;
  const priceOverride = hasCustomPrice ? Number(input.priceOverride) : null;
  if (hasCustomPrice && (!Number.isFinite(priceOverride) || Number(priceOverride) <= 0)) {
    throw new Error("Departure rate must be greater than zero, or leave blank to use package rate.");
  }
  const effectivePrice = priceOverride ?? Number(packagePrice);
  if (!Number.isFinite(effectivePrice) || effectivePrice <= 0) {
    throw new Error("Set a valid package rate or a departure-specific rate.");
  }
  if (!DEPARTURE_STATUSES.includes(input.status as (typeof DEPARTURE_STATUSES)[number])) {
    throw new Error("Invalid departure status.");
  }

  const availableSeats = totalSeats - bookedSeats;
  const status = availableSeats === 0 && input.status !== "CANCELLED" && input.status !== "COMPLETED"
    ? "SOLD_OUT" : input.status;

  return { startDate, endDate, totalSeats, bookedSeats, availableSeats, priceOverride, effectivePrice, status };
}
