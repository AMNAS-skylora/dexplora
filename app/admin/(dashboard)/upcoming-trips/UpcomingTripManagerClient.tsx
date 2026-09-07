"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate, formatPrice } from "@/lib/utils";
import { createTripBatch, deleteTripBatch, updateTripBatch } from "@/actions";
import {
  Plus,
  Trash2,
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  Eye,
  Edit3,
  Search,
  Filter,
  IndianRupee,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface PackageOption {
  id: string;
  title: string;
  price: number;
  duration?: string;
  coverImage?: string;
  departureLocation?: string;
  arrivalLocation?: string;
}

interface EnrichedBatch {
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
  duration: string;
  departurePoint: string;
  arrivalDestination: string;
  bookingsCount: number;
  totalTravellers: number;
  totalRevenue: number;
  collectedAmount: number;
  pendingAmount: number;
}

function toSafeInputDate(dateVal: any): string {
  if (!dateVal) return "";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

interface UpcomingTripManagerClientProps {
  batches: EnrichedBatch[];
  packages: PackageOption[];
}

export function UpcomingTripManagerClient({ batches: initialBatches, packages }: UpcomingTripManagerClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<EnrichedBatch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State for Create/Edit
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || "");
  const [batchName, setBatchName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalSeats, setTotalSeats] = useState(30);
  const [status, setStatus] = useState("OPEN");
  const [boardingPoint, setBoardingPoint] = useState("");
  const [notes, setNotes] = useState("");

  const handleOpenCreateModal = () => {
    setEditingBatch(null);
    const defaultPkg = packages[0];
    if (defaultPkg) {
      setSelectedPackageId(defaultPkg.id);
      setBoardingPoint(defaultPkg.departureLocation || "Kerala");
    }
    setBatchName("");
    setStartDate("");
    setEndDate("");
    setTotalSeats(30);
    setStatus("OPEN");
    setNotes("");
    setError(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (b: EnrichedBatch) => {
    setEditingBatch(b);
    setSelectedPackageId(b.packageId);
    setBatchName(b.batchName || "");
    setStartDate(toSafeInputDate(b.startDate));
    setEndDate(toSafeInputDate(b.endDate));
    setTotalSeats(b.totalSeats);
    setStatus(b.status);
    setBoardingPoint(b.boardingPoint || "");
    setNotes(b.notes || "");
    setError(null);
    setIsCreateModalOpen(true);
  };

  const handlePackageChange = (pkgId: string) => {
    setSelectedPackageId(pkgId);
    const pkg = packages.find((p) => p.id === pkgId);
    if (pkg) {
      setBoardingPoint(pkg.departureLocation || "Kerala");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedPackageId) {
      setError("Please select a package.");
      return;
    }
    if (!startDate || !endDate) {
      setError("Start date and End date are required.");
      return;
    }

    setLoading(true);

    if (editingBatch) {
      const res = await updateTripBatch(editingBatch.id, {
        packageId: selectedPackageId,
        batchName: batchName.trim() || undefined,
        startDate,
        endDate,
        totalSeats,
        status: status as any,
        boardingPoint: boardingPoint.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setLoading(false);
      if (res.error) {
        setError(res.error);
      } else {
        setIsCreateModalOpen(false);
      }
    } else {
      const res = await createTripBatch({
        packageId: selectedPackageId,
        batchName: batchName.trim() || undefined,
        startDate,
        endDate,
        totalSeats,
        status: status as any,
        boardingPoint: boardingPoint.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setLoading(false);
      if (res.error) {
        setError(res.error);
      } else {
        setIsCreateModalOpen(false);
      }
    }
  };

  // Filter batches
  const filteredBatches = initialBatches.filter((b) => {
    const matchesSearch =
      b.packageTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.batchName && b.batchName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      b.departurePoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.arrivalDestination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" ||
      b.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalEvents = initialBatches.length;
  const totalCapacity = initialBatches.reduce((acc, b) => acc + b.totalSeats, 0);
  const totalBooked = initialBatches.reduce((acc, b) => acc + b.bookedSeats, 0);
  const totalRevenue = initialBatches.reduce((acc, b) => acc + b.totalRevenue, 0);
  const totalCollected = initialBatches.reduce((acc, b) => acc + b.collectedAmount, 0);

  const getStatusBadgeClass = (st: string) => {
    switch (st.toUpperCase()) {
      case "OPEN":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "FILLING_FAST":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "ALMOST_FULL":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "SOLD_OUT":
      case "FULL":
        return "bg-red-100 text-red-800 border-red-200";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-[#E8ECF3] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#3478F6]/10 text-[#3478F6] flex items-center justify-center shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Scheduled Events</p>
            <h3 className="text-2xl font-extrabold text-[#0B1026]">{totalEvents}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E8ECF3] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Seat Occupancy</p>
            <h3 className="text-2xl font-extrabold text-[#0B1026]">
              {totalBooked} <span className="text-xs font-semibold text-gray-400">/ {totalCapacity}</span>
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E8ECF3] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-xl font-extrabold text-[#0B1026]">{formatPrice(totalRevenue)}</h3>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#E8ECF3] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Collected Amount</p>
            <h3 className="text-xl font-extrabold text-emerald-600">{formatPrice(totalCollected)}</h3>
          </div>
        </div>
      </div>

      {/* Control & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8ECF3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by package title, batch name or location..."
            className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#0B1026] outline-none focus:border-[#3478F6]"
          />
        </div>

        {/* Filters & Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="bg-[#F3F7FF] p-1 rounded-2xl border border-[#E8ECF3] flex items-center gap-1 overflow-x-auto">
            {["ALL", "OPEN", "FILLING_FAST", "SOLD_OUT", "COMPLETED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#3478F6] text-white shadow-xs"
                    : "text-gray-600 hover:text-[#0B1026]"
                }`}
              >
                {st === "ALL" ? "All" : st.replace("_", " ")}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 min-h-[42px] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Departure Batch</span>
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-4">
        {filteredBatches.length > 0 ? (
          filteredBatches.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-[#E8ECF3] p-5 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Package Cover & Information */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-[#E8ECF3]">
                    <Image
                      src={b.packageCoverImage}
                      alt={b.packageTitle}
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadgeClass(b.status)}`}>
                        {b.status.replace("_", " ")}
                      </span>
                      <span className="text-xs font-bold text-[#3478F6] bg-[#3478F6]/10 px-2.5 py-0.5 rounded-lg">
                        {b.batchName || "Standard Departure"}
                      </span>
                      <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {b.duration}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-extrabold text-[#0B1026] truncate">
                      {b.packageTitle}
                    </h2>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-bold text-gray-600">
                      <span className="text-[#3478F6] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(b.startDate)} — {formatDate(b.endDate)}
                      </span>
                      <span className="flex items-center gap-1 text-gray-500">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {b.departurePoint} <ArrowRight className="w-3 h-3 text-gray-400" /> {b.arrivalDestination}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seat Occupancy & Revenue Pills */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 lg:gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#E8ECF3]">
                  {/* Seats Progress */}
                  <div className="space-y-1 w-full sm:w-40">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-gray-500">Seats</span>
                      <span className="text-[#0B1026]">{b.bookedSeats} / {b.totalSeats} Booked</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          b.availableSeats === 0
                            ? "bg-red-500"
                            : b.availableSeats <= 5
                            ? "bg-amber-500"
                            : "bg-[#3478F6]"
                        }`}
                        style={{ width: `${Math.min(100, (b.bookedSeats / b.totalSeats) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-emerald-600 font-bold text-right">
                      {b.availableSeats} seats remaining
                    </p>
                  </div>

                  {/* Revenue Summary */}
                  <div className="bg-[#F8FAFC] border border-[#E8ECF3] rounded-2xl p-3 text-xs space-y-1 w-full sm:w-44">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-gray-500">Revenue:</span>
                      <span className="font-extrabold text-[#0B1026]">{formatPrice(b.totalRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-gray-500">Collected:</span>
                      <span className="font-extrabold text-emerald-600">{formatPrice(b.collectedAmount)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Link
                      href={`/admin/upcoming-trips/${b.id}`}
                      className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 min-h-[38px] cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manage Event</span>
                    </Link>

                    <button
                      onClick={() => handleOpenEditModal(b)}
                      className="p-2 text-gray-600 hover:text-[#3478F6] hover:bg-[#F3F7FF] rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer border border-[#E8ECF3]"
                      title="Edit Batch"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <form
                      action={async () => {
                        if (confirm(`Delete departure batch "${b.batchName || b.packageTitle}"?`)) {
                          await deleteTripBatch(b.id);
                        }
                      }}
                    >
                      <button
                        type="submit"
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer border border-red-100"
                        title="Delete Batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8ECF3] space-y-3">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-base font-extrabold text-[#0B1026]">No Departure Batches Found</h3>
            <p className="text-xs text-gray-500">
              No departure events match your search filters. Click above to schedule a new batch.
            </p>
          </div>
        )}
      </div>

      {/* Create / Edit Departure Batch Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 border border-[#E8ECF3] my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8ECF3] pb-4">
              <h2 className="text-lg font-extrabold text-[#0B1026]">
                {editingBatch ? "Edit Departure Batch Event" : "Schedule Departure Batch Event"}
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
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

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Select Package */}
              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1">Select Package *</label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => handlePackageChange(e.target.value)}
                  required
                  className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0B1026] outline-none focus:border-[#3478F6] min-h-[44px]"
                >
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({formatPrice(p.price)}) — {p.duration || "N/A"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Name */}
              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1">Batch Name (Optional)</label>
                <input
                  type="text"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  placeholder="e.g. September Autumn Group Special"
                  className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#3478F6]"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B1026] mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0B1026] outline-none focus:border-[#3478F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1026] mb-1">End Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0B1026] outline-none focus:border-[#3478F6]"
                  />
                </div>
              </div>

              {/* Seats & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B1026] mb-1">Total Seats Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    value={totalSeats}
                    onChange={(e) => setTotalSeats(Number(e.target.value))}
                    required
                    className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-[#3478F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1026] mb-1">Event Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0B1026] outline-none focus:border-[#3478F6]"
                  >
                    <option value="OPEN">Open</option>
                    <option value="FILLING_FAST">Filling Fast</option>
                    <option value="ALMOST_FULL">Almost Full</option>
                    <option value="SOLD_OUT">Sold Out / Full</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Boarding Point */}
              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1">Departure Boarding Point</label>
                <input
                  type="text"
                  value={boardingPoint}
                  onChange={(e) => setBoardingPoint(e.target.value)}
                  placeholder="e.g. Kochi Railway Station / Calicut Airport"
                  className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#3478F6]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1">Notes / Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional internal notes for tour leaders & admin..."
                  className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#3478F6]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E8ECF3] text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer min-h-[42px]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 min-h-[42px] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingBatch ? "Update Batch" : "Schedule Departure"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
