import "server-only";
import tls from "node:tls";
import { randomUUID } from "node:crypto";

export type OutgoingEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const EMAIL = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;

function encodeBase64Lines(input: string): string {
  return (Buffer.from(input, "utf8").toString("base64").match(/.{1,76}/g) || []).join("\r\n");
}

export function isGmailSmtpConfigured(): boolean {
  return Boolean(process.env.SMTP_USER?.trim() && process.env.SMTP_APP_PASSWORD?.trim());
}

/**
 * Minimal Gmail SMTP client using Node's built-in TLS, avoiding external email APIs.
 * Authentication uses an app password. It must never be passed to the browser.
 * A successful response means Gmail accepted the message, not inbox delivery.
 */
export async function sendGmailEmail(input: OutgoingEmail): Promise<{ id: string }> {
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_APP_PASSWORD?.replace(/\s/g, "");
  const from = process.env.SMTP_FROM?.trim() || user;
  const to = input.to.trim();
  if (!user || !password) throw new Error("Gmail SMTP is not configured");
  if (!EMAIL.test(user) || !from || !EMAIL.test(from) || from.toLowerCase() !== user.toLowerCase()) {
    throw new Error("SMTP_FROM must match the Gmail account in SMTP_USER");
  }
  if (!EMAIL.test(to)) throw new Error("Invalid recipient email address");
  if (!input.subject || /[\r\n]/.test(input.subject)) throw new Error("Invalid email subject");
  if (!input.html || !input.text) throw new Error("Both HTML and plain-text email content are required");

  const boundary = "dexplora_" + randomUUID().replace(/-/g, "");
  const body = [
    "From: Dexplora Tour Planners <" + from + ">",
    "To: <" + to + ">",
    "Subject: =?UTF-8?B?" + Buffer.from(input.subject, "utf8").toString("base64") + "?=",
    "MIME-Version: 1.0",
    'Content-Type: multipart/alternative; boundary="' + boundary + '"',
    "",
    "--" + boundary,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    encodeBase64Lines(input.text),
    "--" + boundary,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
    "",
    encodeBase64Lines(input.html),
    "--" + boundary + "--",
    "",
  ].join("\r\n");

  // Gmail supports implicit TLS on 465. This intentionally cannot be redirected to arbitrary hosts.
  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      host: "smtp.gmail.com",
      port: 465,
      servername: "smtp.gmail.com",
      rejectUnauthorized: true,
    });
    socket.setTimeout(20000);

    let buffer = "";
    let stage = 0;
    let settled = false;

    const expected = [220, 250, 334, 334, 235, 250, 250, 354, 250, 221];
    const commands = [
      "EHLO dexplora.local",
      "AUTH LOGIN",
      Buffer.from(user, "utf8").toString("base64"),
      Buffer.from(password, "utf8").toString("base64"),
      "MAIL FROM:<" + from + ">",
      "RCPT TO:<" + to + ">",
      "DATA",
      // Dot-stuffing protects SMTP message framing.
      body.replace(/(^|\r\n)\./g, "$1..") + "\r\n.",
      "QUIT",
    ];

    function finish(error?: Error) {
      if (settled) return;
      settled = true;
      socket.end();
      if (error) reject(error);
      else resolve({ id: randomUUID() });
    }

    socket.on("data", (chunk) => {
      buffer += chunk.toString("utf8");
      if (buffer.length > 50000) return finish(new Error("Unexpected SMTP response"));
      let newline: number;
      while (!settled && (newline = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newline).trimEnd();
        buffer = buffer.slice(newline + 1);
        if (!/^\d{3}[ -]/.test(line) || line[3] === "-") continue;
        const code = Number(line.slice(0, 3));
        if (code !== expected[stage]) {
          return finish(new Error("Gmail SMTP rejected the message at stage " + stage + " (code " + code + ")"));
        }
        if (stage === 9) {
          finish();
          return;
        }
        socket.write(commands[stage++] + "\r\n");
      }
    });
    socket.on("error", (error) => finish(error));
    socket.on("timeout", () => finish(new Error("Gmail SMTP connection timed out")));
    socket.on("close", () => {
      if (!settled) finish(new Error("Gmail SMTP connection closed unexpectedly"));
    });
  });
}
