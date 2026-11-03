"use server";
import { getAdminSession } from "@/lib/auth";
import { db, getDb } from "@/lib/db";
import { buildDexploraEmail, type DexploraEmailKind } from "@/lib/email/templates";
import { sendGmailEmail, isGmailSmtpConfigured } from "@/lib/email/smtp";
export async function sendTripEmailCampaign(input: { tripBatchId: string; kind: DexploraEmailKind; announcement?: string; pendingOnly?: boolean; confirmed: boolean }) {
  if (!(await getAdminSession())) return { error: "Unauthorized" };
  if (!isGmailSmtpConfigured()) return { error: "Configure SMTP_USER and SMTP_APP_PASSWORD in Vercel." };
  const allowed = ["BOOKING_CONFIRMATION","PAYMENT_RECEIPT","BALANCE_REMINDER","TRIP_ALERT","TRAVEL_DETAILS"];
  if (!allowed.includes(input.kind) || !input.confirmed) return { error: "Confirm the campaign and message type" };
  if (input.kind === "TRIP_ALERT" && !input.announcement?.trim()) return { error: "Announcement is required" };
  const trip = await db.tripBatch.findUnique({ where: { id: input.tripBatchId }, include: { package: true } });
  if (!trip) return { error: "Trip not found" };
  const bookings = await db.booking.findMany({ where: { tripBatchId: input.tripBatchId } });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl || !/^https:\/\//i.test(siteUrl)) return { error: "Set NEXT_PUBLIC_SITE_URL to your HTTPS website address." };
  const campaignId = crypto.randomUUID();
  const unique = new Set<string>();
  let sent = 0, failed = 0, skipped = 0;
  for (const b of bookings) {
    const email = String(b.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || b.emailOptOut === true ||
        (input.pendingOnly && Number(b.balanceAmount || 0) <= 0) || unique.has(email)) { skipped++; continue; }
    unique.add(email);
    const message = buildDexploraEmail(input.kind, { name: b.customerName || "Traveller", email,
      bookingRef: b.bookingRef || String(b.id), tripName: trip.batchName || trip.package?.title || "Dexplora Trip",
      totalAmount: Number(b.totalAmount || 0), paidAmount: Number(b.paidAmount || 0),
      balanceAmount: Number(b.balanceAmount || 0), announcement: input.announcement }, siteUrl);
    try {
      const response = await sendGmailEmail({ to: email, ...message });
      await getDb().collection("EmailCampaignLogs").insertOne({ campaignId, bookingId: b.id, tripBatchId: input.tripBatchId,
        kind: input.kind, email, providerId: response.id, status: "SENT", createdAt: new Date() });
      sent++;
    } catch (e: any) {
      await getDb().collection("EmailCampaignLogs").insertOne({ campaignId, bookingId: b.id, tripBatchId: input.tripBatchId,
        kind: input.kind, email, status: "FAILED", error: String(e.message).slice(0,300), createdAt: new Date() });
      failed++;
    }
    if (sent + failed >= 100) break;
  }
  return { success: true, campaignId, sent, failed, skipped };
}
