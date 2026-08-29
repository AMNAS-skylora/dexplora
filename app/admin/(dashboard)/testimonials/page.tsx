import { db } from "@/lib/db";
import { updateReviewStatus, deleteReview } from "@/actions";
import { CheckCircle2, XCircle, Trash2, Star } from "lucide-react";

export const revalidate = 0;

export default async function AdminTestimonialsPage() {
  const testimonials = await db.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0B1026]">Customer Testimonial Moderation</h1>
        <p className="text-xs text-[#667085]">Approve, reject, feature, or delete submitted traveler reviews.</p>
      </div>

      <div className="space-y-4">
        {testimonials.map((t: any) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl border border-[#E8ECF3] p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-sm text-[#0B1026]">{t.customerName}</span>
                <span className="text-xs font-semibold text-[#3478F6]">({t.tripName})</span>
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{t.rating} / 5</span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    t.status === "APPROVED"
                      ? "bg-emerald-100 text-emerald-700"
                      : t.status === "PENDING"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-[#0B1026] leading-relaxed italic">&ldquo;{t.review}&rdquo;</p>
              {t.customerEmail && <span className="text-[11px] text-gray-400 block">{t.customerEmail}</span>}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {t.status !== "APPROVED" && (
                <form action={async () => { "use server"; await updateReviewStatus(t.id, "APPROVED", true); }}>
                  <button
                    type="submit"
                    className="bg-[#16A36A] hover:bg-[#128856] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1 min-h-[36px]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                </form>
              )}

              {t.status !== "REJECTED" && (
                <form action={async () => { "use server"; await updateReviewStatus(t.id, "REJECTED"); }}>
                  <button
                    type="submit"
                    className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 min-h-[36px]"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </form>
              )}

              <form action={async () => { "use server"; await deleteReview(t.id); }}>
                <button
                  type="submit"
                  className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white p-2 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
