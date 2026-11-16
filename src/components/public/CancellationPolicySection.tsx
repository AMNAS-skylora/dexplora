import type { CancellationPolicy } from "@/lib/cancellation-policy";
import { AlertCircle, ShieldCheck } from "lucide-react";

export function CancellationPolicySection({
  policy,
  title = "Cancellation & Refund Policy",
}: {
  policy: CancellationPolicy;
  title?: string;
}) {
  return (
    <section id="cancellation-refund-policy" aria-labelledby="cancellation-policy-title" className="space-y-4">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.13em] text-[#3478F6]">
          <AlertCircle className="h-4 w-4" />
          Important Note
        </div>
        <h2 id="cancellation-policy-title" className="text-[clamp(21px,4vw,28px)] font-extrabold leading-tight text-[#0B1026]">
          {title}
        </h2>
      </div>

      <div className="rounded-2xl border border-[#D4E4FF] bg-light-bg px-4 py-5 text-[#173A68] sm:px-6 sm:py-7">
        <div className="mb-5 space-y-2.5">
          <h3 className="flex items-center gap-2 text-base font-extrabold sm:text-lg">
            <ShieldCheck className="h-5 w-5 text-[#2563EB]" /> 1. Booking Advance
          </h3>
          <ul className="space-y-2 pl-5 text-[14px] font-bold leading-relaxed text-[#294567] marker:text-[#2563EB] sm:text-[15px]">
            <li className="list-disc">A booking advance of <strong className="font-black text-[#174B8C]">{policy.advancePercent}% per person</strong> is required to confirm a tour slot, wherever specified.</li>
            {policy.advanceNonRefundable && <li className="list-disc">The booking advance is <strong className="font-black text-[#174B8C]">non-refundable</strong>.</li>}
            <li className="list-disc">Once a booking is confirmed, cancellation charges will apply.</li>
          </ul>
        </div>

        <div className="border-t border-[#D4E4FF] pt-5">
          <h3 className="mb-3 text-base font-extrabold sm:text-lg">2. Cancellation Charges</h3>
          <p className="mb-4 text-[13px] leading-relaxed text-[#405674] sm:text-sm">
            {policy.cancellationNotes}
          </p>
          <div className="min-w-0 w-full">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b border-[#BDD4F4]">
                  <th scope="col" className="w-[63%] break-words px-1 py-3 pr-3 text-[12px] font-extrabold leading-snug text-[#173A68] sm:text-[15px]">Cancellation period</th>
                  <th scope="col" className="w-[37%] break-words px-1 py-3 text-right text-[12px] font-extrabold leading-snug text-[#173A68] sm:text-[15px]"><span className="sm:hidden">Charge</span><span className="hidden sm:inline">Cancellation charge</span></th>
                </tr>
              </thead>
              <tbody>
                {policy.charges.map((rule, index) => (
                  <tr key={rule.period + "-" + index} className="border-b border-[#D4E4FF] last:border-b-0">
                    <td className="break-words px-1 py-4 pr-3 text-[13px] font-medium leading-relaxed text-[#294567] sm:text-base">{rule.period}</td>
                    <td className="px-1 py-4 text-right text-[15px] font-extrabold tabular-nums text-[#173A68] sm:text-lg">{rule.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {policy.importantNotice.trim() && (
        <aside aria-label="Important notice" className="rounded-2xl border border-[#D9E6FB] bg-[#F3F7FF] px-4 py-4 sm:px-5">
          <h3 className="mb-1.5 flex items-center gap-2 text-sm font-extrabold text-[#174B8C]">
            <AlertCircle className="h-4 w-4" />
            Important Notice
          </h3>
          <p className="whitespace-pre-wrap break-words text-[13px] font-semibold leading-relaxed text-[#354A66] sm:text-[15px]">
            {policy.importantNotice}
          </p>
        </aside>
      )}
    </section>
  );
}
