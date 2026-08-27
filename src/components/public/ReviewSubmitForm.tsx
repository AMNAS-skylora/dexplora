"use client";

import { useState } from "react";
import { submitPublicReview } from "@/actions";
import { Star, CheckCircle2, AlertCircle, MessageSquarePlus } from "lucide-react";

interface ReviewSubmitFormProps {
  packages?: Array<{ id: string; title: string }>;
}

export function ReviewSubmitForm({ packages: _packages }: ReviewSubmitFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await submitPublicReview({
      customerName: formData.get("customerName") as string,
      customerEmail: formData.get("customerEmail") as string,
      customerPhone: formData.get("customerPhone") as string,
      tripName: formData.get("tripName") as string,
      rating,
      review: formData.get("review") as string,
      travelDate: formData.get("travelDate") as string,
    });

    setLoading(false);
    if (result.error) {
      setErrorMessage(result.error);
    } else {
      setSuccessMessage("Thank you! Your review has been submitted for admin moderation.");
      (e.target as HTMLFormElement).reset();
      setRating(5);
    }
  }

  return (
    <div className="bg-white rounded-[18px] border border-[#E5EAF2] p-4.5 sm:p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#0B1026]">Traveled with Dexplora?</h3>
          <p className="text-xs text-[#64748B]">Share your group tour memories and help fellow travelers.</p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all active:scale-98 min-h-[44px] shrink-0 flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>{isOpen ? "Close Form" : "Share Your Experience"}</span>
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-[#E8ECF3] animate-in fade-in duration-300">
          {successMessage && (
            <div className="bg-emerald-50 text-[#16A36A] p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 text-[#DC2626] p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Your Full Name *</label>
              <input
                type="text"
                name="customerName"
                required
                placeholder="e.g. Rahul Varma"
                className="w-full h-[42px] bg-[#F6F8FC] border border-[#E3E8F1] rounded-xl px-3.5 text-xs text-[#0B1026] focus:outline-none focus:border-[#3478F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Trip / Package Name *</label>
              <input
                type="text"
                name="tripName"
                required
                placeholder="e.g. Kerala to Meghalaya Group Package"
                className="w-full h-[42px] bg-[#F6F8FC] border border-[#E3E8F1] rounded-xl px-3.5 text-xs text-[#0B1026] focus:outline-none focus:border-[#3478F6]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Email Address (Optional)</label>
              <input
                type="email"
                name="customerEmail"
                placeholder="rahul@example.com"
                className="w-full h-[42px] bg-[#F6F8FC] border border-[#E3E8F1] rounded-xl px-3.5 text-xs text-[#0B1026] focus:outline-none focus:border-[#3478F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0B1026] mb-1">Travel Date (Optional)</label>
              <input
                type="text"
                name="travelDate"
                placeholder="e.g. October 2026"
                className="w-full h-[42px] bg-[#F6F8FC] border border-[#E3E8F1] rounded-xl px-3.5 text-xs text-[#0B1026] focus:outline-none focus:border-[#3478F6]"
              />
            </div>
          </div>

          {/* Rating Selection */}
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1.5">Overall Rating *</label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center focus:outline-none cursor-pointer"
                  aria-label={`Rate ${star} out of 5 stars`}
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= rating ? "text-[#F5B82E] fill-[#F5B82E]" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-[#3478F6] ml-2">{rating} / 5 Stars</span>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Your Review *</label>
            <textarea
              name="review"
              required
              rows={4}
              placeholder="Tell us about the tour leader support, stays, transportation, and overall group travel experience..."
              className="w-full bg-[#F6F8FC] border border-[#E3E8F1] rounded-xl p-3.5 text-xs text-[#0B1026] focus:outline-none focus:border-[#3478F6]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3478F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs shadow-xs transition-all active:scale-98 min-h-[44px] cursor-pointer"
          >
            {loading ? "Submitting..." : "Submit Review for Moderation"}
          </button>
        </form>
      )}
    </div>
  );
}
