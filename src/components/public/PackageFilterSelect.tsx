"use client";

import { ChevronDown } from "lucide-react";

interface PackageFilterSelectProps {
  name: string;
  defaultValue: string;
  options: Array<{ value: string; label: string }>;
  hiddenFields: Record<string, string>;
}

export function PackageFilterSelect({
  name,
  defaultValue,
  options,
  hiddenFields,
}: PackageFilterSelectProps) {
  return (
    <form method="GET" className="w-full">
      {Object.entries(hiddenFields).map(
        ([key, val]) =>
          val && <input key={key} type="hidden" name={key} value={val} />
      )}
      <div className="relative w-full min-w-0">
        <select
          name={name}
          defaultValue={defaultValue}
          onChange={(e) => e.target.form?.submit()}
          className="w-full h-[42px] bg-[#F6F8FC] border border-[#E3E8F1] text-[11.5px] min-[360px]:text-[12px] sm:text-[12.5px] font-semibold text-[#0B1026] leading-none rounded-[11px] pl-2.5 pr-7 py-1.5 appearance-none focus:outline-none focus:border-[#3478F6] focus:ring-3 focus:ring-[#3478F6]/10 cursor-pointer whitespace-nowrap min-w-0"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
      </div>
    </form>
  );
}
