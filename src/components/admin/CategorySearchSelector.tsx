"use client";

import { useState, useRef, useEffect } from "react";
import { quickCreateGalleryCategory } from "@/actions";
import { Search, Plus, Check, ChevronDown, Loader2, AlertCircle } from "lucide-react";

export interface CategoryOption {
  id: string;
  name: string;
}

interface CategorySearchSelectorProps {
  categories: CategoryOption[];
  value?: string;
  onChange: (categoryName: string, categoryId?: string) => void;
  error?: string | null;
}

export function CategorySearchSelector({
  categories: initialCategories,
  value,
  onChange,
  error,
}: CategorySearchSelectorProps) {
  const [categories, setCategories] = useState<CategoryOption[]>(initialCategories);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCat = categories.find(
    (c) => c.name.trim().toLowerCase() === (value || "").trim().toLowerCase()
  );

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const hasExactMatch = categories.some(
    (c) => c.name.trim().toLowerCase() === searchTerm.trim().toLowerCase()
  );

  const handleSelect = (cat: CategoryOption) => {
    onChange(cat.name, cat.id);
    setSearchTerm("");
    setCreationError(null);
    setIsOpen(false);
  };

  const handleAddNew = async () => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setCreationError(null);
    setIsCreating(true);
    const res = await quickCreateGalleryCategory(trimmed);
    setIsCreating(false);

    if (res.error) {
      setCreationError(res.error);
    } else if (res.category) {
      const newCat = { id: res.category.id, name: res.category.name };
      setCategories((prev) => {
        if (prev.some((c) => c.name.trim().toLowerCase() === newCat.name.trim().toLowerCase())) return prev;
        return [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name));
      });
      onChange(newCat.name, newCat.id);
      setSearchTerm("");
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full space-y-1">
      <label className="block text-xs font-bold text-[#0B1026]">Category *</label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-[#F3F7FF] border rounded-xl px-3.5 py-2.5 text-xs font-bold text-left flex items-center justify-between transition-colors min-h-[44px] cursor-pointer ${
          error || creationError
            ? "border-red-500 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-500/20"
            : "border-[#E8ECF3] text-[#0B1026] hover:border-[#3478F6]"
        }`}
      >
        <span className={value ? "text-[#0B1026]" : "text-gray-400 font-medium"}>
          {value ? value : "Select or search category..."}
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
              placeholder="Search or type new category..."
              autoFocus
              className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-[#0B1026] outline-none focus:border-[#3478F6]"
            />
          </div>

          {/* List Options */}
          <div className="overflow-y-auto space-y-0.5 flex-1 min-h-0">
            {filtered.map((c) => (
              <button
                key={c.id || c.name}
                type="button"
                onClick={() => handleSelect(c)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  c.name.trim().toLowerCase() === (value || "").trim().toLowerCase()
                    ? "bg-[#3478F6] text-white font-bold"
                    : "text-[#0B1026] hover:bg-[#F3F7FF]"
                }`}
              >
                <span>{c.name}</span>
                {c.name.trim().toLowerCase() === (value || "").trim().toLowerCase() && (
                  <Check className="w-3.5 h-3.5 shrink-0" />
                )}
              </button>
            ))}

            {filtered.length === 0 && !searchTerm.trim() && (
              <p className="text-xs text-gray-400 p-3 text-center">No categories available.</p>
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

      {(error || creationError) && (
        <p role="alert" className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error || creationError}</span>
        </p>
      )}
    </div>
  );
}
