export type DexploraEmailKind = "BOOKING_CONFIRMATION" | "PAYMENT_RECEIPT" | "BALANCE_REMINDER" | "TRIP_ALERT" | "TRAVEL_DETAILS";
export interface EmailDetails {
  name: string; email: string; bookingRef: string; tripName: string;
  departureDate?: string; totalAmount?: number; paidAmount?: number; balanceAmount?: number;
  announcement?: string;
}
const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] || c));
const money = (n?: number) => "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const titles: Record<DexploraEmailKind,string> = {
  BOOKING_CONFIRMATION: "Your booking is confirmed",
  PAYMENT_RECEIPT: "Payment received — thank you",
  BALANCE_REMINDER: "Friendly payment reminder",
  TRIP_ALERT: "Important update about your trip",
  TRAVEL_DETAILS: "Your upcoming travel details",
};
export function buildDexploraEmail(kind: DexploraEmailKind, data: EmailDetails, siteUrl: string) {
  const title = titles[kind];
  const logo = new URL("/images/logo/logoblack.png", siteUrl).toString();
  const showAmounts = kind === "BOOKING_CONFIRMATION" || kind === "PAYMENT_RECEIPT" || kind === "BALANCE_REMINDER";
  const announcement = data.announcement?.trim() || "";
  const content = `<p style="margin:0 0 18px">Hello <strong>${escape(data.name)}</strong>,</p>
    <p style="margin:0 0 22px">${kind === "BOOKING_CONFIRMATION" ? "We are delighted to confirm your booking." :
      kind === "PAYMENT_RECEIPT" ? "We have received your payment. Here is your updated booking summary." :
      kind === "BALANCE_REMINDER" ? "This is a friendly reminder about the outstanding balance for your trip." :
      kind === "TRIP_ALERT" ? "Please review this important update from our travel team." :
      "Here are the latest details for your upcoming journey."}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f6fa;border-radius:16px">
      <tr><td style="padding:22px">
      <div style="font-size:12px;color:#697386;text-transform:uppercase;letter-spacing:1px">Booking reference</div>
      <div style="font-size:19px;font-weight:700;margin:5px 0 18px">${escape(data.bookingRef)}</div>
      <div style="font-size:12px;color:#697386;text-transform:uppercase;letter-spacing:1px">Trip</div>
      <div style="font-size:17px;font-weight:700;margin-top:5px">${escape(data.tripName)}</div>
      ${data.departureDate ? `<div style="margin-top:12px;color:#536174">Departure: ${escape(data.departureDate)}</div>` : ""}
      </td></tr></table>
    ${showAmounts ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-collapse:collapse">
      <tr><td style="padding:10px 0;border-bottom:1px solid #edf0f5">Total</td><td align="right" style="border-bottom:1px solid #edf0f5">${money(data.totalAmount)}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #edf0f5">Paid</td><td align="right" style="border-bottom:1px solid #edf0f5">${money(data.paidAmount)}</td></tr>
      <tr><td style="padding:14px 0;font-weight:700">Balance due</td><td align="right" style="font-weight:700;color:#1769e0">${money(data.balanceAmount)}</td></tr>
    </table>` : ""}
    ${announcement ? `<div style="margin-top:20px;padding:18px;background:#fff8e7;border-left:4px solid #e8a529;border-radius:8px;white-space:pre-line">${escape(announcement)}</div>` : ""}
    <p style="margin:26px 0 0;color:#667085;font-size:13px">Questions? Reply to this email to contact the Dexplora team.</p>`;
  const html = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
  @media(max-width:600px){.mail-card{width:100%!important}.mail-padding{padding:24px!important}}
  @media(prefers-reduced-motion:no-preference){.mail-card{animation:appear .6s ease-out}@keyframes appear{from{opacity:.4}to{opacity:1}}}
  </style></head><body style="margin:0;padding:32px 12px;background:#f0f3f8;font-family:Arial,Helvetica,sans-serif;color:#121a2b">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center">
  <table role="presentation" class="mail-card" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:22px;overflow:hidden">
  <tr><td class="mail-padding" style="padding:28px 38px;background:#ffffff;border-bottom:1px solid #eef0f4"><img src="${escape(logo)}" alt="Dexplora" width="145" style="max-width:145px;height:auto;display:block"></td></tr>
  <tr><td class="mail-padding" style="padding:36px 38px"><div style="font-size:12px;font-weight:700;letter-spacing:2px;color:#1769e0;text-transform:uppercase">DEXPLORA TOUR PLANNERS</div>
  <h1 style="font-size:28px;line-height:1.2;margin:12px 0 24px;color:#101828">${escape(title)}</h1>
  <div style="font-size:15px;line-height:1.75;color:#344054">${content}</div></td></tr>
  <tr><td style="padding:22px 38px;background:#101828;color:#ffffff;font-size:12px;text-align:center">Dexplora Tour Planners · Travel with confidence</td></tr>
  </table></td></tr></table></body></html>`;
  return { subject: `Dexplora | ${title} | ${data.bookingRef}`, html, text: `${title}\nHello ${data.name},\nTrip: ${data.tripName}\nBooking: ${data.bookingRef}\n${showAmounts ? `Total: ${money(data.totalAmount)}; Paid: ${money(data.paidAmount)}; Balance: ${money(data.balanceAmount)}\n` : ""}${announcement}\nDexplora Tour Planners` };
}
