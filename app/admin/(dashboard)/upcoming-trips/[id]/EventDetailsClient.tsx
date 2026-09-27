"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate, formatPrice, getWhatsAppLink } from "@/lib/utils";

function WhatsAppIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}
import {
  createBatchBooking,
  updateBatchBooking,
  addPaymentToBooking,
  deleteBatchBooking,
  updateTripBatch,
} from "@/actions";
import { calculateArchiveMetrics } from "@/lib/archive";
import { SafeArchiveDeleteModal } from "@/components/admin/SafeArchiveDeleteModal";
import {
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  Plus,
  Search,
  Filter,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Train,
  Bus,
  Plane,
  Car,
  Trash2,
  Edit3,
  CreditCard,
  Phone,
  Mail,
  UserCheck,
  Building,
  Clock,
  ShieldAlert,
  ChevronRight,
  Eye,
  Download,
  FileSpreadsheet,
} from "lucide-react";

interface BookingRecord {
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
  payments?: Array<{ amount: number; method: string; receivedBy?: string | null; transactionId?: string | null; paidAt: string | Date; notes?: string | null }>;
  createdAt?: string | Date;
}

interface EnrichedBatchDetails {
  id: string;
  packageId: string;
  batchName?: string | null;
  startDate: string | Date;
  endDate: string | Date;
  priceOverride?: number | null;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
  status: string;
  boardingPoint?: string | null;
  notes?: string | null;
  packageTitle: string;
  packageCoverImage: string;
  packagePrice: number;
  packageExpensePerPerson: number;
  eventExpenses?: Array<{ id: string; title: string; amount: number; category?: string | null; expenseDate?: string | Date; notes?: string | null }>;
  duration: string;
  departurePoint: string;
  arrivalDestination: string;
  bookings: BookingRecord[];
}

interface EventDetailsClientProps {
  batch: EnrichedBatchDetails;
  packages: Array<{ id: string; title: string; price: number; duration?: string }>;
}

export function EventDetailsClient({ batch, packages }: EventDetailsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [transportFilter, setTransportFilter] = useState("ALL");

  // Modals state
  const [isAddTravellerModalOpen, setIsAddTravellerModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingRecord | null>(null);
  const [paymentModalBooking, setPaymentModalBooking] = useState<BookingRecord | null>(null);
  const [transportModalBooking, setTransportModalBooking] = useState<BookingRecord | null>(null);
  const [viewDetailModalBooking, setViewDetailModalBooking] = useState<BookingRecord | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add/Edit Traveller Form State
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("Male");
  const [age, setAge] = useState<number | "">(25);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [travellerCount, setTravellerCount] = useState(1);
  const [totalAmount, setTotalAmount] = useState<number>(batch.priceOverride || batch.packagePrice || 14499);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentReceiver, setPaymentReceiver] = useState<"Rishal" | "Nihas">("Rishal");
  const [transactionId, setTransactionId] = useState("");
  const [bookingStatus, setBookingStatus] = useState("Confirmed");
  const [boardingPoint, setBoardingPoint] = useState(batch.departurePoint || "Kochi");
  const [pickupLocation, setPickupLocation] = useState("");
  const [transportType, setTransportType] = useState("Train");
  const [trainName, setTrainName] = useState("");
  const [trainNumber, setTrainNumber] = useState("");
  const [coach, setCoach] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [boardingTime, setBoardingTime] = useState("");
  const [airportName, setAirportName] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [busOperator, setBusOperator] = useState("");
  const [checkInStatus, setCheckInStatus] = useState("Not Checked In");
  const [notes, setNotes] = useState("");

  // Payment Add Modal State
  const [newPayAmount, setNewPayAmount] = useState<number>(0);
  const [newPayMethod, setNewPayMethod] = useState("UPI");
  const [newPayReceiver, setNewPayReceiver] = useState<"Rishal" | "Nihas">("Rishal");
  const [newPayTxnId, setNewPayTxnId] = useState("");
  const [newPayNotes, setNewPayNotes] = useState("");

  const unitPrice = Number(batch.priceOverride) || Number(batch.packagePrice) || 0;

  // Filter Bookings
  const activeBookings = batch.bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone.includes(searchTerm) ||
      b.bookingRef.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPayment =
      paymentFilter === "ALL" || b.paymentStatus.toUpperCase() === paymentFilter.toUpperCase();

    const matchesStatus =
      statusFilter === "ALL" || b.bookingStatus.toUpperCase() === statusFilter.toUpperCase();

    const matchesTransport =
      transportFilter === "ALL" || (b.transportType || "Train").toUpperCase() === transportFilter.toUpperCase();

    return matchesSearch && matchesPayment && matchesStatus && matchesTransport;
  });

  // Calculate Aggregates
  const confirmedBookings = batch.bookings.filter((b) => b.bookingStatus !== "Cancelled" && b.bookingStatus !== "CANCELLED");
  const totalBookedSeats = confirmedBookings.reduce((sum, b) => sum + (b.travellerCount || 1), 0);
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.totalAmount) || 0), 0);
  const totalCollected = confirmedBookings.reduce((sum, b) => sum + (Number(b.paidAmount) || 0), 0);
  const receiverTotals = confirmedBookings.reduce(
    (totals, booking) => {
      (booking.payments || []).forEach((payment) => {
        const amount = Number(payment.amount) || 0;
        if (payment.receivedBy === "Rishal") totals.rishal += amount;
        else if (payment.receivedBy === "Nihas") totals.nihas += amount;
        else totals.unassigned += amount;
      });
      return totals;
    },
    { rishal: 0, nihas: 0, unassigned: 0 }
  );
  const baseExpense = (Number(batch.packageExpensePerPerson) || 0) * totalBookedSeats;
  const extraExpense = (batch.eventExpenses || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const totalExpense = baseExpense + extraExpense;
  const estimatedProfit = totalRevenue - totalExpense;
  const totalPending = Math.max(0, totalRevenue - totalCollected);
  const availableSeats = Math.max(0, batch.totalSeats - totalBookedSeats);

  const handleOpenAddModal = () => {
    setEditingBooking(null);
    setCustomerName("");
    setPhone("");
    setWhatsappNumber("");
    setEmail("");
    setGender("Male");
    setAge(25);
    setAddress("");
    setCity("");
    setState("");
    setPincode("");
    setEmergencyName("");
    setEmergencyPhone("");
    setTravellerCount(1);
    setTotalAmount(batch.priceOverride || batch.packagePrice || 14499);
    setPaidAmount(0);
    setPaymentMethod("UPI");
    setPaymentReceiver("Rishal");
    setTransactionId("");
    setBookingStatus("Confirmed");
    setBoardingPoint(batch.departurePoint || "Kochi");
    setPickupLocation("");
    setTransportType("Train");
    setTrainName("");
    setTrainNumber("");
    setCoach("");
    setSeatNumber("");
    setBoardingTime("");
    setAirportName("");
    setFlightNumber("");
    setBusOperator("");
    setCheckInStatus("Not Checked In");
    setNotes("");
    setError(null);
    setIsAddTravellerModalOpen(true);
  };

  const handleOpenEditModal = (b: BookingRecord) => {
    setEditingBooking(b);
    setCustomerName(b.customerName);
    setPhone(b.phone);
    setWhatsappNumber(b.whatsappNumber || "");
    setEmail(b.email || "");
    setGender(b.gender || "Male");
    setAge(b.age || "");
    setAddress(b.address || "");
    setCity(b.city || "");
    setState(b.state || "");
    setPincode(b.pincode || "");
    setEmergencyName(b.emergencyName || "");
    setEmergencyPhone(b.emergencyPhone || "");
    setTravellerCount(b.travellerCount || 1);
    setTotalAmount(b.totalAmount);
    setPaidAmount(b.paidAmount);
    setBookingStatus(b.bookingStatus);
    setBoardingPoint(b.boardingPoint || batch.departurePoint);
    setPickupLocation(b.pickupLocation || "");
    setTransportType(b.transportType || "Train");
    setTrainName(b.trainName || "");
    setTrainNumber(b.trainNumber || "");
    setCoach(b.coach || "");
    setSeatNumber(b.seatNumber || "");
    setBoardingTime(b.boardingTime || "");
    setAirportName(b.airportName || "");
    setFlightNumber(b.flightNumber || "");
    setBusOperator(b.busOperator || "");
    setCheckInStatus(b.checkInStatus || "Not Checked In");
    setNotes(b.notes || "");
    setError(null);
    setIsAddTravellerModalOpen(true);
  };

  const handleSaveTraveller = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !phone.trim()) {
      setError("Full Name and Phone Number are required.");
      return;
    }

    setLoading(true);

    const payload = {
      tripBatchId: batch.id,
      packageId: batch.packageId,
      customerName: customerName.trim(),
      phone: phone.trim(),
      whatsappNumber: whatsappNumber.trim() || undefined,
      email: email.trim() || undefined,
      gender,
      age: age ? Number(age) : undefined,
      address: address.trim() || undefined,
      city: city.trim() || undefined,
      state: state.trim() || undefined,
      pincode: pincode.trim() || undefined,
      emergencyName: emergencyName.trim() || undefined,
      emergencyPhone: emergencyPhone.trim() || undefined,
      travellerCount: Number(travellerCount) || 1,
      totalAmount: Number(totalAmount) || 0,
      paidAmount: Number(paidAmount) || 0,
      paymentMethod,
      paymentReceiver,
      transactionId: transactionId.trim() || undefined,
      bookingStatus,
      boardingPoint: boardingPoint.trim() || undefined,
      pickupLocation: pickupLocation.trim() || undefined,
      transportType,
      trainName: trainName.trim() || undefined,
      trainNumber: trainNumber.trim() || undefined,
      coach: coach.trim() || undefined,
      seatNumber: seatNumber.trim() || undefined,
      boardingTime: boardingTime.trim() || undefined,
      airportName: airportName.trim() || undefined,
      flightNumber: flightNumber.trim() || undefined,
      busOperator: busOperator.trim() || undefined,
      checkInStatus,
      notes: notes.trim() || undefined,
    };

    let res;
    if (editingBooking) {
      res = await updateBatchBooking(editingBooking.id, payload);
    } else {
      res = await createBatchBooking(payload);
    }

    setLoading(false);
    if (res.error) {
      setError(res.error);
    } else {
      setIsAddTravellerModalOpen(false);
    }
  };

  const handleAddPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalBooking) return;

    if (!newPayAmount || newPayAmount <= 0) {
      setError("Payment amount must be greater than 0.");
      return;
    }

    setLoading(true);
    const res = await addPaymentToBooking(paymentModalBooking.id, {
      amount: Number(newPayAmount),
      method: newPayMethod,
      receivedBy: newPayReceiver,
      transactionId: newPayTxnId.trim() || undefined,
      notes: newPayNotes.trim() || undefined,
    });
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setPaymentModalBooking(null);
      setNewPayAmount(0);
      setNewPayReceiver("Rishal");
      setNewPayTxnId("");
      setNewPayNotes("");
    }
  };

  const getTransportIcon = (tType?: string | null) => {
    switch (tType?.toUpperCase()) {
      case "TRAIN":
        return <Train className="w-3.5 h-3.5 text-blue-600" />;
      case "BUS":
        return <Bus className="w-3.5 h-3.5 text-[#3478F6]" />;
      case "FLIGHT":
        return <Plane className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <Car className="w-3.5 h-3.5 text-gray-600" />;
    }
  };

  const getPaymentBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "PAID":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "PARTIALLY PAID":
      case "PARTIALLY_PAID":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PENDING":
        return "bg-red-100 text-red-800 border-red-200";
      case "REFUNDED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getBookingStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "COMPLETED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header Navigation */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8ECF3] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/admin/upcoming-trips"
            className="p-2.5 rounded-2xl bg-[#F3F7FF] hover:bg-[#3478F6] text-[#3478F6] hover:text-white transition-colors flex items-center gap-2 text-xs font-bold min-h-[40px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Upcoming Trips</span>
          </Link>

          <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase bg-[#3478F6]/10 text-[#3478F6] border border-[#3478F6]/20">
            {batch.batchName || "Group Departure Event"}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1026]">{batch.packageTitle}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-gray-600">
              <span className="text-[#3478F6] flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(batch.startDate)} — {formatDate(batch.endDate)}
              </span>
              <span className="text-gray-500 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                Boarding: <strong className="text-[#0B1026]">{batch.departurePoint}</strong> → {batch.arrivalDestination}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <a
              href={`/api/admin/archives/export/${batch.id}`}
              download
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 min-h-[46px] cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </a>

            <button
              onClick={handleOpenAddModal}
              className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 min-h-[46px] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Traveller / Booking</span>
            </button>
          </div>
        </div>

        {/* Archive Expiry Alert Banner if event ended */}
        {(() => {
          const archiveMetrics = calculateArchiveMetrics(batch.endDate, 30);
          if (!archiveMetrics.isPastEvent) return null;
          return (
            <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-extrabold block">Event Completed • Retention Period Active</span>
                  <span className="text-amber-800 font-medium">
                    Archive expires on {formatDate(archiveMetrics.archiveExpiresAt)} ({archiveMetrics.statusText}).
                  </span>
                </div>
              </div>
              <a
                href={`/api/admin/archives/export/${batch.id}`}
                download
                className="inline-flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-xs transition-colors shrink-0"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Download Excel Backup</span>
              </a>
            </div>
          );
        })()}
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Seats Occupancy */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8ECF3] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
            <span>Seat Capacity</span>
            <Users className="w-4 h-4 text-[#3478F6]" />
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-extrabold text-[#0B1026]">{totalBookedSeats}</h3>
            <span className="text-xs font-semibold text-gray-400">/ {batch.totalSeats} seats</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${availableSeats === 0 ? "bg-red-500" : "bg-[#3478F6]"}`}
              style={{ width: `${Math.min(100, (totalBookedSeats / batch.totalSeats) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] font-bold text-emerald-600">
            {availableSeats} seats remaining
          </p>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8ECF3] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
            <span>Total Bookings</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#0B1026]">{confirmedBookings.length}</h3>
          <p className="text-[11px] font-medium text-gray-500">
            {batch.bookings.length} total manifest entries
          </p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8ECF3] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
            <span>Total Revenue</span>
            <IndianRupee className="w-4 h-4 text-[#3478F6]" />
          </div>
          <h3 className="text-2xl font-extrabold text-[#0B1026]">{formatPrice(totalRevenue)}</h3>
          <p className="text-[11px] font-medium text-gray-500">
            Expected total collections
          </p>
        </div>

        {/* Collected & Pending */}
        <div className="bg-white rounded-3xl p-5 border border-[#E8ECF3] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold uppercase tracking-wider">
            <span>Collected / Balance</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-xl font-extrabold text-emerald-600">{formatPrice(totalCollected)}</h3>
            <span className="text-xs font-bold text-red-600">Due: {formatPrice(totalPending)}</span>
          </div>
          <p className="text-[11px] font-medium text-gray-500">
            {totalPending === 0 ? "100% Paid" : `${formatPrice(totalPending)} remaining balance`}
          </p>
        </div>
      </div>

      {/* Event Finance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl p-5 border border-emerald-200 bg-emerald-50/70 shadow-sm">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">Revenue</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{formatPrice(totalRevenue)}</div>
          <div className="text-[11px] font-semibold text-emerald-600 mt-1">{totalBookedSeats} confirmed travellers</div>
        </div>
        <div className="rounded-3xl p-5 border border-amber-200 bg-amber-50/70 shadow-sm">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">Total Expense</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{formatPrice(totalExpense)}</div>
          <div className="text-[11px] font-semibold text-amber-600 mt-1">
            Base {formatPrice(baseExpense)} + Extra {formatPrice(extraExpense)}
          </div>
        </div>
        <div className={`rounded-3xl p-5 border shadow-sm ${estimatedProfit >= 0 ? "border-blue-200 bg-blue-50/70" : "border-red-200 bg-red-50/70"}`}>
          <div className={`text-[11px] font-extrabold uppercase tracking-wider ${estimatedProfit >= 0 ? "text-blue-700" : "text-red-700"}`}>Estimated Profit</div>
          <div className={`text-2xl font-black mt-1 ${estimatedProfit >= 0 ? "text-blue-700" : "text-red-700"}`}>{formatPrice(estimatedProfit)}</div>
          <div className="text-[11px] font-semibold text-gray-500 mt-1">
            Package cost/person: {formatPrice(batch.packageExpensePerPerson || 0)}
          </div>
        </div>
      </div>

      {(batch.eventExpenses || []).length > 0 && (
        <div className="bg-white rounded-3xl border border-[#E8ECF3] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h3 className="font-extrabold text-sm text-[#0B1026]">Event Extra Expenses</h3>
            <Link href="/admin/expenses" className="text-[11px] font-bold text-[#3478F6] hover:underline">Manage Expenses</Link>
          </div>
          <div className="space-y-2">
            {(batch.eventExpenses || []).slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#F8FAFC] border border-[#E8ECF3] px-3 py-2 text-xs">
                <div>
                  <div className="font-bold text-[#0B1026]">{expense.title}</div>
                  <div className="text-[10px] text-gray-500">{expense.category || "Miscellaneous"}</div>
                </div>
                <div className="font-extrabold text-amber-700">{formatPrice(expense.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collection Split */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-3xl p-5 border border-blue-200 bg-blue-50/70 shadow-sm">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">Rishal Collected</div>
          <div className="text-2xl font-black text-blue-700 mt-1">{formatPrice(receiverTotals.rishal)}</div>
          <div className="text-[11px] font-semibold text-blue-500 mt-1">Payments received by Rishal</div>
        </div>
        <div className="rounded-3xl p-5 border border-violet-200 bg-violet-50/70 shadow-sm">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-violet-700">Nihas Collected</div>
          <div className="text-2xl font-black text-violet-700 mt-1">{formatPrice(receiverTotals.nihas)}</div>
          <div className="text-[11px] font-semibold text-violet-500 mt-1">Payments received by Nihas</div>
        </div>
      </div>
      {receiverTotals.unassigned > 0 && (
        <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          Older payments without receiver assignment: {formatPrice(receiverTotals.unassigned)}
        </div>
      )}

      {/* Participant Manifest Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8ECF3] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by traveller name, phone or booking ref ID..."
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#0B1026] outline-none focus:border-[#3478F6]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-[#F3F7FF] border border-[#E8ECF3] rounded-2xl px-3 py-2 text-xs font-bold text-[#0B1026] outline-none"
            >
              <option value="ALL">Payment: All</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PENDING">Pending</option>
            </select>

            {/* Booking Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F3F7FF] border border-[#E8ECF3] rounded-2xl px-3 py-2 text-xs font-bold text-[#0B1026] outline-none"
            >
              <option value="ALL">Status: All</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Transport Filter */}
            <select
              value={transportFilter}
              onChange={(e) => setTransportFilter(e.target.value)}
              className="bg-[#F3F7FF] border border-[#E8ECF3] rounded-2xl px-3 py-2 text-xs font-bold text-[#0B1026] outline-none"
            >
              <option value="ALL">Transport: All</option>
              <option value="TRAIN">Train</option>
              <option value="BUS">Bus</option>
              <option value="FLIGHT">Flight</option>
            </select>
          </div>
        </div>

        {/* Participant Table (Desktop) & Cards (Mobile) */}
        {activeBookings.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E8ECF3] text-gray-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Traveller & Contact</th>
                    <th className="pb-3">Booking Ref</th>
                    <th className="pb-3">Seats</th>
                    <th className="pb-3">Financials & Status</th>
                    <th className="pb-3">Boarding & Transport</th>
                    <th className="pb-3">Booking Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8ECF3]">
                  {activeBookings.map((b) => {
                    const waMessage = `Hello ${b.customerName},\nThis is regarding your ${batch.packageTitle} (${batch.batchName || "Group Departure"}) trip with Dexplora.`;
                    const waLink = getWhatsAppLink(b.whatsappNumber || b.phone, waMessage);

                    return (
                      <tr key={b.id} className="hover:bg-[#F3F7FF]/50 transition-colors">
                        <td className="py-4">
                          <div className="space-y-0.5">
                            <Link
                              href={`/admin/upcoming-trips/${batch.id}/customers/${b.id}`}
                              className="font-extrabold text-[#0B1026] text-sm hover:text-[#3478F6] transition-colors flex items-center gap-1"
                            >
                              <span>{b.customerName}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            </Link>
                            <p className="text-gray-500 font-semibold flex items-center gap-1 text-[11px]">
                              <Phone className="w-3 h-3 text-[#3478F6]" />
                              {b.phone}
                            </p>
                          </div>
                        </td>

                        <td className="py-4 font-bold text-[#3478F6]">
                          {b.bookingRef}
                        </td>

                        <td className="py-4 font-extrabold text-[#0B1026]">
                          {b.travellerCount} {b.travellerCount > 1 ? "Travellers" : "Person"}
                        </td>

                        <td className="py-4 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#0B1026]">{formatPrice(b.totalAmount)}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getPaymentBadgeClass(b.paymentStatus)}`}>
                              {b.paymentStatus}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium">
                            Paid: <strong className="text-emerald-600">{formatPrice(b.paidAmount)}</strong> | Due: <strong className="text-red-500">{formatPrice(b.balanceAmount)}</strong>
                          </p>
                        </td>

                        <td className="py-4 space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-[#0B1026]">
                            {getTransportIcon(b.transportType)}
                            <span>{b.transportType || "Train"}</span>
                            {b.seatNumber && <span className="text-xs text-[#3478F6]">({b.seatNumber})</span>}
                          </div>
                          <p className="text-[11px] text-gray-500 truncate max-w-[180px]">
                            Boarding: {b.boardingPoint || batch.departurePoint}
                          </p>
                        </td>

                        <td className="py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getBookingStatusBadgeClass(b.bookingStatus)}`}>
                            {b.bookingStatus}
                          </span>
                        </td>

                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center cursor-pointer shadow-xs"
                              title="Chat on WhatsApp"
                            >
                              <WhatsAppIcon className="w-3.5 h-3.5" />
                            </a>

                            <Link
                              href={`/admin/upcoming-trips/${batch.id}/customers/${b.id}`}
                              className="px-2.5 py-1.5 bg-[#F3F7FF] hover:bg-[#3478F6] text-[#3478F6] hover:text-white rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                              title="View Customer Profile"
                            >
                              View
                            </Link>

                            <button
                              onClick={() => setPaymentModalBooking(b)}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[11px] font-bold transition-colors cursor-pointer"
                              title="Update Payment"
                            >
                              + Payment
                            </button>

                            <button
                              onClick={() => handleOpenEditModal(b)}
                              className="p-1.5 text-gray-600 hover:text-[#3478F6] hover:bg-[#F3F7FF] rounded-xl transition-colors cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={async () => {
                                if (confirm(`Delete traveller booking "${b.customerName}"?`)) {
                                  await deleteBatchBooking(b.id);
                                }
                              }}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                              title="Delete Booking"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="block lg:hidden space-y-3">
              {activeBookings.map((b) => (
                <div key={b.id} className="bg-[#F8FAFC] border border-[#E8ECF3] rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-[#3478F6] bg-[#3478F6]/10 px-2.5 py-0.5 rounded-lg">
                      {b.bookingRef}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getBookingStatusBadgeClass(b.bookingStatus)}`}>
                      {b.bookingStatus}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-[#0B1026]">{b.customerName}</h3>
                    <p className="text-xs text-gray-500 font-semibold flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-[#3478F6]" />
                      {b.phone}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E8ECF3] text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Financials:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[#0B1026]">{formatPrice(b.totalAmount)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getPaymentBadgeClass(b.paymentStatus)}`}>
                          {b.paymentStatus}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">Paid / Due:</span>
                      <span>
                        Paid: <strong className="text-emerald-600">{formatPrice(b.paidAmount)}</strong> | Due: <strong className="text-red-500">{formatPrice(b.balanceAmount)}</strong>
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">Transport:</span>
                      <span className="font-bold text-[#0B1026] flex items-center gap-1">
                        {getTransportIcon(b.transportType)}
                        {b.transportType || "Train"} {b.seatNumber ? `(${b.seatNumber})` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8ECF3]">
                    <button
                      onClick={() => setPaymentModalBooking(b)}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      + Payment
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(b)}
                      className="p-1.5 text-gray-600 hover:text-[#3478F6] rounded-xl cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete traveller booking "${b.customerName}"?`)) {
                          await deleteBatchBooking(b.id);
                        }
                      }}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded-xl cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-10 space-y-2">
            <Users className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-500 font-medium">No travellers registered yet for this departure batch.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Traveller Modal */}
      {isAddTravellerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 border border-[#E8ECF3] my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8ECF3] pb-4">
              <h2 className="text-lg font-extrabold text-[#0B1026]">
                {editingBooking ? "Edit Traveller & Booking" : "Add Traveller / Booking Record"}
              </h2>
              <button
                onClick={() => setIsAddTravellerModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveTraveller} className="space-y-5">
              {/* Personal Details */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#3478F6]">1. Personal Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      placeholder="e.g. Rahul Nair"
                      className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-[#3478F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="+91 98470 12345"
                      className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-[#3478F6]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1026] mb-1">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+91 98470 12345"
                      className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#3478F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-[#3478F6]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
                      placeholder="28"
                      className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-[#3478F6]"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#3478F6]">2. Emergency Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      placeholder="Relationship / Name"
                      className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#3478F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Emergency Phone</label>
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+91 98470 00000"
                      className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#3478F6]"
                    />
                  </div>
                </div>
              </div>

              {/* Booking & Financials */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#3478F6]">3. Financials & Booking Status</h3>
                
                {/* Unit Price Info Banner */}
                {unitPrice > 0 ? (
                  <div className="bg-[#F3F7FF] border border-[#3478F6]/20 rounded-2xl p-3 flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-bold">Package Unit Rate:</span>
                    <span className="font-extrabold text-[#3478F6] text-sm">{formatPrice(unitPrice)} <span className="text-[11px] font-normal text-gray-500">/ person</span></span>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs font-bold text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Package price is not configured for this trip batch.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Number of Travellers *</label>
                    <input
                      type="number"
                      min="1"
                      value={travellerCount}
                      onChange={(e) => setTravellerCount(Math.max(1, Number(e.target.value)))}
                      required
                      className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-[#3478F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Total Package Price (₹) <span className="text-gray-400 font-normal">(Auto)</span></label>
                    <input
                      type="text"
                      value={formatPrice(unitPrice * Math.max(1, travellerCount))}
                      readOnly
                      disabled
                      className="w-full bg-[#E8ECF3]/40 border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-extrabold text-[#3478F6] cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Initial Paid Amount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(Number(e.target.value))}
                      placeholder="0"
                      className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold text-emerald-600 outline-none focus:border-[#3478F6]"
                    />
                  </div>
                </div>

                {/* Calculation Breakdown & Derived Status */}
                <div className="bg-[#F8FAFC] border border-[#E8ECF3] rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-gray-600 font-medium">
                    Breakdown: <strong className="text-[#0B1026]">{formatPrice(unitPrice)} × {travellerCount} {travellerCount > 1 ? "travellers" : "traveller"}</strong> = <span className="font-extrabold text-[#3478F6]">{formatPrice(unitPrice * Math.max(1, travellerCount))}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-bold text-[11px]">Auto Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      paidAmount >= (unitPrice * travellerCount) && (unitPrice * travellerCount) > 0
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : paidAmount > 0
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-red-100 text-red-800 border-red-200"
                    }`}>
                      {paidAmount >= (unitPrice * travellerCount) && (unitPrice * travellerCount) > 0
                        ? "Paid"
                        : paidAmount > 0
                        ? "Partially Paid"
                        : "Pending"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Received By</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => setPaymentReceiver("Rishal")} className={`rounded-xl px-3 py-2 text-[11px] font-extrabold border transition-all ${paymentReceiver === "Rishal" ? "bg-blue-600 text-white border-blue-600" : "bg-blue-50 text-blue-700 border-blue-200"}`}>Rishal</button>
                      <button type="button" onClick={() => setPaymentReceiver("Nihas")} className={`rounded-xl px-3 py-2 text-[11px] font-extrabold border transition-all ${paymentReceiver === "Nihas" ? "bg-violet-600 text-white border-violet-600" : "bg-violet-50 text-violet-700 border-violet-200"}`}>Nihas</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold text-[#0B1026] outline-none"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Razorpay">Razorpay</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Transaction ID / Ref</label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="UPI Ref # / Bank Txn ID"
                      className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#3478F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Booking Status</label>
                    <select
                      value={bookingStatus}
                      onChange={(e) => setBookingStatus(e.target.value)}
                      className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold text-[#0B1026] outline-none"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Transport & Boarding Details */}
              <div className="space-y-3">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-[#3478F6]">4. Boarding & Transport Details</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Boarding Station / Location</label>
                    <input
                      type="text"
                      value={boardingPoint}
                      onChange={(e) => setBoardingPoint(e.target.value)}
                      placeholder="Kochi / Calicut / Trivandrum"
                      className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold outline-none focus:border-[#3478F6]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0B1026] mb-1">Transport Type</label>
                    <select
                      value={transportType}
                      onChange={(e) => setTransportType(e.target.value)}
                      className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold text-[#0B1026] outline-none"
                    >
                      <option value="Train">Train</option>
                      <option value="Bus">Bus</option>
                      <option value="Flight">Flight</option>
                      <option value="Private Vehicle">Private Vehicle</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Transport Fields */}
                {transportType === "Train" && (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#F8FAFC] p-3 rounded-2xl border border-[#E8ECF3]">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Train Name</label>
                      <input
                        type="text"
                        value={trainName}
                        onChange={(e) => setTrainName(e.target.value)}
                        placeholder="Superfast Express"
                        className="w-full bg-white border rounded-xl px-2.5 py-1.5 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Train #</label>
                      <input
                        type="text"
                        value={trainNumber}
                        onChange={(e) => setTrainNumber(e.target.value)}
                        placeholder="12601"
                        className="w-full bg-white border rounded-xl px-2.5 py-1.5 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Coach</label>
                      <input
                        type="text"
                        value={coach}
                        onChange={(e) => setCoach(e.target.value)}
                        placeholder="S4"
                        className="w-full bg-white border rounded-xl px-2.5 py-1.5 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Seat / Berth #</label>
                      <input
                        type="text"
                        value={seatNumber}
                        onChange={(e) => setSeatNumber(e.target.value)}
                        placeholder="22, 23"
                        className="w-full bg-white border rounded-xl px-2.5 py-1.5 text-xs font-medium"
                      />
                    </div>
                  </div>
                )}

                {transportType === "Flight" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F8FAFC] p-3 rounded-2xl border border-[#E8ECF3]">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Airport</label>
                      <input
                        type="text"
                        value={airportName}
                        onChange={(e) => setAirportName(e.target.value)}
                        placeholder="Kochi (COK)"
                        className="w-full bg-white border rounded-xl px-2.5 py-1.5 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Flight Number</label>
                      <input
                        type="text"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value)}
                        placeholder="6E-452"
                        className="w-full bg-white border rounded-xl px-2.5 py-1.5 text-xs font-medium"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8ECF3]">
                <button
                  type="button"
                  onClick={() => setIsAddTravellerModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E8ECF3] text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Traveller</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {paymentModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E8ECF3]">
            <div className="flex items-center justify-between border-b border-[#E8ECF3] pb-3">
              <h2 className="text-base font-extrabold text-[#0B1026]">
                Record Payment — {paymentModalBooking.customerName}
              </h2>
              <button
                onClick={() => setPaymentModalBooking(null)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#F8FAFC] border border-[#E8ECF3] rounded-2xl p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Total Package Amount:</span>
                <span className="font-bold text-[#0B1026]">{formatPrice(paymentModalBooking.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Already Paid:</span>
                <span className="font-bold text-emerald-600">{formatPrice(paymentModalBooking.paidAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-[#E8ECF3] pt-1">
                <span className="text-gray-500 font-bold">Remaining Due:</span>
                <span className="font-extrabold text-red-600">{formatPrice(paymentModalBooking.balanceAmount)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs font-bold p-2.5 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleAddPaymentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1">Add Payment Amount (₹) *</label>
                <input
                  type="number"
                  min="1"
                  max={paymentModalBooking.balanceAmount || paymentModalBooking.totalAmount}
                  value={newPayAmount || ""}
                  onChange={(e) => setNewPayAmount(Number(e.target.value))}
                  required
                  placeholder={String(paymentModalBooking.balanceAmount)}
                  className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold text-emerald-600 outline-none focus:border-[#3478F6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1">Received By *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setNewPayReceiver("Rishal")} className={`rounded-xl px-3 py-2.5 text-xs font-extrabold border transition-all ${newPayReceiver === "Rishal" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-blue-50 text-blue-700 border-blue-200"}`}>Rishal</button>
                  <button type="button" onClick={() => setNewPayReceiver("Nihas")} className={`rounded-xl px-3 py-2.5 text-xs font-extrabold border transition-all ${newPayReceiver === "Nihas" ? "bg-violet-600 text-white border-violet-600 shadow-sm" : "bg-violet-50 text-violet-700 border-violet-200"}`}>Nihas</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1">Payment Method</label>
                <select
                  value={newPayMethod}
                  onChange={(e) => setNewPayMethod(e.target.value)}
                  className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-bold text-[#0B1026] outline-none"
                >
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Razorpay">Razorpay</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1">Transaction Ref / Txn ID</label>
                <input
                  type="text"
                  value={newPayTxnId}
                  onChange={(e) => setNewPayTxnId(e.target.value)}
                  placeholder="UPI transaction reference"
                  className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2 text-xs font-medium outline-none focus:border-[#3478F6]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalBooking(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Record Payment</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
