"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/public/BrandLogo";
import { AdminSession } from "@/lib/auth";

interface AdminHeaderProps {
  session: AdminSession | null;
}

export function AdminHeader({ session }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-[#E8ECF3] px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile Header Logo (< 768px) */}
        <div className="block md:hidden">
          <Link href="/admin/dashboard" className="inline-flex items-center">
            <BrandLogo variant="admin_mobile" />
          </Link>
        </div>

        {/* Desktop Title (>= 768px) */}
        <h2 className="hidden md:block text-base font-extrabold text-[#0B1026]">
          Admin Control Panel
        </h2>
      </div>

      {/* User Session Avatar / Role */}
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
  );
}
