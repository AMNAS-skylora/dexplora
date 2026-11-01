"use server";
import { getAdminSession } from "@/lib/auth";
import { db, getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { eligibleRecipients } from "@/lib/whatsapp/templates";
import { sendWhatsAppTemplate } from "@/lib/whatsapp/cloud-api";
type CampaignInput = { tripBatchId: string; templateName: string; languageCode: string; kind: "BALANCE_REMINDER" | "BOOKING_CONFIRMATION" | "TRIP_ALERT" | "TRAVEL_DETAILS"; onlyPendingBalance: boolean; };
async function requireAdmin() { if (!(await getAdminSession())) throw new Error("Unauthorized"); }
export async function getWhatsAppTrips() {
  await requireAdmin();
  const batches = await db.tripBatch.findMany({ include: { package: true } });
  return batches.map((b: any) => ({ id: b.id, title: b.batchName || b.package?.title || "Trip", startDate: String(b.startDate || "") }));
}
export async function getWhatsAppAudience(tripBatchId: string, pendingOnly = false) {
  await requireAdmin();
  const bookings = await db.booking.findMany({ where: { tripBatchId } });
  const recipients = bookings.map((b: any) => ({
    bookingId: b.id, name: b.customerName || b.name || "Traveller",
    phone: String(b.whatsappNumber || b.phone || "").replace(/\D/g,""),
    optedIn: b.whatsappOptIn === true, balanceAmount: Number(b.balanceAmount) || 0,
    bookingRef: b.bookingRef || "", tripName: "",
  }));
  return { total: bookings.length, eligible: eligibleRecipients(recipients, pendingOnly).length,
    missingConsent: recipients.filter((r: any) => !r.optedIn).length };
}
export async function sendWhatsAppCampaign(input: CampaignInput, confirmed: boolean) {
  await requireAdmin();
  if (!confirmed) return { error: "Confirm the recipients and message before sending." };
  if (!/^[a-z0-9_]+$/.test(input.templateName) || !/^[a-z]{2}(?:_[A-Z]{2})?$/.test(input.languageCode))
    return { error: "Use an approved template name and valid language code." };
  if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID)
    return { error: "Add WhatsApp API credentials to server environment variables first." };
  const batch = await db.tripBatch.findUnique({ where: { id: input.tripBatchId } });
  if (!batch) return { error: "Trip not found" };
  const bookings = await db.booking.findMany({ where: { tripBatchId: input.tripBatchId } });
  const recipients = eligibleRecipients(bookings.map((b: any) => ({
    bookingId: b.id, name: b.customerName || b.name || "Traveller",
    phone: String(b.whatsappNumber || b.phone || "").replace(/\D/g,""),
    optedIn: b.whatsappOptIn === true, balanceAmount: Number(b.balanceAmount) || 0,
    bookingRef: b.bookingRef || "", tripName: batch.batchName || "Dexplora Trip",
  })), input.onlyPendingBalance);
  if (recipients.length === 0) return { error: "No opted-in recipients match this selection." };
  if (recipients.length > 100) return { error: "Maximum 100 recipients per batch. Split the campaign." };
  const collection = getDb().collection("WhatsAppCampaignLogs");
  const campaignId = crypto.randomUUID();
  let sent = 0, failed = 0;
  for (const r of recipients) {
    const params = input.kind === "BALANCE_REMINDER"
      ? [r.name, r.tripName, r.bookingRef, r.balanceAmount.toFixed(2)]
      : [r.name, r.tripName, r.bookingRef];
    try {
      const result = await sendWhatsAppTemplate({ to: r.phone, templateName: input.templateName,
        languageCode: input.languageCode, bodyParameters: params });
      await collection.insertOne({ campaignId, tripBatchId: input.tripBatchId, bookingId: r.bookingId,
        kind: input.kind, status: "SENT", providerMessageId: result.messages?.[0]?.id || null, createdAt: new Date() });
      sent++;
    } catch (e: any) {
      await collection.insertOne({ campaignId, tripBatchId: input.tripBatchId, bookingId: r.bookingId,
        kind: input.kind, status: "FAILED", error: String(e.message).slice(0,300), createdAt: new Date() });
      failed++;
    }
  }
  revalidatePath("/admin/whatsapp");
  return { success: true, sent, failed, campaignId };
}
