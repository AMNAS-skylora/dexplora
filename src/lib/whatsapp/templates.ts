export type WhatsAppTemplateKind = "BOOKING_CONFIRMATION" | "BALANCE_REMINDER" | "PAYMENT_RECEIPT" | "TRIP_ALERT" | "TRAVEL_DETAILS";
export interface MessageRecipient { bookingId: string; name: string; phone: string; optedIn: boolean; balanceAmount: number; bookingRef: string; tripName: string; }
export interface BroadcastDraft { tripBatchId: string; kind: WhatsAppTemplateKind; templateName: string; languageCode: string; bodyParameters: string[]; onlyPendingBalance?: boolean; }
export function eligibleRecipients(recipients: MessageRecipient[], onlyPendingBalance = false) {
  const seen = new Set<string>();
  return recipients.filter(r => {
    const phone = r.phone.replace(/[^\d]/g, "");
    if (!r.optedIn || !/^\d{10,15}$/.test(phone) || (onlyPendingBalance && r.balanceAmount <= 0) || seen.has(phone)) return false;
    seen.add(phone); return true;
  });
}
export function renderPreview(template: string, variables: Record<string,string>) {
  return template.replace(/\{(name|trip|booking_ref|balance|date)\}/g, (_, key: string) => variables[key] ?? "");
}
