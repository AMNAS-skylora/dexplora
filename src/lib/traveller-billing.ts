/**
 * Dexplora traveller billing: one event package price (which may include sleeper travel),
 * optional package waiver, and individually described extras (AC upgrade, visa, ticket, etc).
 * Extras are NOT automatically waived when the package is complimentary.
 */
export interface BookingExtraCharge {
  id: string;
  description: string;
  amount: number;
  category?: "AC_UPGRADE" | "TICKET" | "VISA" | "OTHER";
}
export interface TravellerBillInput {
  eventPackagePrice: number;
  packageComplimentary: boolean;
  packagePriceOverride?: number;
  extraCharges: BookingExtraCharge[];
  payments: { id: string; amount: number; note?: string }[];
}
const money = (n: number, field: string) => {
  if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid ${field}`);
  return Math.round((n + Number.EPSILON) * 100) / 100;
};
export function calculateTravellerBill(input: TravellerBillInput) {
  const listPrice = money(input.eventPackagePrice, "event package price");
  const packageAmount = input.packageComplimentary ? 0 :
    input.packagePriceOverride === undefined ? listPrice : money(input.packagePriceOverride, "package override");
  const extras = input.extraCharges.map(extra => ({
    ...extra,
    description: extra.description.trim(),
    amount: money(extra.amount, "extra charge"),
  }));
  if (extras.some(extra => !extra.id || !extra.description)) throw new Error("Extra charge requires an id and description");
  if (new Set(extras.map(extra => extra.id)).size !== extras.length) throw new Error("Duplicate extra charge id");
  const extraTotal = money(extras.reduce((sum, item) => sum + item.amount, 0), "extras total");
  const total = money(packageAmount + extraTotal, "total");
  const paid = money(input.payments.reduce((sum, p) => sum + money(p.amount, "payment"), 0), "paid");
  if (paid > total) throw new Error("Payments exceed booking total; record a refund or credit adjustment");
  return {
    listPrice, packageAmount, packageDiscount: money(listPrice - Math.min(listPrice, packageAmount), "discount"),
    extras, extraTotal, totalAmount: total, paidAmount: paid,
    balanceAmount: money(total - paid, "balance"),
    paymentStatus: total === 0 ? "FREE" : paid === 0 ? "UNPAID" : paid === total ? "PAID" : "PARTIAL",
  };
}
