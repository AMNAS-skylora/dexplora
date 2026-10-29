export type GuestCategory = "REGULAR" | "INFLUENCER" | "SPECIAL_GUEST" | "STAFF";
export type FareType = "FULL" | "FREE" | "DISCOUNTED" | "CUSTOM";
export type TravelClass = "SEATER" | "SLEEPER" | "AC";

export interface BookingPriceInput {
  guestCategory: GuestCategory;
  fareType: FareType;
  travellerCount: number;
  baseFarePerPerson: number;
  travelClass: TravelClass;
  travelClassSurchargePerPerson?: number;
  discountAmount?: number;
  customTotal?: number;
  paidAmount?: number;
}

export interface BookingPriceResult {
  grossAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: "FREE" | "UNPAID" | "PARTIAL" | "PAID";
  requiresPayment: boolean;
}

function money(value: number, name: string): number {
  if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid ${name}`);
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Server-side authoritative pricing; never trust a client-calculated total. */
export function calculateBookingPrice(input: BookingPriceInput): BookingPriceResult {
  if (!Number.isSafeInteger(input.travellerCount) || input.travellerCount < 1)
    throw new Error("Traveller count must be a positive integer");
  const base = money(input.baseFarePerPerson, "base fare");
  const surcharge = money(input.travelClassSurchargePerPerson ?? 0, "travel surcharge");
  const gross = money((base + surcharge) * input.travellerCount, "gross amount");
  let total: number;
  switch (input.fareType) {
    case "FREE":
      if (!["INFLUENCER", "SPECIAL_GUEST", "STAFF"].includes(input.guestCategory))
        throw new Error("Complimentary booking requires an eligible guest category");
      total = 0;
      break;
    case "DISCOUNTED":
      total = money(gross - money(input.discountAmount ?? 0, "discount"), "discounted total");
      break;
    case "CUSTOM":
      if (input.customTotal === undefined) throw new Error("Custom total is required");
      total = money(input.customTotal, "custom total");
      break;
    case "FULL":
      total = gross;
      break;
    default:
      throw new Error("Unknown fare type");
  }
  const paid = money(input.paidAmount ?? 0, "paid amount");
  if (paid > total) throw new Error("Paid amount cannot exceed total");
  if (total === 0 && paid !== 0) throw new Error("Free bookings cannot have a payment");
  const balance = money(total - paid, "balance");
  return {
    grossAmount: gross,
    discountAmount: money(Math.max(0, gross - total), "discount"),
    totalAmount: total,
    paidAmount: paid,
    balanceAmount: balance,
    paymentStatus: total === 0 ? "FREE" : paid === 0 ? "UNPAID" : balance === 0 ? "PAID" : "PARTIAL",
    requiresPayment: total > 0 && balance > 0,
  };
}
