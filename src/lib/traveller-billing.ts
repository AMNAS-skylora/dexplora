/**
 * Per-traveller billing for new and historical Dexplora bookings.
 * Base fare is a snapshot taken at booking time, NOT the latest package rate.
 * Extra charges are independently chargeable and may be waived individually.
 */
export type TravellerBenefit = "STANDARD" | "FULL_FREE" | "PACKAGE_FREE" | "TICKET_FREE" | "CUSTOM";
export type ChargeCategory = "AC_UPGRADE" | "TICKET" | "VISA" | "ACCOMMODATION" | "TRANSPORT" | "OTHER";

export interface TravellerExtraCharge {
  id: string;
  category: ChargeCategory;
  description: string;
  amount: number;
  complimentary?: boolean;
}

export interface TravellerBillingRow {
  slot: number;
  name: string;
  benefit: TravellerBenefit;
  travelClass?: "SEATER" | "SLEEPER" | "AC" | "OTHER";
  baseFare: number;
  /** Part of the base package fare attributable to an included sleeper/other ticket. */
  includedTicketValue: number;
  /** Traveller's negotiated base package charge when benefit=CUSTOM. */
  customPackageAmount?: number | null;
  extras: TravellerExtraCharge[];
  reason?: string;
}

export interface BookingBillingInput {
  rows: TravellerBillingRow[];
  travellerCount: number;
  paidAmount: number;
}

const benefits: TravellerBenefit[] = ["STANDARD", "FULL_FREE", "PACKAGE_FREE", "TICKET_FREE", "CUSTOM"];
const categories: ChargeCategory[] = ["AC_UPGRADE", "TICKET", "VISA", "ACCOMMODATION", "TRANSPORT", "OTHER"];
const money = (n: number, name: string) => {
  if (!Number.isFinite(n) || n < 0 || n > 100000000) throw new Error(`Enter a valid non-negative ${name}.`);
  return Math.round((n + Number.EPSILON) * 100) / 100;
};

export function createInitialBillingRows(
  count: number,
  baseFare: number,
  names: string[] = [],
  initial?: {
    benefit?: TravellerBenefit;
    includedTicketValue?: number;
    customPackageAmount?: number | null;
    extras?: TravellerExtraCharge[];
    reason?: string;
  }
): TravellerBillingRow[] {
  if (!Number.isSafeInteger(count) || count < 1 || count > 200) throw new Error("Invalid traveller count.");
  const fare = money(baseFare, "base package fare");
  return Array.from({ length: count }, (_, index) => ({
    slot: index + 1,
    name: String(names[index] || `Traveller ${index + 1}`).trim(),
    benefit: initial?.benefit ?? "STANDARD",
    travelClass: "SLEEPER",
    baseFare: fare,
    includedTicketValue: initial?.includedTicketValue ?? 0,
    customPackageAmount: initial?.customPackageAmount ?? null,
    extras: (initial?.extras || []).map((extra, extraIndex) => ({
      ...extra, id: `t${index + 1}-${extra.id || extraIndex + 1}`,
    })),
    reason: initial?.reason || "",
  }));
}

export function getBookingBillingRows(booking: {
  id?: string;
  travellerCount?: number;
  unitPrice?: number | null;
  totalAmount?: number;
  customerName?: string;
  travellers?: Array<{ name?: string }>;
  billingRows?: TravellerBillingRow[];
}, defaultPackageFare = 0): TravellerBillingRow[] {
  const count = Math.max(1, Number(booking.travellerCount) || 1);
  if (Array.isArray(booking.billingRows) && booking.billingRows.length) {
    return booking.billingRows.map((row, i) => ({
      ...row, slot: i + 1, extras: Array.isArray(row.extras) ? row.extras : [],
    }));
  }
  const named = (Array.isArray(booking.travellers) ? booking.travellers : []).map((t) => String(t.name || ""));
  if (named.length < count) named.unshift(String(booking.customerName || "Traveller"));
  const snapshot = booking.unitPrice != null && Number(booking.unitPrice) > 0
    ? Number(booking.unitPrice) : (defaultPackageFare > 0 ? defaultPackageFare : Number(booking.totalAmount || 0) / count);
  const rows = createInitialBillingRows(count, snapshot, named);
  const previousTotal = Math.round(Number(booking.totalAmount || 0) * 100);
  const standardTotal = Math.round(snapshot * 100) * count;
  if (previousTotal === 0 && standardTotal > 0) {
    return rows.map(row => ({ ...row, benefit: "FULL_FREE" as TravellerBenefit, reason: "Legacy complimentary booking" }));
  }
  // Protect historic discounted totals when migrating a booking to the new editor.
  if (previousTotal !== standardTotal && previousTotal > 0) {
    const regularCents = Math.floor(previousTotal / count);
    return rows.map((row, index) => ({
      ...row,
      benefit: "CUSTOM" as TravellerBenefit,
      customPackageAmount: (index === count - 1
        ? previousTotal - regularCents * (count - 1) : regularCents) / 100,
    }));
  }
  return rows;
}

export function calculateBookingBilling(input: BookingBillingInput) {
  if (!Number.isSafeInteger(input.travellerCount) || input.travellerCount < 1 ||
      input.rows.length !== input.travellerCount) {
    throw new Error("Provide one billing row for each traveller.");
  }
  const paid = money(Number(input.paidAmount), "amount already paid");
  let packageListTotal = 0, packagePayable = 0, extrasListTotal = 0, extrasPayable = 0;
  const rows = input.rows.map((row, index) => {
    if (row.slot !== index + 1 || !benefits.includes(row.benefit))
      throw new Error(`Invalid billing settings for traveller ${index + 1}.`);
    const name = String(row.name || "").trim().slice(0, 120);
    if (!name) throw new Error(`Traveller ${index + 1} needs a name.`);
    const baseFare = money(Number(row.baseFare), "package fare");
    const ticketValue = money(Number(row.includedTicketValue || 0), "included ticket value");
    if (ticketValue > baseFare) throw new Error("Included ticket value cannot exceed package fare.");

    let payable = baseFare;
    switch (row.benefit) {
      case "FULL_FREE":
      case "PACKAGE_FREE":
        payable = 0; break;
      case "TICKET_FREE":
        if (ticketValue <= 0) throw new Error("Enter the included ticket value being waived for the free ticket.");
        payable = money(baseFare - ticketValue, "package less complimentary ticket"); break;
      case "CUSTOM":
        if (row.customPackageAmount == null) throw new Error("Enter the custom package charge.");
        payable = money(Number(row.customPackageAmount), "custom package charge"); break;
    }

    const extras = (row.extras || []).map((extra, extraIndex) => {
      const amount = money(Number(extra.amount), "additional charge");
      const description = String(extra.description || "").trim().slice(0, 160);
      if (!description) throw new Error("Describe every additional charge.");
      if (!categories.includes(extra.category)) throw new Error("Invalid charge category.");
      return {
        id: String(extra.id || `charge-${extraIndex + 1}`).slice(0, 100),
        category: extra.category,
        description,
        amount,
        complimentary: Boolean(extra.complimentary),
        charged: Boolean(extra.complimentary) || row.benefit === "FULL_FREE" ? 0 : amount,
      };
    });
    if (new Set(extras.map((item) => item.id)).size !== extras.length)
      throw new Error("Additional charge IDs must be unique per traveller.");

    const extraList = money(extras.reduce((sum, extra) => sum + extra.amount, 0), "extras total");
    const extraDue = money(extras.reduce((sum, extra) => sum + extra.charged, 0), "extras payable");
    packageListTotal += baseFare;
    packagePayable += payable;
    extrasListTotal += extraList;
    extrasPayable += extraDue;
    return {
      slot: index + 1, name, benefit: row.benefit,
      travelClass: ["SEATER", "SLEEPER", "AC", "OTHER"].includes(String(row.travelClass)) ? row.travelClass : "SLEEPER",
      baseFare, includedTicketValue: ticketValue,
      customPackageAmount: row.customPackageAmount ?? null,
      extras,
      reason: String(row.reason || "").trim().slice(0, 250),
      packagePayable: payable, extraPayable: extraDue,
      totalPayable: money(payable + extraDue, "traveller total"),
    };
  });
  const totalAmount = money(packagePayable + extrasPayable, "booking total");
  const balanceAmount = money(Math.max(0, totalAmount - paid), "outstanding balance");
  const creditAmount = money(Math.max(0, paid - totalAmount), "refundable credit");
  return {
    rows,
    packageListTotal: money(packageListTotal, "list price"),
    packagePayable: money(packagePayable, "package payable"),
    extrasListTotal: money(extrasListTotal, "additional charges"),
    extrasPayable: money(extrasPayable, "additional payable"),
    discountAmount: money(Math.max(0, packageListTotal + extrasListTotal - totalAmount), "complimentary discount"),
    totalAmount, paidAmount: paid, balanceAmount, creditAmount,
    paymentStatus: totalAmount === 0 && paid === 0 ? "Free" :
      paid >= totalAmount ? "Paid" : paid > 0 ? "Partially Paid" : "Pending",
  };
}
