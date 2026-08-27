export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-4 border-[#3478F6]/20 border-t-[#3478F6] animate-spin" />
        <span className="text-xs font-extrabold text-[#3478F6] tracking-wider uppercase">Loading Dexplora...</span>
      </div>
    </div>
  );
}
