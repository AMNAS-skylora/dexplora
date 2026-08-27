"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/actions";
import { BrandLogo } from "@/components/public/BrandLogo";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAdmin(formData);

    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[#050A24] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-2xl max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <BrandLogo variant="admin" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#0B1026] pt-1">Admin Portal</h1>
          <p className="text-xs text-[#667085]">Sign in to manage website packages, bookings & content.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-[#DC2626] p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                required
                defaultValue="admin@dexplora.com"
                placeholder="admin@dexplora.com"
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-[#3478F6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                required
                defaultValue="DexploraAdmin2026!"
                placeholder="••••••••"
                className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl pl-10 pr-4 py-3 text-xs font-medium focus:outline-none focus:border-[#3478F6]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3478F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-[11px] text-[#667085]">
            Protected Admin Management System • Dexplora Tour Planners
          </span>
        </div>
      </div>
    </div>
  );
}
