import "server-only";
import { getDb } from "@/lib/db";
import { sendWhatsAppTemplate } from "@/lib/whatsapp/cloud-api";
export interface BalanceReminderRule {
  tripBatchId: string;
  enabled: boolean;
  templateName: string;
  languageCode: string;
  daysBeforeDeparture: number;
}
export async function runBalanceReminders(now = new Date()) {
  const database = getDb();
  const rules = await database.collection<BalanceReminderRule>("WhatsAppReminderRules").find({ enabled: true }).toArray();
  const dateInIndia = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const today = dateInIndia(now);
  let sent = 0, failed = 0, skipped = 0;
  for (const rule of rules) {
    if (!Number.isInteger(rule.daysBeforeDeparture) || rule.daysBeforeDeparture < 0 || rule.daysBeforeDeparture > 365 ||
        !/^[a-z0-9_]+$/.test(rule.templateName)) { skipped++; continue; }
    const batch = await database.collection("TripBatch").findOne({ id: rule.tripBatchId });
    // Legacy data may use Mongo ObjectId instead of a string id.
    const { ObjectId } = await import("mongodb");
    const trip = batch || (ObjectId.isValid(rule.tripBatchId) ?
      await database.collection("TripBatch").findOne({ _id: new ObjectId(rule.tripBatchId) }) : null);
    if (!trip?.startDate) { skipped++; continue; }
    const departure = new Date(trip.startDate);
    if (!Number.isFinite(departure.getTime())) { skipped++; continue; }
    const [year, month, day] = dateInIndia(departure).split("-").map(Number);
    const due = new Date(Date.UTC(year, month - 1, day - rule.daysBeforeDeparture)).toISOString().slice(0, 10);
    if (due !== today) continue;
    const bookings = await database.collection("Booking").find({ tripBatchId: rule.tripBatchId,
      whatsappOptIn: true, balanceAmount: { $gt: 0 } }).toArray();
    for (const booking of bookings) {
      const phone = String(booking.whatsappNumber || booking.phone || "").replace(/\D/g, "");
      if (!/^\d{10,15}$/.test(phone)) { skipped++; continue; }
      const key = `balance:${rule.tripBatchId}:${booking._id}:${due}`;
      const logs = database.collection("WhatsAppCampaignLogs");
      const claim = await logs.updateOne({ idempotencyKey: key },
        { $setOnInsert: { idempotencyKey: key, bookingId: String(booking._id), tripBatchId: rule.tripBatchId,
          kind: "BALANCE_REMINDER", status: "CLAIMED", createdAt: new Date() } }, { upsert: true });
      if (!claim.upsertedCount) { skipped++; continue; }
      try {
        const result = await sendWhatsAppTemplate({ to: phone, templateName: rule.templateName,
          languageCode: rule.languageCode || "en",
          bodyParameters: [String(booking.customerName || "Traveller"), String(trip.batchName || "Trip"),
            String(booking.bookingRef || ""), Number(booking.balanceAmount).toFixed(2)] });
        await logs.updateOne({ idempotencyKey: key }, { $set: { status: "SENT", providerMessageId: result.messages?.[0]?.id || null } });
        sent++;
      } catch (e: any) {
        await logs.updateOne({ idempotencyKey: key }, { $set: { status: "FAILED", error: String(e.message).slice(0, 300) } });
        failed++;
      }
    }
  }
  return { sent, failed, skipped };
}
