import { NextRequest, NextResponse } from "next/server";
import {
  extractWhatsAppMessages,
  extractWhatsAppStatuses,
  getAutoReplyForAction,
  getWhatsAppButtonActionId,
  sendWhatsAppText,
} from "@/lib/whatsapp-cloud";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token &&
    token === process.env.WHATSAPP_VERIFY_TOKEN &&
    challenge
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json(
    { success: false, error: "Invalid WhatsApp verify token" },
    { status: 403 }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { success: false, error: "Invalid webhook JSON body" },
      { status: 400 }
    );
  }

  const messages = extractWhatsAppMessages(body);
  const statuses = extractWhatsAppStatuses(body);
  const autoReplyEnabled = process.env.WHATSAPP_AUTO_REPLY_ENABLED !== "false";

  const handledMessages = [];

  for (const message of messages) {
    const actionId = getWhatsAppButtonActionId(message);
    const from = message.from;

    if (!actionId || !from) {
      handledMessages.push({
        from,
        type: message.type,
        actionId: null,
        autoReplySent: false,
      });
      continue;
    }

    const autoReply = getAutoReplyForAction(actionId);
    let replyResult = null;

    if (autoReply && autoReplyEnabled) {
      replyResult = await sendWhatsAppText(from, autoReply);
    }

    handledMessages.push({
      from,
      type: message.type,
      actionId,
      autoReplySent: Boolean(autoReply && autoReplyEnabled),
      replyResult,
    });
  }

  if (messages.length > 0 || statuses.length > 0) {
    console.log("WhatsApp webhook received", {
      messages: handledMessages,
      statuses: statuses.map((status: any) => ({
        id: status.id,
        status: status.status,
        recipientId: status.recipient_id,
        timestamp: status.timestamp,
      })),
    });
  }

  return NextResponse.json({
    success: true,
    messages: handledMessages,
    statusesCount: statuses.length,
  });
}
