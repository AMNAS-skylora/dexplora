"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { Menu, X, User } from "lucide-react";
import { AdminSession } from "@/lib/auth";

interface AdminHeaderProps {
  session: AdminSession | null;
}

export function AdminHeader({ session }: AdminHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="bg-white border-b border-[#E8ECF3] px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl text-[#0B1026] hover:bg-[#F3F7FF] transition-colors"
            aria-label="Toggle admin drawer"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <h2 className="text-base font-extrabold text-[#0B1026]">Admin Control Panel</h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#F3F7FF] border border-[#E8ECF3] px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-[#3478F6] text-white flex items-center justify-center text-xs font-bold">
              {session?.name?.charAt(0) || "A"}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#0B1026] leading-none">
                {session?.name || "Admin"}
              </span>
              <span className="text-[10px] text-[#3478F6] font-semibold leading-none mt-0.5">
                {session?.role || "SUPER_ADMIN"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 flex">
          <AdminSidebar onCloseMobile={() => setMobileOpen(false)} />
          <div className="flex-1" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}
