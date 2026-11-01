import { NextRequest, NextResponse } from "next/server";
import { runBalanceReminders } from "@/lib/whatsapp/automation";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (process.env.WHATSAPP_AUTOMATION_ENABLED !== "true")
    return NextResponse.json({ enabled: false, message: "Automation disabled" });
  try { return NextResponse.json(await runBalanceReminders()); }
  catch (e: any) { return NextResponse.json({ error: e.message || "Cron failed" }, { status: 500 }); }
}
