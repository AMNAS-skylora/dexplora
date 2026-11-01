import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getDb } from "@/lib/db";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!token || url.searchParams.get("hub.mode") !== "subscribe" ||
      url.searchParams.get("hub.verify_token") !== token) return new NextResponse("Forbidden", { status: 403 });
  return new NextResponse(url.searchParams.get("hub.challenge") || "", { status: 200 });
}
export async function POST(req: NextRequest) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  const raw = await req.text();
  const signature = req.headers.get("x-hub-signature-256");
  const expected = "sha256=" + createHmac("sha256", secret).update(raw).digest("hex");
  if (!signature || signature.length !== expected.length ||
      !timingSafeEqual(Buffer.from(signature), Buffer.from(expected)))
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  let payload: any;
  try { payload = JSON.parse(raw); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const entries = Array.isArray(payload.entry) ? payload.entry : [];
  const collection = getDb().collection("WhatsAppCampaignLogs");
  for (const entry of entries) for (const change of entry.changes || []) {
    for (const status of change.value?.statuses || []) {
      if (!status.id || !["sent","delivered","read","failed"].includes(status.status)) continue;
      await collection.updateOne({ providerMessageId: status.id },
        { $set: { status: status.status.toUpperCase(), statusUpdatedAt: new Date(),
          providerErrorCode: status.errors?.[0]?.code || null } });
    }
  }
  return NextResponse.json({ received: true });
}
