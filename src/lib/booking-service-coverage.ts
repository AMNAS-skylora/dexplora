export type ServiceKind = "PACKAGE" | "TRAIN_TICKET" | "BUS_TICKET" | "FLIGHT_TICKET" | "ACCOMMODATION" | "FOOD" | "LOCAL_TRANSPORT" | "OTHER";
export type Coverage = "TRAVELLER_PAYS" | "DEXPLORA_PAYS" | "SPONSOR_PAYS" | "SPLIT" | "NOT_INCLUDED";
export type TravelClass = "SEATER" | "SLEEPER" | "AC" | "OTHER";

export interface BookingService {
  id: string;
  kind: ServiceKind;
  label: string;
  coverage: Coverage;
  travelClass?: TravelClass;
  /** Actual supplier cost: used for operating expense, never inferred from sale price. */
  supplierCost: number;
  /** Amount charged to traveller, independent of supplier cost. */
  salePrice: number;
  travellerShare?: number;
  dexploraShare?: number;
  sponsorShare?: number;
  ticketStatus?: "NOT_BOOKED" | "BOOKED" | "WAITLISTED" | "CONFIRMED" | "CANCELLED" | "REFUNDED";
  pnr?: string;
  coach?: string;
  seat?: string;
  notes?: string;
}

function cash(value: number, field: string) {
  if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid ${field}`);
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateServiceCoverage(service: BookingService) {
  const supplierCost = cash(service.supplierCost, "supplier cost");
  const salePrice = cash(service.salePrice, "sale price");
  let travellerPayable = 0;
  let dexploraSubsidy = 0;
  let sponsorContribution = 0;
  if (service.coverage === "NOT_INCLUDED") {
    if (supplierCost !== 0 || salePrice !== 0) throw new Error("Excluded services must have zero cost and price");
  } else if (service.coverage === "TRAVELLER_PAYS") {
    travellerPayable = salePrice;
  } else if (service.coverage === "DEXPLORA_PAYS") {
    dexploraSubsidy = salePrice;
  } else if (service.coverage === "SPONSOR_PAYS") {
    sponsorContribution = salePrice;
  } else if (service.coverage === "SPLIT") {
    travellerPayable = cash(service.travellerShare ?? 0, "traveller share");
    dexploraSubsidy = cash(service.dexploraShare ?? 0, "Dexplora share");
    sponsorContribution = cash(service.sponsorShare ?? 0, "sponsor share");
    if (Math.abs(travellerPayable + dexploraSubsidy + sponsorContribution - salePrice) > 0.009)
      throw new Error("Service shares must equal the service sale price");
  } else {
    throw new Error("Unknown coverage");
  }
  return { supplierCost, salePrice, travellerPayable, dexploraSubsidy, sponsorContribution,
    grossMarginBeforeSubsidy: cash(Math.max(0, salePrice - supplierCost), "gross margin") };
}

/** Apply to both existing and new travellers; missing legacy services remain unchanged. */
export function summarizeBookingServices(services: BookingService[], paidAmount = 0) {
  const paid = cash(paidAmount, "paid amount");
  const totals = services.reduce((acc, service) => {
    const line = calculateServiceCoverage(service);
    acc.travellerPayable += line.travellerPayable;
    acc.supplierCosts += line.supplierCost;
    acc.dexploraSubsidies += line.dexploraSubsidy;
    acc.sponsorContributions += line.sponsorContribution;
    return acc;
  }, { travellerPayable: 0, supplierCosts: 0, dexploraSubsidies: 0, sponsorContributions: 0 });
  for (const key of Object.keys(totals) as (keyof typeof totals)[]) totals[key] = cash(totals[key], key);
  if (paid > totals.travellerPayable) throw new Error("Payment exceeds traveller payable");
  return { ...totals, paidAmount: paid, balanceDue: cash(totals.travellerPayable - paid, "balance"),
    paymentStatus: totals.travellerPayable === 0 ? "FREE" : paid === 0 ? "UNPAID" :
      paid === totals.travellerPayable ? "PAID" : "PARTIAL" };
}
