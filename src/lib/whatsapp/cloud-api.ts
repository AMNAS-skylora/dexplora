import "server-only";
const GRAPH_VERSION = "v23.0";
export interface WhatsAppTemplateMessage { to: string; templateName: string; languageCode: string; bodyParameters: string[]; }
export async function sendWhatsAppTemplate(message: WhatsAppTemplateMessage) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) throw new Error("WhatsApp Cloud API is not configured");
  if (!/^[a-z0-9_]+$/.test(message.templateName)) throw new Error("Invalid template name");
  if (!/^\d{10,15}$/.test(message.to)) throw new Error("Invalid recipient number");
  const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(phoneId)}/messages`, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: message.to, type: "template",
      template: { name: message.templateName, language: { code: message.languageCode },
        components: message.bodyParameters.length ? [{ type: "body", parameters: message.bodyParameters.map(text => ({ type: "text", text })) }] : [] } }),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`WhatsApp API failed (${response.status}): ${JSON.stringify(data).slice(0,300)}`);
  return data as { messages?: { id: string }[] };
}
