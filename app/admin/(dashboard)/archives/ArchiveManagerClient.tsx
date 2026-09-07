"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { updateArchiveSettingsAction } from "@/actions";
import { SafeArchiveDeleteModal } from "@/components/admin/SafeArchiveDeleteModal";
import {
  Archive,
  Clock,
  Download,
  FileSpreadsheet,
  ShieldAlert,
  Settings,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Calendar,
  Users,
  History,
  Trash2,
} from "lucide-react";

interface ArchiveManagerClientProps {
  initialData: any;
}

export function ArchiveManagerClient({ initialData }: ArchiveManagerClientProps) {
  const router = useRouter();

  const [autoCleanupEnabled, setAutoCleanupEnabled] = useState<boolean>(
    Boolean(initialData?.autoCleanupEnabled)
  );
  const [retentionDays, setRetentionDays] = useState<number>(
    Number(initialData?.retentionDays) || 30
  );

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const [selectedArchiveItem, setSelectedArchiveItem] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const activeArchives = initialData?.activeArchives || [];
  const auditLogs = initialData?.auditLogs || [];

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSuccess(null);
    setSettingsError(null);

    const res = await updateArchiveSettingsAction({
      autoCleanupEnabled,
      retentionDays,
    });

    setIsSavingSettings(false);

    if (res.error) {
      setSettingsError(res.error);
    } else {
      setSettingsSuccess("Archive settings saved successfully!");
      setTimeout(() => {
        setSettingsSuccess(null);
        router.refresh();
      }, 1500);
    }
  };

  const handleOpenDeleteModal = (item: any) => {
    setSelectedArchiveItem(item);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Archive className="w-6 h-6 text-[#3478F6]" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B1026]">
              Booking Data Archives & Retention
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage completed event backups, export Excel manifests, and configure automatic data retention rules.
          </p>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Pending Archives
          </span>
          <div className="text-3xl font-black text-[#0B1026]">
            {initialData?.pendingArchivesCount || 0}
          </div>
          <span className="text-[11px] text-[#3478F6] font-semibold block">
            Completed departures awaiting cleanup
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Expiring Within 7 Days
          </span>
          <div className="text-3xl font-black text-amber-600">
            {initialData?.expiringWithin7DaysCount || 0}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold block">
            Urgent Excel backup required
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Total Archived Bookings
          </span>
          <div className="text-3xl font-black text-[#0B1026]">
            {initialData?.totalArchivedBookings || 0}
          </div>
          <span className="text-[11px] text-gray-500 font-semibold block">
            Records in past event departures
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-1">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
            Auto-Cleanup Job
          </span>
          <div className="flex items-center gap-2 pt-1">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                autoCleanupEnabled
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {autoCleanupEnabled ? "ON (Active)" : "OFF (Manual)"}
            </span>
          </div>
          <span className="text-[11px] text-gray-500 font-semibold block pt-1">
            {retentionDays}-day retention period
          </span>
        </div>
      </div>

      {/* Settings Section Card */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Settings className="w-5 h-5 text-[#3478F6]" />
          <h2 className="text-base font-extrabold text-[#0B1026]">
            Data Retention & Cleanup Configuration
          </h2>
        </div>

        {settingsSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{settingsSuccess}</span>
          </div>
        )}

        {settingsError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{settingsError}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1.5">
              Retention Duration
            </label>
            <select
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#0B1026] outline-none focus:bg-white focus:border-[#3478F6]"
            >
              <option value={7}>7 Days after event completion</option>
              <option value={15}>15 Days after event completion</option>
              <option value={30}>30 Days after event completion (Recommended)</option>
              <option value={60}>60 Days after event completion</option>
              <option value={90}>90 Days after event completion</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1.5">
              Automatic Scheduled Deletion
            </label>
            <label className="flex items-center gap-3 h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoCleanupEnabled}
                onChange={(e) => setAutoCleanupEnabled(e.target.checked)}
                className="w-4 h-4 text-[#3478F6] rounded border-gray-300 focus:ring-[#3478F6]"
              />
              <span className="text-xs font-bold text-[#0B1026]">
                Enable Auto Cleanup (ON)
              </span>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSavingSettings}
              className="w-full h-11 inline-flex items-center justify-center gap-2 bg-[#3478F6] hover:bg-[#2563EB] text-white rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSavingSettings ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Retention Rules</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Active Pending Archives Section */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-extrabold text-[#0B1026]">
              Completed Events Pending Archive Backup
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-500">
            {activeArchives.length} Completed Event Departures
          </span>
        </div>

        {activeArchives.length === 0 ? (
          <div className="p-8 text-center space-y-2 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto" />
            <h3 className="text-xs font-bold text-[#0B1026]">No Pending Event Archives</h3>
            <p className="text-xs text-gray-500">
              All past tour event booking records have been exported or cleaned up cleanly.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeArchives.map((item: any) => {
              const { daysRemaining, urgencyLevel, archiveExpiresAt } = item.metrics;

              let badgeBg = "bg-blue-100 text-blue-800 border-blue-200";
              if (urgencyLevel === "EXPIRED" || daysRemaining <= 0) {
                badgeBg = "bg-red-600 text-white animate-pulse font-black";
              } else if (urgencyLevel === "URGENT") {
                badgeBg = "bg-red-100 text-red-700 border-red-200 font-extrabold";
              } else if (urgencyLevel === "STRONG") {
                badgeBg = "bg-amber-100 text-amber-800 border-amber-200 font-bold";
              }

              return (
                <div
                  key={item.id}
                  className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200/80 hover:border-gray-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-200 border border-gray-200 shrink-0">
                      <Image
                        src={item.packageCoverImage}
                        alt={item.packageTitle}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${badgeBg}`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>
                            {daysRemaining <= 0
                              ? "Deletes Today"
                              : `${daysRemaining} days remaining`}
                          </span>
                        </span>

                        <span className="text-[11px] font-bold text-gray-500">
                          {item.batchName} ({formatDate(item.startDate)} - {formatDate(item.endDate)})
                        </span>
                      </div>

                      <h3 className="text-sm font-extrabold text-[#0B1026] truncate">
                        {item.packageTitle}
                      </h3>

                      <div className="flex items-center gap-4 text-xs font-semibold text-gray-600">
                        <span>Bookings: <strong className="text-[#0B1026]">{item.bookingsCount} Records</strong></span>
                        <span>Archive Expiry: <strong className="text-gray-800">{formatDate(archiveExpiresAt)}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <a
                      href={`/api/admin/archives/export/${item.id}`}
                      download
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-gray-600" />
                      <span>Download Excel</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleOpenDeleteModal(item)}
                      className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Download & Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Audit History Log Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <History className="w-5 h-5 text-[#3478F6]" />
          <h2 className="text-base font-extrabold text-[#0B1026]">
            Export & Archive Cleanup Audit History
          </h2>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No export or cleanup audit logs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="pb-3">Event / Package Title</th>
                  <th className="pb-3">Action Type</th>
                  <th className="pb-3">Records Cleaned</th>
                  <th className="pb-3">Executed By</th>
                  <th className="pb-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log: any, idx: number) => (
                  <tr key={log.id || idx} className="hover:bg-gray-50/60">
                    <td className="py-3 font-bold text-[#0B1026]">{log.packageTitle}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          log.status === "EXPORTED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : log.status === "AUTO_CLEANED"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-[#0B1026]">{log.recordCount} Records</td>
                    <td className="py-3 text-gray-600 font-medium">{log.exportedBy || "Admin"}</td>
                    <td className="py-3 text-right text-gray-500 font-medium">
                      {formatDate(log.exportedAt || log.deletedAt || log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedArchiveItem && (
        <SafeArchiveDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedArchiveItem(null);
          }}
          onSuccess={() => router.refresh()}
          archiveItem={selectedArchiveItem}
        />
      )}
    </div>
  );
}
