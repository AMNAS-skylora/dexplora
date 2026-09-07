"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { deleteArchivedBatchBookingsAction } from "@/actions";
import {
  AlertTriangle,
  Download,
  Trash2,
  X,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  Calendar,
  FileSpreadsheet,
  Clock,
  ArrowRight,
} from "lucide-react";

interface SafeArchiveDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  archiveItem: {
    id: string;
    packageTitle: string;
    batchName?: string;
    startDate: string | Date;
    endDate: string | Date;
    bookingsCount: number;
    metrics: {
      daysRemaining: number;
      archiveExpiresAt: Date | string;
      urgencyLevel: string;
    };
  };
}

export function SafeArchiveDeleteModal({
  isOpen,
  onClose,
  onSuccess,
  archiveItem,
}: SafeArchiveDeleteModalProps) {
  const [step, setStep] = useState<"CHOICE" | "EXPORTING" | "COUNTDOWN" | "DELETING" | "DONE">("CHOICE");
  const [countdown, setCountdown] = useState(15);
  const [error, setError] = useState<string | null>(null);
  const [isExportingOnly, setIsExportingOnly] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setStep("CHOICE");
      setCountdown(15);
      setError(null);
      setIsExportingOnly(false);
    }
  }, [isOpen]);

  // 15-second countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (step === "COUNTDOWN") {
      if (countdown > 0) {
        interval = setInterval(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        // Countdown reached 0 -> execute actual deletion
        executeDeletion();
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, countdown]);

  if (!isOpen || !archiveItem) return null;

  const handleDownloadOnly = async () => {
    setIsExportingOnly(true);
    setError(null);

    try {
      // Trigger API download
      const link = document.createElement("a");
      link.href = `/api/admin/archives/export/${archiveItem.id}`;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setIsExportingOnly(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setIsExportingOnly(false);
      setError(err?.message || "Failed to download Excel file.");
    }
  };

  const handleStartExportAndDelete = async () => {
    setStep("EXPORTING");
    setError(null);

    try {
      // Step 1: Trigger Excel download
      const link = document.createElement("a");
      link.href = `/api/admin/archives/export/${archiveItem.id}`;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Step 2: Transition to 15-second countdown step after export initiates
      setTimeout(() => {
        setCountdown(15);
        setStep("COUNTDOWN");
      }, 1200);
    } catch (err: any) {
      setStep("CHOICE");
      setError("Excel export failed. Your booking data was NOT deleted. Please try again.");
    }
  };

  const handleCancelCountdown = () => {
    setStep("CHOICE");
    setCountdown(15);
    onClose();
  };

  const executeDeletion = async () => {
    setStep("DELETING");
    setError(null);

    const res = await deleteArchivedBatchBookingsAction(archiveItem.id);

    if (res.error) {
      setError(res.error);
      setStep("CHOICE");
    } else {
      setStep("DONE");
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-gray-100 my-auto relative">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#0B1026]">
                Archive Data & Excel Backup
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {archiveItem.packageTitle} ({formatDate(archiveItem.startDate)})
              </p>
            </div>
          </div>

          {step !== "COUNTDOWN" && step !== "DELETING" && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-4 rounded-2xl flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: INITIAL CHOICE */}
        {step === "CHOICE" && (
          <div className="space-y-5">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-semibold">Associated Bookings:</span>
                <span className="font-extrabold text-[#0B1026] text-sm">{archiveItem.bookingsCount} Records</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500 font-semibold">Retention Countdown:</span>
                <span className="font-extrabold text-amber-600">
                  {archiveItem.metrics.daysRemaining} days remaining
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-200/60">
                <span className="text-gray-500 font-semibold">Scheduled Deletion Date:</span>
                <span className="font-bold text-gray-700">{formatDate(archiveItem.metrics.archiveExpiresAt)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Downloading the Excel backup creates a complete <code>.xlsx</code> record containing customer names, contact numbers, payment status, boarding points, and seat assignments.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadOnly}
                disabled={isExportingOnly}
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-xl font-bold text-xs transition-all cursor-pointer border border-gray-200"
              >
                {isExportingOnly ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 text-gray-600" />
                )}
                <span>Download Excel Only</span>
              </button>

              <button
                type="button"
                onClick={handleStartExportAndDelete}
                className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Excel & Delete Data</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: EXPORTING */}
        {step === "EXPORTING" && (
          <div className="py-8 text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-[#3478F6] animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[#0B1026]">Generating Excel Archive...</h3>
              <p className="text-xs text-gray-500">Preparing manifest file for download.</p>
            </div>
          </div>
        )}

        {/* STEP 3: 15-SECOND COUNTDOWN WITH UNDO */}
        {step === "COUNTDOWN" && (
          <div className="py-4 text-center space-y-6">
            <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 space-y-4">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center rounded-full bg-red-600 text-white text-3xl font-black shadow-lg ring-4 ring-red-200 animate-pulse">
                {countdown}
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-red-900">
                  Excel Archive Generated!
                </h3>
                <p className="text-xs font-bold text-red-700 max-w-sm mx-auto">
                  Deleting {archiveItem.bookingsCount} booking records for "{archiveItem.packageTitle}" in {countdown} seconds.
                </p>
              </div>

              <p className="text-[11px] text-red-600 italic">
                Press "Cancel Delete" below to keep your database records intact.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleCancelCountdown}
                className="w-full bg-gray-900 hover:bg-black text-white text-xs font-black py-3.5 px-6 rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 ring-2 ring-gray-400/50"
              >
                <X className="w-4 h-4 text-red-400 stroke-[3]" />
                <span>CANCEL DELETE (KEEP DATA)</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DELETING */}
        {step === "DELETING" && (
          <div className="py-8 text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-red-600 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[#0B1026]">Cleaning Up Booking Data...</h3>
              <p className="text-xs text-gray-500">Removing archived records from database.</p>
            </div>
          </div>
        )}

        {/* STEP 5: DONE */}
        {step === "DONE" && (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-green-900">Archive Cleanup Complete</h3>
              <p className="text-xs text-green-700">Booking records deleted safely. Package metadata remains intact.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
