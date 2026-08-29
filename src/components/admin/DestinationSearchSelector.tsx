"use client";

import { useState, useRef, useEffect } from "react";
import { quickCreateDestination } from "@/actions";
import { Search, Plus, Check, ChevronDown, Loader2, AlertCircle } from "lucide-react";

export interface DestinationOption {
  id: string;
  name: string;
}

interface DestinationSearchSelectorProps {
  destinations: DestinationOption[];
  value?: string;
  onChange: (id: string) => void;
  error?: string | null;
  allowOptional?: boolean;
}

export function DestinationSearchSelector({
  destinations: initialDestinations,
  value,
  onChange,
  error,
}: DestinationSearchSelectorProps) {
  const [destinations, setDestinations] = useState<DestinationOption[]>(initialDestinations);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDestinations(initialDestinations);
  }, [initialDestinations]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedDest = destinations.find((d) => d.id === value);

  const filtered = destinations.filter((d) =>
    d.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const hasExactMatch = destinations.some(
    (d) => d.name.trim().toLowerCase() === searchTerm.trim().toLowerCase()
  );

  const handleSelect = (dest: DestinationOption) => {
    onChange(dest.id);
    setSearchTerm("");
    setIsOpen(false);
  };

  const handleAddNew = async () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setIsCreating(true);
    const res = await quickCreateDestination(trimmed);
    setIsCreating(false);

    if (res.destination) {
      const newDest = { id: res.destination.id, name: res.destination.name };
      setDestinations((prev) => {
        if (prev.some((d) => d.id === newDest.id)) return prev;
        return [...prev, newDest].sort((a, b) => a.name.localeCompare(b.name));
      });
      onChange(newDest.id);
      setSearchTerm("");
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-1">
      <label className="block text-xs font-bold text-[#0B1026]">Destination *</label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#F3F7FF] border rounded-xl px-3.5 py-2.5 text-xs font-bold text-left flex items-center justify-between transition-colors min-h-[44px] cursor-pointer ${
          error
            ? "border-red-500 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-500/20"
            : "border-[#E8ECF3] text-[#0B1026] hover:border-[#3478F6]"
        }`}
      >
        <span className={selectedDest ? "text-[#0B1026]" : "text-gray-400 font-medium"}>
          {selectedDest ? selectedDest.name : "Select or search destination..."}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </button>

      {/* Dropdown Box */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-[#E8ECF3] rounded-2xl shadow-xl p-2 space-y-2 max-h-64 overflow-hidden flex flex-col">
          {/* Search Box */}
          <div className="relative shrink-0">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search destination..."
              autoFocus
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-[#0B1026] outline-none focus:border-[#3478F6]"
            />
          </div>

          {/* List Options */}
          <div className="overflow-y-auto space-y-0.5 flex-1 min-h-0">
            {filtered.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => handleSelect(d)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  d.id === value
                    ? "bg-[#3478F6] text-white font-bold"
                    : "text-[#0B1026] hover:bg-[#F3F7FF]"
                }`}
              >
                <span>{d.name}</span>
                {d.id === value && <Check className="w-3.5 h-3.5 shrink-0" />}
              </button>
            ))}

            {filtered.length === 0 && !searchTerm.trim() && (
              <p className="text-xs text-gray-400 p-3 text-center">No destinations available.</p>
            )}

            {/* Quick Add Option */}
            {searchTerm.trim() !== "" && !hasExactMatch && (
              <button
                type="button"
                onClick={handleAddNew}
                disabled={isCreating}
                className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-[#3478F6] hover:bg-[#F3F7FF] flex items-center gap-1.5 border border-dashed border-[#3478F6]/40 cursor-pointer disabled:opacity-50"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Adding &quot;{searchTerm.trim()}&quot;...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add &quot;{searchTerm.trim()}&quot;</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
