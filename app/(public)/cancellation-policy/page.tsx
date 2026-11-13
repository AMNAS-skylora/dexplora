import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import { resolveCancellationPolicy } from "@/lib/cancellation-policy";
import { CancellationPolicySection } from "@/components/public/CancellationPolicySection";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Dexplora Tour Planners",
  description: "Review booking advances, refund and cancellation charges before confirming a tour with Dexplora.",
};

export const dynamic = "force-dynamic";

export default async function CancellationPolicyPage() {
  const settings = await getSiteSettings();
  const policy = resolveCancellationPolicy(settings);
  return (
    <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8 pb-16 sm:px-6 sm:py-12">
      <nav className="text-xs font-semibold text-[#64748B]" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-[#3478F6]">Home</Link>
        <span className="mx-2">/</span>
        Cancellation &amp; Refund Policy
      </nav>
      <CancellationPolicySection policy={policy} />
      <p className="text-sm leading-relaxed text-[#64748B]">
        Tour-specific terms may vary. When booking, review the cancellation and refund
        policy on your selected package page. For details, contact{" "}
        <a className="font-bold text-[#3478F6] underline underline-offset-2"
          href={`mailto:${settings.email}`}>{settings.email}</a>.
      </p>
    </main>
  );
}
