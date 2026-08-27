"use client";

import { useState } from "react";
import { createContactEnquiry } from "@/actions";
import { CheckCircle2, AlertCircle, Send, Loader2 } from "lucide-react";

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await createContactEnquiry({
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    });

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    }
  }

  return (
    <div className="bg-white rounded-[18px] border border-[#E5EAF2] p-4.5 sm:p-6 shadow-[0_4px_16px_rgba(15,23,42,0.035)] space-y-4 min-w-0">
      <div>
        <h3 className="text-lg sm:text-xl font-bold text-[#0B1026]">Send Us a Message</h3>
        <p className="text-xs text-[#64748B] mt-0.5">We&apos;ll get back to you as soon as possible.</p>
      </div>

      {success && (
        <div className="bg-emerald-50 text-[#16A36A] p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
          <span>Message sent successfully. We&apos;ll get back to you soon.</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-[#DC2626] p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4.5 h-4.5 shrink-0" />
          <span>Unable to send your message. Please try again.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">Full Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Anjali Menon"
              className="w-full h-[46px] bg-[#F8FAFC] border border-[#DFE5EE] rounded-xl px-3.5 text-base sm:text-sm text-[#0B1026] placeholder-[#94A3B8] focus:outline-none focus:border-[#3478F6] focus:ring-3 focus:ring-[#3478F6]/10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="+91 9876543210"
              className="w-full h-[46px] bg-[#F8FAFC] border border-[#DFE5EE] rounded-xl px-3.5 text-base sm:text-sm text-[#0B1026] placeholder-[#94A3B8] focus:outline-none focus:border-[#3478F6] focus:ring-3 focus:ring-[#3478F6]/10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="anjali@gmail.com"
              className="w-full h-[46px] bg-[#F8FAFC] border border-[#DFE5EE] rounded-xl px-3.5 text-base sm:text-sm text-[#0B1026] placeholder-[#94A3B8] focus:outline-none focus:border-[#3478F6] focus:ring-3 focus:ring-[#3478F6]/10"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              placeholder="Group Departure Enquiry"
              className="w-full h-[46px] bg-[#F8FAFC] border border-[#DFE5EE] rounded-xl px-3.5 text-base sm:text-sm text-[#0B1026] placeholder-[#94A3B8] focus:outline-none focus:border-[#3478F6] focus:ring-3 focus:ring-[#3478F6]/10"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#334155] mb-1">Message *</label>
          <textarea
            name="message"
            required
            rows={4}
            placeholder="Tell us your trip preferences, group size, or specific dates..."
            className="w-full min-h-[110px] bg-[#F8FAFC] border border-[#DFE5EE] rounded-xl p-3.5 text-base sm:text-sm text-[#0B1026] placeholder-[#94A3B8] focus:outline-none focus:border-[#3478F6] focus:ring-3 focus:ring-[#3478F6]/10 resize-y"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-[48px] bg-[#3478F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-semibold text-sm sm:text-base rounded-xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 stroke-[2]" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
