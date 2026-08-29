"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDate, formatPrice, getWhatsAppLink } from "@/lib/utils";
import {
  addPaymentToBooking,
  addTravellerToBookingList,
  toggleCheckInStatus,
  updateBatchBooking,
  deleteBatchBooking,
} from "@/actions";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  IndianRupee,
  CreditCard,
  UserCheck,
  Plus,
  Edit3,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Train,
  Bus,
  Plane,
  Car,
  User,
  ShieldAlert,
  Clock,
  ExternalLink,
} from "lucide-react";

function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}

interface EventSummary {
  id: string;
  packageTitle: string;
  batchName: string;
  startDate: string | Date;
  endDate: string | Date;
  departurePoint: string;
  arrivalDestination: string;
}

interface CustomerBookingDetails {
  id: string;
  bookingRef: string;
  customerName: string;
  phone: string;
  whatsappNumber?: string | null;
  email?: string | null;
  gender?: string | null;
  age?: number | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  travellerCount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  boardingPoint?: string | null;
  pickupLocation?: string | null;
  transportType?: string | null;
  trainName?: string | null;
  trainNumber?: string | null;
  coach?: string | null;
  seatNumber?: string | null;
  boardingTime?: string | null;
  airportName?: string | null;
  flightNumber?: string | null;
  busOperator?: string | null;
  checkInStatus?: string | null;
  notes?: string | null;
  payments?: Array<{ amount: number; method: string; transactionId?: string | null; paidAt: string | Date; notes?: string | null }>;
  travellers?: Array<{ id: string; name: string; age?: number | null; gender?: string | null; phone?: string | null; boardingPoint?: string | null; transportType?: string | null; seatNumber?: string | null; checkInStatus?: string | null }>;
  createdAt?: string | Date;
}

interface CustomerDetailClientProps {
  event: EventSummary;
  customer: CustomerBookingDetails;
}

export function CustomerDetailClient({ event, customer }: CustomerDetailClientProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTravellerModalOpen, setIsTravellerModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment Form State
  const [payAmount, setPayAmount] = useState<number>(customer.balanceAmount || 0);
  const [payMethod, setPayMethod] = useState("UPI");
  const [payTxnId, setPayTxnId] = useState("");
  const [payNotes, setPayNotes] = useState("");

  // Add Traveller Form State
  const [trvName, setTrvName] = useState("");
  const [trvAge, setTrvAge] = useState<number | "">(25);
  const [trvGender, setTrvGender] = useState("Male");
  const [trvPhone, setTrvPhone] = useState("");
  const [trvBoarding, setTrvBoarding] = useState(customer.boardingPoint || event.departurePoint);
  const [trvSeat, setTrvSeat] = useState("");

  // WhatsApp Pre-filled Link
  const waMessage = `Hello ${customer.customerName},\nThis is regarding your ${event.packageTitle} (${event.batchName}) trip with Dexplora.`;
  const waLink = getWhatsAppLink(customer.whatsappNumber || customer.phone, waMessage);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || payAmount <= 0) {
      setError("Payment amount must be greater than 0.");
      return;
    }

    setLoading(true);
    const res = await addPaymentToBooking(customer.id, {
      amount: Number(payAmount),
      method: payMethod,
      transactionId: payTxnId.trim() || undefined,
      notes: payNotes.trim() || undefined,
    });
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setIsPaymentModalOpen(false);
      setPayTxnId("");
      setPayNotes("");
    }
  };

  const handleAddTraveller = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trvName.trim()) {
      setError("Traveller name is required.");
      return;
    }

    setLoading(true);
    const res = await addTravellerToBookingList(customer.id, {
      name: trvName.trim(),
      age: trvAge ? Number(trvAge) : undefined,
      gender: trvGender,
      phone: trvPhone.trim() || undefined,
      boardingPoint: trvBoarding.trim() || undefined,
      seatNumber: trvSeat.trim() || undefined,
    });
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setIsTravellerModalOpen(false);
      setTrvName("");
      setTrvSeat("");
    }
  };

  const handleToggleCheckIn = async (travellerId?: string, currentStatus?: string) => {
    const nextStatus = currentStatus === "Checked In" ? "Not Checked In" : "Checked In";
    await toggleCheckInStatus(customer.id, nextStatus, travellerId);
  };

  const paymentsList = Array.isArray(customer.payments) ? customer.payments : [];
  const travellersList = Array.isArray(customer.travellers) && customer.travellers.length > 0
    ? customer.travellers
    : [{ id: customer.id, name: customer.customerName, age: customer.age, gender: customer.gender, phone: customer.phone, boardingPoint: customer.boardingPoint, seatNumber: customer.seatNumber, checkInStatus: customer.checkInStatus }];

  const getPaymentBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "PARTIALLY PAID":
      case "PARTIALLY_PAID":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PENDING":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation & Header Actions */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href={`/admin/upcoming-trips/${event.id}`}
            className="p-2.5 rounded-2xl bg-[#F3F7FF] hover:bg-[#3478F6] text-[#3478F6] hover:text-white transition-colors flex items-center gap-2 text-xs font-bold min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Event Manifest</span>
          </Link>

          <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase bg-[#3478F6]/10 text-[#3478F6] border border-[#3478F6]/20">
            Booking Ref: {customer.bookingRef}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1026]">{customer.customerName}</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">
              Trip: <strong className="text-[#3478F6]">{event.packageTitle}</strong> ({event.batchName})
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`tel:${customer.phone}`}
              className="bg-[#F3F7FF] hover:bg-[#3478F6] text-[#3478F6] hover:text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 min-h-[42px] cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Call</span>
            </a>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 min-h-[42px] cursor-pointer shadow-sm"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 min-h-[42px] cursor-pointer shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>+ Add Payment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Profile & Booking Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Profile Box */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4 lg:col-span-2">
          <h2 className="font-extrabold text-base text-[#0B1026] flex items-center gap-2">
            <User className="w-4 h-4 text-[#3478F6]" />
            <span>Customer Profile</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-gray-400 font-bold block mb-0.5">Full Name</span>
              <span className="font-extrabold text-[#0B1026] text-sm">{customer.customerName}</span>
            </div>

            <div>
              <span className="text-gray-400 font-bold block mb-0.5">Phone Number</span>
              <a href={`tel:${customer.phone}`} className="font-bold text-[#3478F6] hover:underline flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {customer.phone}
              </a>
            </div>

            <div>
              <span className="text-gray-400 font-bold block mb-0.5">WhatsApp Number</span>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-600 hover:underline flex items-center gap-1">
                <WhatsAppIcon className="w-3 h-3" />
                {customer.whatsappNumber || customer.phone}
              </a>
            </div>

            <div>
              <span className="text-gray-400 font-bold block mb-0.5">Email Address</span>
              <span className="font-medium text-[#0B1026]">{customer.email || "Not provided"}</span>
            </div>

            <div>
              <span className="text-gray-400 font-bold block mb-0.5">Age & Gender</span>
              <span className="font-medium text-[#0B1026]">
                {customer.age ? `${customer.age} Yrs` : "Age N/A"} • {customer.gender || "Gender N/A"}
              </span>
            </div>

            <div>
              <span className="text-gray-400 font-bold block mb-0.5">Address</span>
              <span className="font-medium text-[#0B1026]">
                {[customer.address, customer.city, customer.state, customer.pincode].filter(Boolean).join(", ") || "Not provided"}
              </span>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="pt-3 border-t border-[#E8ECF3] text-xs space-y-1">
            <span className="text-gray-400 font-bold block">Emergency Contact</span>
            <p className="font-bold text-[#0B1026]">
              {customer.emergencyName ? `${customer.emergencyName} (${customer.emergencyPhone || "No Phone"})` : "Not provided"}
            </p>
          </div>
        </div>

        {/* Financial Summary Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="font-extrabold text-base text-[#0B1026] flex items-center justify-between">
              <span>Financial Overview</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getPaymentBadgeClass(customer.paymentStatus)}`}>
                {customer.paymentStatus}
              </span>
            </h2>

            <div className="space-y-2 text-xs pt-1">
              <div className="flex justify-between py-1 border-b border-[#E8ECF3]">
                <span className="text-gray-500 font-medium">Total Package Price:</span>
                <span className="font-extrabold text-[#0B1026] text-sm">{formatPrice(customer.totalAmount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E8ECF3]">
                <span className="text-gray-500 font-medium">Amount Paid:</span>
                <span className="font-extrabold text-emerald-600 text-sm">{formatPrice(customer.paidAmount)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500 font-bold">Remaining Due:</span>
                <span className="font-extrabold text-red-600 text-base">{formatPrice(customer.balanceAmount)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-2xl text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[42px]"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Payment History Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-base text-[#0B1026] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#3478F6]" />
            <span>Payment History Log</span>
          </h2>
          <span className="text-xs font-bold text-gray-500">{paymentsList.length} Recorded Payments</span>
        </div>

        {paymentsList.length > 0 ? (
          <div className="space-y-2">
            {paymentsList.map((p, idx) => (
              <div key={idx} className="bg-[#F8FAFC] border border-[#E8ECF3] rounded-2xl p-3.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-emerald-600 text-sm">{formatPrice(p.amount)}</span>
                    <span className="bg-white px-2 py-0.5 rounded-lg border font-bold text-[#0B1026] text-[10px]">
                      {p.method}
                    </span>
                  </div>
                  {p.transactionId && <p className="text-gray-500 font-mono text-[11px]">Txn Ref: {p.transactionId}</p>}
                </div>
                <div className="text-right">
                  <span className="text-gray-400 font-medium">{formatDate(p.paidAt)}</span>
                  {p.notes && <p className="text-gray-500 italic text-[11px]">{p.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-4 text-center">No payment history recorded yet.</p>
        )}
      </div>

      {/* Travellers Roster Section */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-base text-[#0B1026] flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#3478F6]" />
            <span>Travellers Roster ({travellersList.length})</span>
          </h2>
          <button
            onClick={() => setIsTravellerModalOpen(true)}
            className="bg-[#F3F7FF] hover:bg-[#3478F6] text-[#3478F6] hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Traveller</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {travellersList.map((t, idx) => (
            <div key={t.id || idx} className="bg-[#F8FAFC] border border-[#E8ECF3] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-[#3478F6]">Traveller #{idx + 1}</span>
                <button
                  onClick={() => handleToggleCheckIn(t.id, t.checkInStatus || "Not Checked In")}
                  className={`px-3 py-1 rounded-full text-[10px] font-extrabold border transition-all cursor-pointer ${t.checkInStatus === "Checked In"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-emerald-50"
                    }`}
                >
                  {t.checkInStatus === "Checked In" ? "✓ Checked In" : "Mark Checked In"}
                </button>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-[#0B1026]">{t.name}</h3>
                <p className="text-xs text-gray-500 font-medium">
                  {t.age ? `${t.age} Yrs` : "Age N/A"} • {t.gender || "Gender N/A"} • Phone: {t.phone || customer.phone}
                </p>
              </div>

              <div className="pt-2 border-t border-[#E8ECF3] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-medium">Boarding Point:</span>
                  <span className="font-bold text-[#0B1026]">{t.boardingPoint || customer.boardingPoint || event.departurePoint}</span>
                </div>
                {t.seatNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-medium">Seat Details:</span>
                    <span className="font-bold text-[#3478F6]">{t.seatNumber}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E8ECF3]">
            <div className="flex items-center justify-between border-b border-[#E8ECF3] pb-3">
              <h2 className="text-base font-extrabold text-[#0B1026]">Record Payment</h2>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-1 rounded-xl text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-200">{error}</div>}

            <form onSubmit={handleAddPayment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  max={customer.balanceAmount || customer.totalAmount}
                  value={payAmount || ""}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  required
                  className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold text-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1">Payment Method</label>
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold text-[#0B1026]">
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Razorpay">Razorpay</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1">Transaction Ref / Txn ID</label>
                <input type="text" value={payTxnId} onChange={(e) => setPayTxnId(e.target.value)} placeholder="UPI Ref #" className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1">Notes</label>
                <input type="text" value={payNotes} onChange={(e) => setPayNotes(e.target.value)} placeholder="Payment note..." className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-medium" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-bold">Cancel</button>
                <button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Record Payment</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Traveller Modal */}
      {isTravellerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E8ECF3]">
            <div className="flex items-center justify-between border-b border-[#E8ECF3] pb-3">
              <h2 className="text-base font-extrabold text-[#0B1026]">Add Traveller to Booking</h2>
              <button onClick={() => setIsTravellerModalOpen(false)} className="p-1 rounded-xl text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-200">{error}</div>}

            <form onSubmit={handleAddTraveller} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1">Traveller Name *</label>
                <input type="text" value={trvName} onChange={(e) => setTrvName(e.target.value)} required placeholder="e.g. Mohammed Ali" className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0B1026] mb-1">Age</label>
                  <input type="number" value={trvAge} onChange={(e) => setTrvAge(e.target.value ? Number(e.target.value) : "")} placeholder="25" className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0B1026] mb-1">Gender</label>
                  <select value={trvGender} onChange={(e) => setTrvGender(e.target.value)} className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1">Seat / Berth Details</label>
                <input type="text" value={trvSeat} onChange={(e) => setTrvSeat(e.target.value)} placeholder="Coach S4 - Berth 22" className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-medium" />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsTravellerModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-bold">Cancel</button>
                <button type="submit" disabled={loading} className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Add Traveller</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
