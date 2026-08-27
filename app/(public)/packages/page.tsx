import { db } from "@/lib/db";
import { PackageCard } from "@/components/public/PackageCard";
import { PackageFilterSelect } from "@/components/public/PackageFilterSelect";
import Link from "next/link";
import { Search, Compass } from "lucide-react";

import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "India Tour Packages & Group Trips",
  description:
    "Explore Dexplora group tour packages across India, including mountain escapes, weekend trips and curated budget-friendly departures.",
  alternates: {
    canonical: absoluteUrl("/packages"),
  },
};

interface PackagesPageProps {
  searchParams: Promise<{
    search?: string;
    destination?: string;
    type?: string;
    sort?: string;
  }>;
}

export default async function PackagesPage({ searchParams }: PackagesPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const destination = params.destination || "";
  const type = params.type || "";
  const sort = params.sort || "latest";

  // Build Prisma filter query
  const whereQuery: any = {
    status: "PUBLISHED",
  };

  if (search) {
    whereQuery.OR = [
      { title: { contains: search } },
      { shortDescription: { contains: search } },
      { fullDescription: { contains: search } },
    ];
  }

  if (destination) {
    whereQuery.destination = {
      slug: destination,
    };
  }

  if (type) {
    whereQuery.tripType = type;
  }

  // Sort ordering
  let orderByQuery: any = { displayOrder: "asc" };
  if (sort === "price-low") orderByQuery = { price: "asc" };
  if (sort === "price-high") orderByQuery = { price: "desc" };
  if (sort === "popular") orderByQuery = { popular: "desc" };
  if (sort === "latest") orderByQuery = { createdAt: "desc" };

  const packages = await db.package.findMany({
    where: whereQuery,
    include: {
      destination: true,
      batches: {
        where: { startDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
        take: 1,
      },
    },
    orderBy: orderByQuery,
  });

  const destinations = await db.destination.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto px-[clamp(14px,4vw,24px)] py-4 sm:py-8 lg:py-10 space-y-5 sm:space-y-8">
      {/* Page Header */}
      <div className="space-y-1.5 py-1 sm:py-2">
        <span className="text-[clamp(11px,3vw,13px)] font-bold uppercase tracking-[0.06em] text-[#3478F6] block">
          ALL TOURS & DEPARTURES
        </span>
        <h1 className="text-[clamp(28px,8vw,40px)] font-bold text-[#0B1026] leading-[1.08] tracking-[-0.025em] break-words">
          Dexplora Tour Packages
        </h1>
        <p className="text-[clamp(14px,3.8vw,16px)] text-[#64748B] leading-[1.45] max-w-2xl font-normal mt-1 break-words">
          Explore our handpicked budget group departures and customized trips from Kerala across India.
        </p>
      </div>

      {/* Filter & Search Panel */}
      <div className="w-full bg-white rounded-[16px] border border-[#E5EAF2] p-3 shadow-[0_3px_12px_rgba(15,23,42,0.04)]">
        {/* Search Input Form */}
        <form method="GET" className="relative w-full">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#7C879B] absolute left-3 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search packages..."
            className="w-full h-[42px] bg-[#F6F8FC] border border-[#E3E8F1] rounded-xl pl-9 pr-3 text-[13px] text-[#0B1026] placeholder-[#7C879B] font-normal focus:outline-none focus:border-[#3478F6] focus:ring-3 focus:ring-[#3478F6]/10 min-w-0"
          />
          {destination && <input type="hidden" name="destination" value={destination} />}
          {type && <input type="hidden" name="type" value={type} />}
          {sort && <input type="hidden" name="sort" value={sort} />}
        </form>

        {/* 2-Equal-Column Filter Controls Row */}
        <div className="grid grid-cols-2 gap-1.5 mt-2 min-w-0">
          <div className="min-w-0">
            <PackageFilterSelect
              name="destination"
              defaultValue={destination}
              hiddenFields={{ search, type, sort }}
              options={[
                { value: "", label: "All Destinations" },
                ...destinations.map((d) => ({ value: d.slug, label: d.name })),
              ]}
            />
          </div>

          <div className="min-w-0">
            <PackageFilterSelect
              name="sort"
              defaultValue={sort}
              hiddenFields={{ search, destination, type }}
              options={[
                { value: "latest", label: "Sort: Latest" },
                { value: "price-low", label: "Price: Low to High" },
                { value: "price-high", label: "Price: High to Low" },
                { value: "popular", label: "Most Popular" },
              ]}
            />
          </div>
        </div>

        {(search || destination || type) && (
          <div className="pt-1.5 text-right">
            <Link
              href="/packages"
              className="text-xs text-[#DC2626] font-bold hover:underline px-1 py-0.5 inline-block"
            >
              Clear Filters
            </Link>
          </div>
        )}
      </div>

      {/* Package Grid */}
      {packages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[clamp(14px,4vw,20px)]">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} {...pkg} featured={pkg.featured} />
          ))}
        </div>
      ) : (
        <div className="bg-[#F3F7FF] rounded-3xl p-10 sm:p-16 text-center space-y-4 max-w-xl mx-auto border border-[#3478F6]/20">
          <div className="w-14 h-14 rounded-2xl bg-white text-[#3478F6] flex items-center justify-center mx-auto shadow-md">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-[#0B1026]">No packages found</h3>
          <p className="text-sm text-[#667085]">
            No packages available right now matching your search criteria. New adventures are coming soon!
          </p>
          <Link
            href="/packages"
            className="inline-block bg-[#3478F6] text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-md"
          >
            View All Packages
          </Link>
        </div>
      )}
    </div>
  );
}
