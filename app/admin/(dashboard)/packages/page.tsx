import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { deletePackage } from "@/actions";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit3, Trash2, Eye, MapPin, Clock } from "lucide-react";

export const revalidate = 0;

export interface PackageType {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  coverImage?: string | null;
  duration?: string | null;
  price?: number | null;
  status?: string | null;
  destinationId?: string | null;
  destination?: {
    id?: string;
    name?: string | null;
  } | null;
  destinationName?: string | null;
  batches?: any[];
}

export default async function AdminPackagesPage() {
  const rawPackages = await db.package.findMany({
    include: {
      destination: true,
      batches: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const packages: PackageType[] = rawPackages.map((pkg: any) => ({
    ...pkg,
    destinationName:
      pkg.destination?.name ??
      pkg.destinationName ??
      pkg.location ??
      null,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B1026]">Tour Package Management</h1>
          <p className="text-xs text-[#667085]">Create, update, publish or archive tour packages.</p>
        </div>

        <Link
          href="/admin/packages/new"
          className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Package</span>
        </Link>
      </div>

      {packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const destinationDisplay =
              pkg.destination?.name ||
              pkg.destinationName ||
              "Destination not set";
            const durationDisplay = pkg.duration || "Duration not set";
            const statusDisplay = pkg.status || "DRAFT";

            return (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border border-[#E8ECF3] overflow-hidden shadow-sm flex flex-col justify-between"
              >
                <div className="relative aspect-[16/9] w-full bg-gray-100">
                  {pkg.coverImage ? (
                    <Image
                      src={pkg.coverImage}
                      alt={pkg.title || "Tour Package"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-400">
                      No Cover Image
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm ${
                        statusDisplay === "PUBLISHED"
                          ? "bg-[#16A36A] text-white"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      {statusDisplay}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-[#3478F6] font-bold gap-2">
                      <span className="truncate flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{destinationDisplay}</span>
                      </span>
                      <span className="shrink-0 flex items-center gap-1 text-gray-500 font-semibold">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{durationDisplay}</span>
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-[#0B1026] line-clamp-1">
                      {pkg.title || "Untitled Package"}
                    </h3>
                    <p className="text-xs text-[#667085] line-clamp-2">
                      {pkg.shortDescription || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E8ECF3] flex items-center justify-between">
                    <span className="text-lg font-black text-[#3478F6]">
                      {formatPrice(pkg.price ?? 0)}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/packages/${pkg.slug || pkg.id}`}
                        target="_blank"
                        className="p-2 rounded-lg bg-[#F3F7FF] text-[#3478F6] hover:bg-[#3478F6] hover:text-white transition-colors"
                        title="View public page"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <Link
                        href={`/admin/packages/${pkg.id}/edit`}
                        className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        title="Edit Package"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>

                      <form action={async () => { "use server"; await deletePackage(pkg.id); }}>
                        <button
                          type="submit"
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                          title="Delete package"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center text-gray-500 border border-[#E8ECF3]">
          No packages created yet. Create your first package!
        </div>
      )}
    </div>
  );
}
