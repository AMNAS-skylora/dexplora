"use client";

import { useState, useTransition } from "react";
import { sendGmailTestEmail } from "@/actions/email-test";
import { MailCheck, Loader2 } from "lucide-react";

export function GmailTestButton({ configured }: { configured: boolean }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);

  function onTest() {
    setResult(null);
    startTransition(async () => {
      const answer = await sendGmailTestEmail().catch(() => ({
        error: "The test request could not be completed. Check server logs.",
      }));
      setResult(answer);
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={!configured || pending}
        onClick={onTest}
        className="inline-flex items-center gap-2 rounded-xl bg-[#3478F6] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
        {pending ? "Sending test..." : "Send test to my admin email"}
      </button>
      {result?.success && (
        <p role="status" className="text-sm text-emerald-700">
          Gmail accepted the message. Check your inbox or spam folder; delivery is not guaranteed.
        </p>
      )}
      {result?.error && <p role="alert" className="text-sm text-red-700">{result.error}</p>}
    </div>
  );
}
