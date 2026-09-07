"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";
import { SafeArchiveDeleteModal } from "./SafeArchiveDeleteModal";
import {
  AlertTriangle,
  Download,
  Clock,
  ShieldAlert,
  X,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export interface ArchiveItemData {
  id: string;
  batchName?: string;
  packageId: string;
  packageTitle: string;
  packageCoverImage?: string;
  startDate: string | Date;
  endDate: string | Date;
  bookingsCount: number;
  metrics: {
    isPastEvent: boolean;
    eventEndDate: Date | string;
    archiveExpiresAt: Date | string;
    daysRemaining: number;
    urgencyLevel: "NORMAL" | "STRONG" | "URGENT" | "EXPIRED";
    statusText: string;
  };
}

interface ArchiveWarningBannerProps {
  archives: ArchiveItemData[];
}

export function ArchiveWarningBanner({ archives }: ArchiveWarningBannerProps) {
  const [selectedItem, setSelectedItem] = useState<ArchiveItemData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSnoozed, setIsSnoozed] = useState(false);

  useEffect(() => {
    try {
      const snoozeTime = localStorage.getItem("dexplora_archive_warning_snooze");
      if (snoozeTime) {
        const snoozeDate = new Date(parseInt(snoozeTime, 10));
        // Check if 24 hours have passed since snooze
        if (new Date().getTime() - snoozeDate.getTime() < 24 * 60 * 60 * 1000) {
          setIsSnoozed(true);
        } else {
          localStorage.removeItem("dexplora_archive_warning_snooze");
        }
      }
    } catch (e) {
      // Ignore localstorage errors
    }
  }, []);

  const handleSnooze = () => {
    try {
      localStorage.setItem("dexplora_archive_warning_snooze", String(new Date().getTime()));
    } catch (e) {
      // Ignore
    }
    setIsSnoozed(true);
  };

  if (!archives || archives.length === 0 || isSnoozed) return null;

  const handleOpenDeleteModal = (item: ArchiveItemData) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {archives.map((item) => {
        const { daysRemaining, urgencyLevel, archiveExpiresAt } = item.metrics;

        let badgeBg = "bg-blue-50 text-blue-700 border-blue-200";
        let cardBg = "bg-gradient-to-r from-blue-50/80 via-white to-blue-50/30 border-blue-200";
        let iconBg = "bg-blue-100 text-blue-600";

        if (urgencyLevel === "EXPIRED" || daysRemaining <= 0) {
          badgeBg = "bg-red-600 text-white animate-pulse";
          cardBg = "bg-gradient-to-r from-red-100 via-white to-red-50 border-red-300 shadow-md";
          iconBg = "bg-red-600 text-white";
        } else if (urgencyLevel === "URGENT") {
          badgeBg = "bg-red-100 text-red-700 border-red-200 font-black";
          cardBg = "bg-gradient-to-r from-red-50 via-white to-orange-50/40 border-red-200/90 shadow-sm";
          iconBg = "bg-red-100 text-red-600";
        } else if (urgencyLevel === "STRONG") {
          badgeBg = "bg-amber-100 text-amber-800 border-amber-200";
          cardBg = "bg-gradient-to-r from-amber-50/80 via-white to-amber-50/30 border-amber-200";
          iconBg = "bg-amber-100 text-amber-700";
        }

        return (
          <div
            key={item.id}
            className={`rounded-3xl p-4 sm:p-5 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${cardBg}`}
          >
            <div className="flex items-start gap-3.5 min-w-0">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
                <ShieldAlert className="w-5 h-5" />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${badgeBg}`}>
                    <Clock className="w-3 h-3" />
                    <span>
                      {daysRemaining <= 0
                        ? "Deletes Today"
                        : `${daysRemaining} ${daysRemaining === 1 ? "day" : "days"} remaining`}
                    </span>
                  </span>

                  <span className="text-[11px] font-bold text-gray-500">
                    Event ended {formatDate(item.endDate)}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-extrabold text-[#0B1026] truncate">
                  ⚠ Booking Data Expiring Soon: {item.packageTitle}
                </h3>

                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  Contains <strong className="text-[#0B1026] font-extrabold">{item.bookingsCount} booking records</strong>. Records will be permanently deleted on{" "}
                  <strong className="text-[#0B1026] font-bold">{formatDate(archiveExpiresAt)}</strong>. Download the Excel backup before deletion.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <button
                type="button"
                onClick={handleSnooze}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title="Remind me tomorrow"
              >
                Remind later
              </button>

              <button
                type="button"
                onClick={() => handleOpenDeleteModal(item)}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer min-h-[40px]"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Excel & Delete Data</span>
              </button>
            </div>
          </div>
        );
      })}

      {selectedItem && (
        <SafeArchiveDeleteModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
          archiveItem={selectedItem}
        />
      )}
    </div>
  );
}
