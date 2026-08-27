"use client";

import { useState } from "react";
import { createBookingEnquiry } from "@/actions";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";
import Link from "next/link";

interface SubmittedBookingInfo {
  id: string;
  referenceCode: string;
  fullName: string;
  numberOfTravellers: number;
}

interface BookingFormProps {
  packages: Array<{
    id: string;
    title: string;
    slug: string;
    batches: Array<{
      id: string;
      batchName?: string | null;
      startDate: Date | string;
      endDate: Date | string;
    }>;
  }>;
  initialPackageSlug?: string;
  initialBatchId?: string;
  whatsappNumber: string;
}

export function BookingForm({
  packages,
  initialPackageSlug,
  initialBatchId,
  whatsappNumber,
}: BookingFormProps) {
  const defaultPkg = packages.find((p) => p.slug === initialPackageSlug) || packages[0];
  const [selectedPackageId, setSelectedPackageId] = useState(defaultPkg?.id || "");
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId || "");
  const [loading, setLoading] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<SubmittedBookingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedPkgObj = packages.find((p) => p.id === selectedPackageId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName") as string,
      phone: formData.get("phone") as string,
      whatsappNumber: formData.get("whatsappNumber") as string,
      email: formData.get("email") as string,
      packageId: selectedPackageId,
      batchId: selectedBatchId || undefined,
      numberOfTravellers: Number(formData.get("numberOfTravellers")) || 1,
      adults: Number(formData.get("adults")) || 1,
      children: Number(formData.get("children")) || 0,
      preferredDate: formData.get("preferredDate") as string,
      boardingLocation: formData.get("boardingLocation") as string,
      message: formData.get("message") as string,
    };

    const result = await createBookingEnquiry(data);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.booking) {
      setSubmittedBooking(result.booking);
    }
  }

  if (submittedBooking) {
    const cleanNumber = whatsappNumber.replace(/\D/g, "");
    const whatsappMsg = `Hi%20Dexplora%20Tour%20Planners,%20I%20have%20submitted%20a%20booking%20enquiry!%0A%0AReference:%20${
      submittedBooking.referenceCode
    }%0AName:%20${encodeURIComponent(submittedBooking.fullName)}%0APackage:%20${encodeURIComponent(
      selectedPkgObj?.title || ""
    )}%0ATravellers:%20${submittedBooking.numberOfTravellers}`;

    const waUrl = `https://wa.me/${cleanNumber}?text=${whatsappMsg}`;

    return (
      <div className="bg-white rounded-3xl border border-[#E8ECF3] p-8 sm:p-12 text-center space-y-6 shadow-lg max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#16A36A] flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1026]">
            Thank You! Your Enquiry Has Been Submitted.
          </h2>
          <p className="text-xs text-[#667085]">
            Our travel coordinator will contact you shortly to confirm batch seat availability and payment details.
          </p>
        </div>

        <div className="bg-[#F3F7FF] border border-[#3478F6]/20 p-4 rounded-2xl inline-block">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Booking Reference Number
          </span>
          <span className="text-2xl font-black text-[#3478F6] tracking-wider">
            {submittedBooking.referenceCode}
          </span>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto bg-[#16A36A] hover:bg-[#128856] text-white px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md min-h-[48px]"
          >
            <Send className="w-4 h-4" />
            <span>Continue on WhatsApp</span>
          </a>

          <Link
            href="/packages"
            className="w-full sm:w-auto bg-[#F3F7FF] text-[#0B1026] hover:bg-gray-200 px-6 py-3.5 rounded-xl font-bold text-sm min-h-[48px] flex items-center justify-center"
          >
            Browse More Packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#E8ECF3] p-6 sm:p-10 shadow-lg max-w-3xl mx-auto space-y-6">
      <div className="space-y-1 border-b border-[#E8ECF3] pb-4">
        <h2 className="text-2xl font-extrabold text-[#0B1026]">Trip Booking Enquiry</h2>
        <p className="text-xs text-[#667085]">Fill out the details below to reserve your seats for upcoming group departures.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-[#DC2626] p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Full Name *</label>
            <input
              type="text"
              name="fullName"
              required
              placeholder="e.g. Vishnu Kumar"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#3478F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              required
              placeholder="+91 9876543210"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#3478F6]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">WhatsApp Number</label>
            <input
              type="tel"
              name="whatsappNumber"
              placeholder="+91 9876543210"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#3478F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="vishnu@example.com"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#3478F6]"
            />
          </div>
        </div>

        {/* Package & Batch Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Select Package *</label>
            <select
              value={selectedPackageId}
              onChange={(e) => {
                setSelectedPackageId(e.target.value);
                setSelectedBatchId("");
              }}
              required
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] text-xs font-bold text-[#0B1026] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#3478F6]"
            >
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Select Batch Date</label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] text-xs font-bold text-[#0B1026] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#3478F6]"
            >
              <option value="">Choose Batch (Optional)</option>
              {selectedPkgObj?.batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batchName || "Departure"} ({new Date(b.startDate).toLocaleDateString("en-IN")})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Travelers Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Total Travelers</label>
            <input
              type="number"
              name="numberOfTravellers"
              defaultValue={1}
              min={1}
              required
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-bold text-[#0B1026]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Adults</label>
            <input
              type="number"
              name="adults"
              defaultValue={1}
              min={1}
              required
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-bold text-[#0B1026]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Children</label>
            <input
              type="number"
              name="children"
              defaultValue={0}
              min={0}
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3 py-2 text-xs font-bold text-[#0B1026]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Preferred Date / Month</label>
            <input
              type="text"
              name="preferredDate"
              placeholder="e.g. October 15, 2026"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#3478F6]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Boarding Location in Kerala</label>
            <input
              type="text"
              name="boardingLocation"
              placeholder="e.g. Kochi / Calicut / Thrissur"
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#3478F6]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#0B1026] mb-1">Special Requests / Notes</label>
          <textarea
            name="message"
            rows={3}
            placeholder="Any food preferences, room sharing requests, or questions..."
            className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#3478F6]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#3478F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-bold py-4 rounded-xl text-sm shadow-lg transition-all min-h-[48px]"
        >
          {loading ? "Submitting Booking..." : "Submit Booking Enquiry"}
        </button>
      </form>
    </div>
  );
}
