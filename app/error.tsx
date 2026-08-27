"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-16 h-16 rounded-full bg-red-100 text-[#DC2626] flex items-center justify-center">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-[#0B1026]">Something went wrong!</h2>
      <p className="text-xs text-[#667085] max-w-sm">
        We encountered an error loading this page. Please try again or return to the homepage.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="bg-[#3478F6] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-bold text-xs"
        >
          Homepage
        </Link>
      </div>
    </div>
  );
}
