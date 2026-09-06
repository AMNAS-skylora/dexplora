import { db } from "@/lib/db";
import { ReviewSubmitForm } from "@/components/public/ReviewSubmitForm";
import { Star, Quote, CheckCircle2 } from "lucide-react";

import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Traveler Reviews & Feedback",
  description:
    "Read genuine reviews and travel experiences shared by Dexplora group trip travelers across India.",
  alternates: {
    canonical: absoluteUrl("/reviews"),
  },
};

export default async function ReviewsPage() {
  let testimonials: any[] = [];
  let packages: any[] = [];

  try {
    testimonials = await db.testimonial.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
  }

  try {
    packages = await db.package.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true },
    });
  } catch (error) {
    console.error("Error fetching packages for reviews:", error);
  }

  // Calculate real rating statistics
  const totalReviews = testimonials.length;
  const totalRatingSum = testimonials.reduce((acc, t) => acc + (t.rating || 5), 0);
  const averageRating = totalReviews > 0 ? (totalRatingSum / totalReviews).toFixed(1) : "4.9";

  // Calculate rating distribution bars
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  testimonials.forEach((t) => {
    const r = Math.min(5, Math.max(1, t.rating || 5)) as 1 | 2 | 3 | 4 | 5;
    counts[r] = (counts[r] || 0) + 1;
  });

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-[clamp(14px,4vw,28px)] py-4 sm:py-8 lg:py-10 space-y-6 sm:space-y-10">
      {/* Page Header Intro */}
      <div className="space-y-1.5 py-1 sm:py-2 text-left sm:text-center max-w-2xl sm:mx-auto">
        <span className="text-[clamp(11px,3vw,13px)] font-bold uppercase tracking-[0.06em] text-[#3478F6] block">
          TRAVELER STORIES
        </span>
        <h1 className="text-[clamp(28px,8vw,46px)] font-bold text-[#0B1026] leading-[1.05] tracking-[-0.03em] break-words">
          Loved by Dexplora Travelers
        </h1>
        <p className="text-[clamp(14px,3.8vw,17px)] text-[#64748B] leading-[1.5] font-normal mt-1 break-words">
          Real experiences and memories shared by travelers who explored India with Dexplora.
        </p>
      </div>

      {/* Real Review Statistics Summary Panel */}
      <div className="bg-white rounded-[18px] border border-[#E5EAF2] p-4 sm:p-6 shadow-[0_4px_16px_rgba(15,23,42,0.04)] grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Rating Score */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-center sm:text-left shrink-0">
            <span className="text-[clamp(32px,9vw,46px)] font-extrabold text-[#0B1026] leading-none block">
              {averageRating}
            </span>
            <span className="text-xs font-semibold text-[#64748B] block mt-1">out of 5 Stars</span>
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 sm:w-6 sm:h-6 text-[#F5B82E] fill-[#F5B82E] shrink-0"
                />
              ))}
            </div>
            <p className="text-xs font-bold text-[#0B1026]">
              Excellent · <span className="text-[#3478F6]">{totalReviews} Verified Reviews</span>
            </p>
          </div>
        </div>

        {/* Dynamic Star Distribution Bars */}
        {totalReviews > 0 && (
          <div className="space-y-1.5 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-[#E8EDF4] md:pl-6">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = counts[star as keyof typeof counts] || 0;
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

              return (
                <div key={star} className="flex items-center gap-2.5 text-xs min-w-0">
                  <span className="font-semibold text-[#0B1026] w-6 shrink-0">{star} ★</span>
                  <div className="flex-1 bg-[#EDF1F6] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#F5B82E] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-[#64748B] w-8 text-right shrink-0">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Submission Form CTA */}
      <div className="w-full">
        <ReviewSubmitForm packages={packages} />
      </div>

      {/* Approved Reviews Grid */}
      {testimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[clamp(12px,3vw,20px)]">
          {testimonials.map((t) => {
            const displayDate = t.travelDate
              ? t.travelDate
              : t.createdAt
              ? new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(new Date(t.createdAt))
              : "May 2026";

            return (
              <div
                key={t.id}
                className="bg-white rounded-[16px] border border-[#E5EAF2] p-[clamp(14px,4vw,22px)] shadow-[0_6px_20px_rgba(15,23,42,0.04)] flex flex-col justify-between space-y-4 relative min-w-0"
              >
                <Quote className="w-6 h-6 text-[#3478F6]/15 absolute top-4 right-4 pointer-events-none shrink-0" />

                <div className="space-y-3 min-w-0">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                          i < (t.rating || 5) ? "text-[#F5B82E] fill-[#F5B82E]" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Review Quote */}
                  <p className="text-[clamp(13px,3.5vw,15px)] text-[#334155] leading-[1.55] font-normal break-words">
                    &ldquo;{t.review}&rdquo;
                  </p>
                </div>

                {/* Reviewer Details Footer (No photos, clean text only) */}
                <div className="mt-4 pt-3.5 border-t border-[#E8EDF4] flex flex-col items-start gap-0.5 min-w-0">
                  <h4 className="font-semibold text-[clamp(13px,3.4vw,15px)] text-[#111827] leading-[1.25] break-words">
                    {t.customerName}
                  </h4>
                  <p className="text-[clamp(11px,3vw,13px)] text-[#3478F6] font-medium leading-[1.35] break-words">
                    {t.tripName}
                  </p>
                  <span className="text-[11px] text-[#667085] leading-snug block mt-0.5">
                    {displayDate}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-[#64748B] text-sm bg-[#F8FAFF] rounded-2xl border border-[#DBE6FF]">
          No traveler reviews available yet. Be the first to share your experience!
        </div>
      )}
    </div>
  );
}
