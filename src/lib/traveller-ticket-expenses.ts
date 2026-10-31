export type TicketMode = "TRAIN" | "BUS" | "FLIGHT" | "OTHER";
export type TicketStatus = "NOT_BOOKED" | "BOOKED" | "WAITLISTED" | "CONFIRMED" | "CANCELLED" | "REFUNDED";
export type TicketPayer = "DEXPLORA" | "TRAVELLER" | "SPONSOR";
export type TicketClass = "SEATER" | "SLEEPER" | "AC" | "OTHER";

export interface TravellerTicket {
  bookingId: string;
  tripBatchId: string;
  mode: TicketMode;
  travelClass: TicketClass;
  status: TicketStatus;
  payer: TicketPayer;
  ticketCost: number;
  bookingFee: number;
  refundAmount: number;
  pnr?: string;
  trainNumber?: string;
  coach?: string;
  seatNumber?: string;
  notes?: string;
}

const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
function amount(n: number, label: string) {
  if (!Number.isFinite(n) || n < 0) throw new Error(`Invalid ${label}`);
  return round(n);
}

/** Ticket cost is an operating expense, not the traveller's trip fee. */
export function calculateTicketExpense(ticket: TravellerTicket) {
  if (!ticket.bookingId || !ticket.tripBatchId) throw new Error("Booking and trip are required");
  const ticketCost = amount(ticket.ticketCost, "ticket cost");
  const bookingFee = amount(ticket.bookingFee, "booking fee");
  const refundAmount = amount(ticket.refundAmount, "refund");
  const gross = round(ticketCost + bookingFee);
  if (refundAmount > gross) throw new Error("Refund cannot exceed ticket cost and fees");
  if (ticket.status === "NOT_BOOKED" && (gross !== 0 || refundAmount !== 0))
    throw new Error("Unbooked tickets cannot have expenses");
  const netCost = round(gross - refundAmount);
  return {
    grossCost: gross,
    refundAmount,
    netCost,
    dexploraExpense: ticket.payer === "DEXPLORA" ? netCost : 0,
    travellerExpense: ticket.payer === "TRAVELLER" ? netCost : 0,
    sponsorExpense: ticket.payer === "SPONSOR" ? netCost : 0,
  };
}

export function summarizeTripTickets(tickets: TravellerTicket[]) {
  return tickets.reduce((summary, ticket) => {
    const expense = calculateTicketExpense(ticket);
    summary.ticketCount++;
    summary.dexploraExpense = round(summary.dexploraExpense + expense.dexploraExpense);
    summary.travellerExpense = round(summary.travellerExpense + expense.travellerExpense);
    summary.sponsorExpense = round(summary.sponsorExpense + expense.sponsorExpense);
    summary.refunds = round(summary.refunds + expense.refundAmount);
    return summary;
  }, { ticketCount: 0, dexploraExpense: 0, travellerExpense: 0, sponsorExpense: 0, refunds: 0 });
}
