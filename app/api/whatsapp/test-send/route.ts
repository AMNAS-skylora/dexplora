import { NextRequest, NextResponse } from "next/server";
import {
  isAuthorizedWhatsAppTestRequest,
  sendWhatsAppText,
} from "@/lib/whatsapp-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!isAuthorizedWhatsAppTestRequest(request)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized WhatsApp test request" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const to = body?.to;
  const message = body?.message || "Test message from Dexplora WhatsApp automation.";

  if (!to || typeof to !== "string") {
    return NextResponse.json(
      { success: false, error: "Missing required 'to' WhatsApp number" },
      { status: 400 }
    );
  }

  const result = await sendWhatsAppText(to, message);
  const status = result.success ? 200 : 500;

  return NextResponse.json(result, { status });
}
