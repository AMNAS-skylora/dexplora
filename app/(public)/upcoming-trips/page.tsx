import { db } from "@/lib/db";
import { PackageCard } from "@/components/public/PackageCard";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Upcoming Departures & Group Trips",
  description:
    "Explore scheduled upcoming group departures, weekend getaways, and fixed departure tour packages across India with Dexplora.",
  alternates: {
    canonical: absoluteUrl("/upcoming-trips"),
  },
};

export default async function UpcomingTripsPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let batches: any[] = [];
  try {
    batches = await db.tripBatch.findMany({
      where: {
        startDate: { gte: today },
      },
      include: {
        package: {
          include: { destination: true },
        },
      },
      orderBy: { startDate: "asc" },
    });
  } catch (err) {
    console.error("Error loading upcoming trips:", err);
  }

  // Filter out cancelled or unpublished
  const activeBatches = batches.filter(
    (b: any) =>
      b.status !== "CANCELLED" &&
      b.status !== "COMPLETED" &&
      b.package &&
      (b.package.status === "PUBLISHED" || b.package.status === undefined)
  );

  return (
    <div className="py-6 sm:py-10 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[#E8ECF3] pb-4 gap-2">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#3478F6]">
              Fixed Departures
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1026] mt-0.5">
              Upcoming Group Trips
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#667085] font-medium">
            Guaranteed departures with tour leaders across India.
          </p>
        </div>

        {/* Trips Cards Grid */}
        {activeBatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {activeBatches.map((b: any) => {
              const pkg = b.package;
              return (
                <PackageCard
                  key={b.id}
                  id={pkg.id}
                  title={b.batchName ? `${pkg.title} (${b.batchName})` : pkg.title}
                  slug={pkg.slug}
                  shortDescription={pkg.shortDescription || pkg.title}
                  coverImage={pkg.coverImage || pkg.imageUrl || "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&w=800&q=80"}
                  duration={pkg.duration || "Multi-day"}
                  price={b.priceOverride || pkg.sellingPrice || pkg.startingPrice || pkg.price}
                  originalPrice={pkg.realPrice || pkg.originalPrice}
                  departureLocation={pkg.departureLocation || "Kochi / Kerala"}
                  tripType="UPCOMING DEPARTURE"
                  destination={pkg.destination}
                  batches={[
                    {
                      startDate: b.startDate,
                      availableSeats: b.availableSeats !== undefined ? b.availableSeats : 30,
                      status: b.status || "OPEN",
                    },
                  ]}
                  featured={b.featured}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8ECF3] shadow-sm max-w-md mx-auto space-y-3 my-8">
            <Sparkles className="w-10 h-10 text-gray-300 mx-auto" />
            <h3 className="text-base font-extrabold text-[#0B1026]">No Upcoming Departures Scheduled</h3>
            <p className="text-xs text-gray-500">
              Check back soon or explore our full catalog of holiday packages.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
