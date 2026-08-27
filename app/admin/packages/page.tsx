import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { deletePackage } from "@/actions";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit3, Trash2, Eye, MapPin, Clock } from "lucide-react";

export const revalidate = 0;

export default async function AdminPackagesPage() {
  const packages = await db.package.findMany({
    include: {
      destination: true,
      batches: true,
    },
    orderBy: { createdAt: "desc" },
  });

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
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl border border-[#E8ECF3] overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="relative aspect-[16/9] w-full bg-gray-100">
                <Image
                  src={pkg.coverImage}
                  alt={pkg.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm ${
                      pkg.status === "PUBLISHED"
                        ? "bg-[#16A36A] text-white"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {pkg.status}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-[#3478F6] font-bold">
                    <span>{pkg.destination.name}</span>
                    <span>{pkg.duration}</span>
                  </div>
                  <h3 className="font-bold text-base text-[#0B1026] line-clamp-1">{pkg.title}</h3>
                  <p className="text-xs text-[#667085] line-clamp-2">{pkg.shortDescription}</p>
                </div>

                <div className="pt-3 border-t border-[#E8ECF3] flex items-center justify-between">
                  <span className="text-lg font-black text-[#3478F6]">
                    {formatPrice(pkg.price)}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/packages/${pkg.slug}`}
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
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                        title="Delete package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center text-gray-500 border border-[#E8ECF3]">
          No packages created yet. Create your first package!
        </div>
      )}
    </div>
  );
}
