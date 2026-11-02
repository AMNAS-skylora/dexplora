import { NextRequest, NextResponse } from "next/server";
import {
  isAuthorizedWhatsAppTestRequest,
  sendWhatsAppReplyButtons,
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
  const question = body?.question || "Dubai package confirm ആണോ?";
  const bookingId = body?.bookingId || "TEST_123";

  if (!to || typeof to !== "string") {
    return NextResponse.json(
      { success: false, error: "Missing required 'to' WhatsApp number" },
      { status: 400 }
    );
  }

  const result = await sendWhatsAppReplyButtons({
    to,
    body: question,
    buttons: [
      {
        id: `TRAVEL_CONFIRM_OK_BOOKING_${bookingId}`,
        title: "OK",
      },
      {
        id: `TRAVEL_CONFIRM_NO_BOOKING_${bookingId}`,
        title: "No",
      },
    ],
  });

  const status = result.success ? 200 : 500;

  return NextResponse.json(result, { status });
}
