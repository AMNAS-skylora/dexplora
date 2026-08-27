import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-20 h-20 rounded-3xl bg-[#F3F7FF] text-[#3478F6] flex items-center justify-center shadow-md">
        <Compass className="w-10 h-10 animate-spin-slow" />
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-[#3478F6]">404 Page Not Found</span>
      <h1 className="text-3xl sm:text-5xl font-black text-[#0B1026]">Looks Like You&apos;re Off Track</h1>
      <p className="text-sm text-[#667085] max-w-md">
        The tour page or destination you are looking for might have been moved or is currently unavailable.
      </p>
      <div className="pt-2">
        <Link
          href="/"
          className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-6 py-3 rounded-xl font-bold text-xs shadow-md transition-colors inline-block"
        >
          Return to Dexplora Homepage
        </Link>
      </div>
    </div>
  );
}
