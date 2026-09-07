"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/actions";
import { BrandLogo } from "@/components/public/BrandLogo";
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, RefreshCw } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAdmin(formData);

    setLoading(false);
    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/admin/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-[100dvh] w-full bg-[#050A24] flex items-center justify-center p-4 sm:p-6 overflow-x-hidden selection:bg-[#3478F6] selection:text-white">
      <div className="w-full max-w-[440px] bg-white rounded-3xl p-6 sm:p-9 border border-white/10 shadow-2xl shadow-black/50 space-y-6 my-auto">
        
        {/* Branding Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3 sm:mb-4">
            <BrandLogo
              variant="header"
              priority
              className="flex justify-center"
              imageClassName="w-[44px] min-[360px]:w-[48px] sm:w-auto h-auto object-contain shrink-0"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B1026] tracking-tight">
            Admin Portal
          </h1>
          <p className="text-xs sm:text-sm text-[#667085] font-medium leading-relaxed max-w-[340px] mx-auto mt-1 sm:mt-1.5">
            Sign in to manage website packages, bookings & content.
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200/80 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                name="email"
                required
                autoComplete="off"
                placeholder="Enter email address"
                className="w-full h-12 bg-gray-50/80 border border-gray-200 rounded-xl pl-10 pr-4 text-xs font-semibold text-[#0B1026] placeholder:text-gray-400 focus:bg-white focus:border-[#3478F6] focus:ring-2 focus:ring-[#3478F6]/20 outline-none transition-all text-base sm:text-xs"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-[#0B1026] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                autoComplete="current-password"
                placeholder="Enter password"
                className="w-full h-12 bg-gray-50/80 border border-gray-200 rounded-xl pl-10 pr-11 text-xs font-semibold text-[#0B1026] placeholder:text-gray-400 focus:bg-white focus:border-[#3478F6] focus:ring-2 focus:ring-[#3478F6]/20 outline-none transition-all text-base sm:text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#3478F6] hover:bg-[#2563EB] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#3478F6]/25 hover:shadow-xl hover:shadow-[#3478F6]/35 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px] mt-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign in to Dashboard</span>
                <ArrowRight className="w-4 h-4 stroke-[2.2]" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-1 border-t border-gray-100">
          <span className="text-[11px] text-[#667085] font-medium leading-tight block">
            Protected Admin Management System • Dexplora Tour Planners
          </span>
        </div>

      </div>
    </div>
  );
}
