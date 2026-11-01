import "server-only";
export async function sendDexploraEmail(input: { to: string; subject: string; html: string; text: string; idempotencyKey?: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.DEXPLORA_EMAIL_FROM;
  if (!key || !from) throw new Error("Email API not configured. Add RESEND_API_KEY and DEXPLORA_EMAIL_FROM.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.to)) throw new Error("Invalid recipient email");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json",
      ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}) },
    body: JSON.stringify({ from, to: [input.to], subject: input.subject, html: input.html, text: input.text }),
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(`Email provider error (${response.status}): ${JSON.stringify(data).slice(0,300)}`);
  return data as { id: string };
}
