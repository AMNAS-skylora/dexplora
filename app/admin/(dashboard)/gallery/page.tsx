import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GalleryManagerClient, GalleryItem } from "./GalleryManagerClient";

export const revalidate = 0;

export default async function AdminGalleryPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [images, categories, destinations] = await Promise.all([
    db.galleryImage.findMany({
      include: { destination: true, categoryObj: true },
      orderBy: { createdAt: "desc" },
    }),
    db.galleryCategory.findMany({
      orderBy: { name: "asc" },
    }),
    db.destination.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Default Categories fallback if DB has none initially
  let categoryOptions = categories.map((c: any) => ({
    id: c.id,
    name: c.name?.trim() || "General",
  }));

  if (categoryOptions.length === 0) {
    categoryOptions = [
      { id: "cat-1", name: "Tours" },
      { id: "cat-2", name: "Nature" },
      { id: "cat-3", name: "Trekking" },
      { id: "cat-4", name: "Group Trips" },
      { id: "cat-5", name: "Waterfalls" },
    ];
  }

  const sanitizedImages: GalleryItem[] = images.map((img: any) => ({
    id: img.id,
    title: img.title || null,
    caption: img.caption || null,
    url: img.imageUrl || img.url || "",
    imageUrl: img.imageUrl || img.url || "",
    imagePublicId: img.imagePublicId || null,
    altText: img.altText || null,
    category: img.category || img.categoryObj?.name || "General",
    categoryId: img.categoryId || img.categoryObj?.id || null,
    destinationId: img.destinationId || img.destination?.id || null,
    destinationName: img.destination?.name || null,
    destination: img.destination ? { id: img.destination.id, name: img.destination.name } : null,
    published: img.published ?? true,
    createdAt: img.createdAt,
  }));

  const destinationOptions = destinations.map((d: any) => ({
    id: d.id,
    name: d.name?.trim() || "Unnamed Destination",
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1026]">Gallery Photo Manager</h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1">
          Upload gallery photos via Cloudinary, categorize, assign destinations, and manage alt text.
        </p>
      </div>

      <GalleryManagerClient
        initialImages={sanitizedImages}
        initialCategories={categoryOptions}
        initialDestinations={destinationOptions}
      />
    </div>
  );
}
