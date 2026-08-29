import { db } from "@/lib/db";
import { DestinationManagerClient, DestinationItem } from "./DestinationManagerClient";

export const revalidate = 0;

export default async function AdminDestinationsPage() {
  const [destinations, packages] = await Promise.all([
    db.destination.findMany({
      orderBy: { name: "asc" },
    }),
    db.package.findMany({
      select: { id: true, destinationId: true },
    }),
  ]);

  // Compute package counts defensively
  const countMap = new Map<string, number>();
  packages.forEach((p: any) => {
    if (p.destinationId) {
      countMap.set(p.destinationId, (countMap.get(p.destinationId) || 0) + 1);
    }
  });

  const enrichedDestinations: DestinationItem[] = destinations.map((d: any) => {
    const packageCount = d.packageCount ?? countMap.get(d.id) ?? 0;
    return {
      id: d.id,
      name: d.name?.trim() || "Unnamed Destination",
      state: d.state?.trim() || "",
      country: d.country?.trim() || "India",
      imageUrl: d.imageUrl || d.coverImage || null,
      imagePublicId: d.imagePublicId || null,
      shortDescription: d.shortDescription || null,
      packageCount,
      _count: { packages: packageCount },
      active: d.active !== undefined ? d.active : (d.isActive !== undefined ? d.isActive : true),
      isActive: d.active !== undefined ? d.active : (d.isActive !== undefined ? d.isActive : true),
    };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1026]">Destination Management</h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1">
          Organize travel destinations, package relations, Cloudinary cover photos, and active filter statuses.
        </p>
      </div>

      <DestinationManagerClient destinations={enrichedDestinations} />
    </div>
  );
}
