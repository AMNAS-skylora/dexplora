"use client";

import { useState } from "react";
import Image from "next/image";
import { createDestination, updateDestination, deleteDestination } from "@/actions";
import {
  Plus,
  Trash2,
  Edit3,
  Search,
  MapPin,
  X,
  Loader2,
  AlertCircle,
  Package,
  CheckCircle2,
} from "lucide-react";
import { DestinationUploader } from "@/components/admin/DestinationUploader";

export interface DestinationItem {
  id: string;
  name: string;
  state?: string | null;
  country?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  coverImage?: string | null;
  shortDescription?: string | null;
  packageCount?: number;
  _count?: { packages: number };
  active?: boolean;
  isActive?: boolean;
}

interface DestinationManagerClientProps {
  destinations: DestinationItem[];
}

export function DestinationManagerClient({ destinations: initialDestinations }: DestinationManagerClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<DestinationItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string }>({});

  // Form State
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<DestinationItem | null>(null);

  const handleOpenCreateModal = () => {
    setEditingDest(null);
    setName("");
    setState("");
    setCountry("India");
    setImageUrl("");
    setImagePublicId("");
    setIsActive(true);
    setError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (d: DestinationItem) => {
    setEditingDest(d);
    setName(d.name?.trim() || "");
    setState(d.state?.trim() || "");
    setCountry(d.country?.trim() || "India");
    setImageUrl(d.imageUrl || d.coverImage || "");
    setImagePublicId(d.imagePublicId || "");
    setIsActive(d.active !== undefined ? d.active : (d.isActive !== undefined ? d.isActive : true));
    setError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFieldErrors({ name: "Destination name is required." });
      return;
    }

    setLoading(true);

    const payload = {
      name: trimmedName,
      state: state.trim() || "",
      country: country.trim() || "India",
      imageUrl: imageUrl.trim() || undefined,
      imagePublicId: imagePublicId.trim() || undefined,
      active: isActive,
      isActive,
    };

    let res;
    if (editingDest) {
      res = await updateDestination(editingDest.id, payload);
    } else {
      res = await createDestination(payload);
    }

    setLoading(false);

    if (res.error) {
      setError(res.error);
      if (res.error.toLowerCase().includes("exists")) {
        setFieldErrors({ name: res.error });
      }
    } else {
      setIsModalOpen(false);
    }
  };

  const handleDeleteClick = (d: DestinationItem) => {
    const packageCount = d.packageCount ?? d._count?.packages ?? 0;
    if (packageCount > 0) {
      alert(`This destination is used by ${packageCount} package${packageCount === 1 ? "" : "s"}. Please reassign or delete linked packages first.`);
      return;
    }
    setDeleteTarget(d);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    const res = await deleteDestination(deleteTarget.id);
    setLoading(false);
    if (res.error) {
      alert(res.error);
    }
    setDeleteTarget(null);
  };

  // Filtered Destinations
  const filtered = initialDestinations.filter((d) => {
    const matchesSearch =
      (d.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (d.state?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (d.country?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    const activeState = d.active !== undefined ? d.active : (d.isActive !== undefined ? d.isActive : true);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && activeState) ||
      (statusFilter === "INACTIVE" && !activeState);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Control & Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8ECF3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search destinations by name, state or country..."
            className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#0B1026] outline-none focus:border-[#3478F6]"
          />
        </div>

        {/* Status Filter & Create Action */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#F3F7FF] p-1 rounded-2xl border border-[#E8ECF3] flex items-center gap-1">
            {["ALL", "ACTIVE", "INACTIVE"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#3478F6] text-white shadow-xs"
                    : "text-gray-600 hover:text-[#0B1026]"
                }`}
              >
                {st === "ALL" ? "All" : st === "ACTIVE" ? "Active" : "Inactive"}
              </button>
            ))}
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 min-h-[42px] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination</span>
          </button>
        </div>
      </div>

      {/* Destinations Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((d) => {
            const img = d.imageUrl || d.coverImage;
            const packageCount = d.packageCount ?? d._count?.packages ?? 0;
            const isAct = d.active !== undefined ? d.active : (d.isActive !== undefined ? d.isActive : true);

            return (
              <div
                key={d.id}
                className="bg-white rounded-3xl border border-[#E8ECF3] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Cover Image */}
                <div className="relative w-full aspect-[16/10] bg-gray-100 border-b border-[#E8ECF3]">
                  {img ? (
                    <Image
                      src={img}
                      alt={d.name || "Destination Image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 350px"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#3478F6] bg-[#F3F7FF]/50 p-4">
                      <MapPin className="w-8 h-8 opacity-50 mb-1" />
                      <span className="text-[11px] font-bold text-gray-400">No Image Uploaded</span>
                    </div>
                  )}

                  {/* Status Pill */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border shadow-xs ${
                        isAct
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {isAct ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-[#0B1026] truncate">{d.name || "Unnamed Destination"}</h3>
                    <p className="text-xs text-[#3478F6] font-bold">
                      {[d.state, d.country || "India"].filter(Boolean).join(", ")}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E8ECF3] text-xs">
                    <span className="text-gray-500 font-medium flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-gray-400" />
                      <strong className="text-[#0B1026] font-bold">{packageCount}</strong> {packageCount === 1 ? "package" : "packages"}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(d)}
                        className="p-1.5 text-gray-600 hover:text-[#3478F6] hover:bg-[#F3F7FF] rounded-xl transition-colors cursor-pointer"
                        title="Edit Destination"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(d)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Destination"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8ECF3] space-y-3">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-extrabold text-[#0B1026]">No Destinations Found</h3>
          <p className="text-xs text-gray-500">
            No travel destinations match your search. Add your first destination to get started.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-colors cursor-pointer inline-flex items-center gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Destination</span>
          </button>
        </div>
      )}

      {/* Add / Edit Destination Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-[#E8ECF3] my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8ECF3] pb-4">
              <h2 className="text-lg font-extrabold text-[#0B1026]">
                {editingDest ? "Edit Destination" : "Add New Destination"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Destination Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0B1026] mb-1">Destination Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  required
                  placeholder="e.g. Meghalaya"
                  className={`w-full bg-[#F3F7FF] border rounded-xl px-3.5 py-2.5 text-xs font-bold transition-colors outline-none min-h-[44px] ${
                    fieldErrors.name
                      ? "border-red-500 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-500/20"
                      : "border-[#E8ECF3] text-[#0B1026] focus:border-[#3478F6]"
                  }`}
                />
                {fieldErrors.name && (
                  <p role="alert" className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.name}</span>
                  </p>
                )}
              </div>

              {/* State & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B1026] mb-1">State / Region</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Meghalaya / Kerala"
                    className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#3478F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1026] mb-1">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="India"
                    className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#3478F6]"
                  />
                </div>
              </div>

              {/* Image Uploader */}
              <DestinationUploader
                value={imageUrl}
                onChange={(url, publicId) => {
                  setImageUrl(url);
                  if (publicId) setImagePublicId(publicId);
                }}
              />

              {/* Active Status Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0B1026]">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-[#3478F6]"
                  />
                  <span>Active Destination (Visible in site package filters)</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8ECF3]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                    <span>{editingDest ? "Update Destination" : "Save Destination"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E8ECF3]">
            <div className="flex items-center justify-between border-b border-[#E8ECF3] pb-3">
              <h2 className="text-base font-extrabold text-[#0B1026]">Confirm Delete Destination</h2>
              <button onClick={() => setDeleteTarget(null)} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 font-medium">
              Are you sure you want to delete destination <strong className="text-[#0B1026]">&quot;{deleteTarget.name}&quot;</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Delete Destination</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
