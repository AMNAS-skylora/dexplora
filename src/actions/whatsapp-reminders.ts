"use server";
import { getAdminSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";
export async function saveWhatsAppReminderRule(input: {
  tripBatchId: string; enabled: boolean; daysBeforeDeparture: number;
  templateName: string; languageCode: string;
}) {
  if (!(await getAdminSession())) return { error: "Unauthorized" };
  if (!input.tripBatchId || !Number.isInteger(input.daysBeforeDeparture) || input.daysBeforeDeparture < 0 ||
      input.daysBeforeDeparture > 365 || !/^[a-z0-9_]+$/.test(input.templateName) ||
      !/^[a-z]{2}(?:_[A-Z]{2})?$/.test(input.languageCode)) return { error: "Invalid reminder settings" };
  await getDb().collection("WhatsAppReminderRules").updateOne({ tripBatchId: input.tripBatchId },
    { $set: { ...input, updatedAt: new Date() } }, { upsert: true });
  revalidatePath("/admin/whatsapp");
  return { success: true };
}
