export type WhatsAppButton = {
  id: string;
  title: string;
};

export type WhatsAppCloudResponse =
  | { success: true; data: unknown }
  | { success: false; error: string; details?: unknown };

type WhatsAppConfig = {
  accessToken: string;
  phoneNumberId: string;
  graphVersion: string;
};

type WhatsAppWebhookMessage = {
  from?: string;
  id?: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string; payload?: string };
  interactive?: {
    type?: string;
    button_reply?: { id?: string; title?: string };
    list_reply?: { id?: string; title?: string };
  };
};

export function getWhatsAppConfig(): WhatsAppConfig {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN;
  const phoneNumberId =
    process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.PHONE_NUMBER_ID;
  const graphVersion = process.env.WHATSAPP_GRAPH_VERSION || "v24.0";

  if (!accessToken) {
    throw new Error("Missing WHATSAPP_ACCESS_TOKEN env value");
  }

  if (!phoneNumberId) {
    throw new Error("Missing WHATSAPP_PHONE_NUMBER_ID env value");
  }

  return { accessToken, phoneNumberId, graphVersion };
}

export function normalizeWhatsappNumber(value: string) {
  return value.replace(/\D/g, "");
}

async function sendWhatsAppPayload(payload: Record<string, unknown>): Promise<WhatsAppCloudResponse> {
  try {
    const { accessToken, phoneNumberId, graphVersion } = getWhatsAppConfig();

    const response = await fetch(
      `https://graph.facebook.com/${graphVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          ...payload,
        }),
      }
    );

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        error: "WhatsApp Cloud API request failed",
        details: data,
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown WhatsApp error",
    };
  }
}

export async function sendWhatsAppText(to: string, body: string) {
  const phone = normalizeWhatsappNumber(to);

  return sendWhatsAppPayload({
    to: phone,
    type: "text",
    text: { body },
  });
}

export async function sendWhatsAppReplyButtons({
  to,
  body,
  buttons,
}: {
  to: string;
  body: string;
  buttons: WhatsAppButton[];
}) {
  const phone = normalizeWhatsappNumber(to);

  return sendWhatsAppPayload({
    to: phone,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body },
      action: {
        buttons: buttons.slice(0, 3).map((button) => ({
          type: "reply",
          reply: {
            id: button.id,
            title: button.title.slice(0, 20),
          },
        })),
      },
    },
  });
}

export function extractWhatsAppMessages(body: any): WhatsAppWebhookMessage[] {
  const entries = Array.isArray(body?.entry) ? body.entry : [];

  return entries.flatMap((entry: any) => {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];

    return changes.flatMap((change: any) => {
      const messages = change?.value?.messages;
      return Array.isArray(messages) ? messages : [];
    });
  });
}

export function extractWhatsAppStatuses(body: any) {
  const entries = Array.isArray(body?.entry) ? body.entry : [];

  return entries.flatMap((entry: any) => {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];

    return changes.flatMap((change: any) => {
      const statuses = change?.value?.statuses;
      return Array.isArray(statuses) ? statuses : [];
    });
  });
}

export function getWhatsAppButtonActionId(message: WhatsAppWebhookMessage) {
  if (message.type === "interactive") {
    return (
      message.interactive?.button_reply?.id ||
      message.interactive?.list_reply?.id ||
      null
    );
  }

  if (message.type === "button") {
    return message.button?.payload || message.button?.text || null;
  }

  return null;
}

export function getAutoReplyForAction(actionId: string) {
  const action = actionId.toUpperCase();

  if (action.includes("OK") || action.includes("YES") || action.includes("CONFIRM")) {
    return "Thank you. Your travel package confirmation has been received. Our team will update you shortly.";
  }

  if (action.includes("NO") || action.includes("NOT_OK") || action.includes("CANCEL")) {
    return "Okay, noted. Our travel team will contact you shortly.";
  }

  return null;
}

export function isAuthorizedWhatsAppTestRequest(request: Request) {
  const expectedKey = process.env.WHATSAPP_TEST_API_KEY;

  if (!expectedKey) {
    return process.env.NODE_ENV !== "production";
  }

  return request.headers.get("x-api-key") === expectedKey;
}
