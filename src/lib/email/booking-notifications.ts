import "server-only";

import { getDb } from "@/lib/db";
import { buildDexploraEmail, type DexploraEmailKind } from "@/lib/email/templates";
import { isGmailSmtpConfigured, sendGmailEmail } from "@/lib/email/smtp";

type BookingForEmail = {
  id: string;
  bookingRef?: string | null;
  customerName?: string | null;
  email?: string | null;
  emailOptOut?: boolean | null;
  totalAmount?: number | null;
  paidAmount?: number | null;
  balanceAmount?: number | null;
};
type BatchForEmail = {
  id: string;
  batchName?: string | null;
  startDate?: string | Date | null;
  package?: { title?: string | null } | null;
};

export async function notifyBookingEvent(
  kind: "BOOKING_CONFIRMATION" | "PAYMENT_RECEIPT",
  booking: BookingForEmail,
  batch: BatchForEmail,
  eventId: string
): Promise<"DISABLED" | "SKIPPED" | "ACCEPTED" | "FAILED"> {
  // No customer emails are sent until an administrator explicitly enables the feature.
  if (process.env.EMAIL_AUTOMATION_ENABLED !== "true" || !isGmailSmtpConfigured()) return "DISABLED";
  const email = String(booking.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || booking.emailOptOut === true) return "SKIPPED";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl || !/^https:\/\//i.test(siteUrl)) return "SKIPPED";

  const id = ["booking-email", kind, booking.id, eventId].join(":");
  const col = getDb().collection<{ _id: string; status: string; [key: string]: unknown }>("EmailDeliveryLogs");
  try {
    const previous = await col.findOne({ _id: id });
    if (previous && (previous.status === "SMTP_ACCEPTED" || previous.status === "SENDING")) {
      return "SKIPPED";
    }
    const claimed = await col.findOneAndUpdate(
      { _id: id, status: { $nin: ["SMTP_ACCEPTED", "SENDING"] } },
      { $set: { status: "SENDING", updatedAt: new Date() }, $setOnInsert: {
        kind, bookingId: booking.id, tripBatchId: batch.id, recipient: email, createdAt: new Date(),
      } },
      { upsert: true, returnDocument: "after" }
    ).catch(() => null);
    if (!claimed) return "SKIPPED";

    const message = buildDexploraEmail(kind as DexploraEmailKind, {
      name: booking.customerName || "Traveller",
      email,
      bookingRef: booking.bookingRef || String(booking.id),
      tripName: batch.batchName || batch.package?.title || "Dexplora Trip",
      departureDate: batch.startDate ? new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium", timeZone: "Asia/Kolkata",
      }).format(new Date(batch.startDate)) : undefined,
      totalAmount: Number(booking.totalAmount || 0),
      paidAmount: Number(booking.paidAmount || 0),
      balanceAmount: Number(booking.balanceAmount || 0),
    }, siteUrl);

    const result = await sendGmailEmail({ to: email, ...message });
    await col.updateOne({ _id: id }, { $set: {
      status: "SMTP_ACCEPTED", smtpId: result.id, updatedAt: new Date(),
    } });
    return "ACCEPTED";
  } catch (error) {
    console.error("Booking email notification failed", error instanceof Error ? error.message : "Unknown error");
    await col.updateOne({ _id: id }, { $set: {
      status: "FAILED", updatedAt: new Date(),
    } }, { upsert: true }).catch(() => undefined);
    return "FAILED";
  }
}
