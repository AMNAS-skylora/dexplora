"use client";

import { useState } from "react";
import Image from "next/image";
import { createGalleryImage, updateGalleryImage, deleteGalleryImage } from "@/actions";
import {
  Plus,
  Trash2,
  Edit3,
  Search,
  Image as ImageIcon,
  X,
  Loader2,
  AlertCircle,
  Filter,
  CheckCircle2,
  MapPin,
  Tag,
} from "lucide-react";
import { CategorySearchSelector, CategoryOption } from "@/components/admin/CategorySearchSelector";
import { DestinationSearchSelector, DestinationOption } from "@/components/admin/DestinationSearchSelector";
import { GalleryImageUploader } from "@/components/admin/GalleryImageUploader";
import { formatDate } from "@/lib/utils";

export interface GalleryItem {
  id: string;
  title?: string | null;
  caption?: string | null;
  url?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  altText?: string | null;
  category?: string | null;
  categoryId?: string | null;
  destinationId?: string | null;
  destinationName?: string | null;
  destination?: { id: string; name: string } | null;
  published?: boolean;
  createdAt?: string | Date;
}

interface GalleryManagerClientProps {
  initialImages: GalleryItem[];
  initialCategories: CategoryOption[];
  initialDestinations: DestinationOption[];
}

export function GalleryManagerClient({
  initialImages,
  initialCategories,
  initialDestinations,
}: GalleryManagerClientProps) {
  const [images, setImages] = useState<GalleryItem[]>(initialImages);
  const [categories, setCategories] = useState<CategoryOption[]>(initialCategories);
  const [destinations, setDestinations] = useState<DestinationOption[]>(initialDestinations);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [selectedDestinationFilter, setSelectedDestinationFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ category?: string; image?: string }>({});

  // Form State
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [categoryName, setCategoryName] = useState("Tours");
  const [categoryId, setCategoryId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [altText, setAltText] = useState("");
  const [published, setPublished] = useState(true);

  // Delete Target
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setTitle("");
    setCaption("");
    setCategoryName(categories[0]?.name || "Tours");
    setCategoryId(categories[0]?.id || "");
    setDestinationId("");
    setImageUrl("");
    setImagePublicId("");
    setAltText("");
    setPublished(true);
    setError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title || "");
    setCaption(item.caption || "");
    setCategoryName(item.category || "Tours");
    setCategoryId(item.categoryId || "");
    setDestinationId(item.destinationId || item.destination?.id || "");
    setImageUrl(item.imageUrl || item.url || "");
    setImagePublicId(item.imagePublicId || "");
    setAltText(item.altText || "");
    setPublished(item.published ?? true);
    setError(null);
    setFieldErrors({});
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const errors: { category?: string; image?: string } = {};

    if (!categoryName.trim()) {
      errors.category = "Please select or add a category.";
    }
    if (!imageUrl.trim()) {
      errors.image = "Gallery image is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    const payload = {
      title: title.trim() || undefined,
      caption: caption.trim() || undefined,
      imageUrl: imageUrl.trim(),
      url: imageUrl.trim(),
      imagePublicId: imagePublicId.trim() || undefined,
      altText: altText.trim() || undefined,
      category: categoryName.trim(),
      categoryId: categoryId || undefined,
      destinationId: destinationId || undefined,
      published,
    };

    let res;
    if (editingItem) {
      res = await updateGalleryImage(editingItem.id, payload);
    } else {
      res = await createGalleryImage(payload);
    }

    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setIsModalOpen(false);
      // Local optimistic update / refresh state
      if (res.image) {
        setImages((prev) => {
          const updatedDoc = res.image;
          const filtered = prev.filter((i) => i.id !== updatedDoc.id);
          return [updatedDoc, ...filtered];
        });
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    const res = await deleteGalleryImage(deleteTarget.id);
    setLoading(false);
    if (res.error) {
      alert(res.error);
    } else {
      setImages((prev) => prev.filter((i) => i.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  // Filtered List
  const filteredImages = images.filter((img) => {
    const q = searchTerm.toLowerCase();
    const destName = img.destination?.name || img.destinationName || "";

    const matchesSearch =
      (img.title?.toLowerCase() || "").includes(q) ||
      (img.caption?.toLowerCase() || "").includes(q) ||
      (img.category?.toLowerCase() || "").includes(q) ||
      destName.toLowerCase().includes(q);

    const matchesCategory =
      selectedCategoryFilter === "ALL" ||
      (img.category || "").trim().toLowerCase() === selectedCategoryFilter.trim().toLowerCase();

    const matchesDestination =
      selectedDestinationFilter === "ALL" ||
      (img.destinationId || img.destination?.id) === selectedDestinationFilter;

    return matchesSearch && matchesCategory && matchesDestination;
  });

  // Extract unique category names for filter dropdown
  const uniqueCategories = Array.from(
    new Set([...categories.map((c) => c.name), ...images.map((i) => i.category || "").filter(Boolean)])
  );

  return (
    <div className="space-y-6">
      {/* Control Toolbar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E8ECF3] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search gallery by title, category, or destination..."
            className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#0B1026] outline-none focus:border-[#3478F6]"
          />
        </div>

        {/* Filters & Add Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-[#F3F7FF] border border-[#E8ECF3] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#0B1026] outline-none"
          >
            <option value="ALL">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Destination Filter */}
          <select
            value={selectedDestinationFilter}
            onChange={(e) => setSelectedDestinationFilter(e.target.value)}
            className="bg-[#F3F7FF] border border-[#E8ECF3] rounded-2xl px-3.5 py-2.5 text-xs font-bold text-[#0B1026] outline-none"
          >
            <option value="ALL">All Destinations</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenCreateModal}
            className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 min-h-[42px] cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Gallery Cards Grid */}
      {filteredImages.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {filteredImages.map((img) => {
            const displayImg = img.imageUrl || img.url;
            const destName = img.destination?.name || img.destinationName || "No destination";

            return (
              <div
                key={img.id}
                className="bg-white rounded-3xl border border-[#E8ECF3] overflow-hidden p-2.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Aspect Square Image Box */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-[#E8ECF3] group">
                  {displayImg ? (
                    <Image
                      src={displayImg}
                      alt={img.altText || img.title || "Gallery Photo"}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 240px"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                      <ImageIcon className="w-8 h-8 opacity-40 mb-1" />
                      <span className="text-[10px] font-bold">No Image</span>
                    </div>
                  )}

                  {/* Category Pill */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      {img.category || "General"}
                    </span>
                  </div>
                </div>

                {/* Info & Actions */}
                <div className="pt-2.5 px-1 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0B1026] truncate">{img.title || img.caption || "Untitled Photo"}</h4>
                    <p className="text-[11px] text-[#3478F6] font-bold flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{destName}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E8ECF3] text-[10px]">
                    <span className="text-gray-400 font-medium">{formatDate(img.createdAt || new Date())}</span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(img)}
                        className="p-1.5 text-gray-600 hover:text-[#3478F6] hover:bg-[#F3F7FF] rounded-xl transition-colors cursor-pointer"
                        title="Edit Photo"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget(img)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E8ECF3] space-y-3">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-extrabold text-[#0B1026]">No Gallery Photos Found</h3>
          <p className="text-xs text-gray-500">
            No gallery images match your current filters. Upload a new photo to populate your site gallery.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-colors cursor-pointer inline-flex items-center gap-2 mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
        </div>
      )}

      {/* Add / Edit Gallery Image Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-[#E8ECF3] my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8ECF3] pb-4">
              <h2 className="text-lg font-extrabold text-[#0B1026]">
                {editingItem ? "Edit Gallery Photo" : "Upload New Gallery Photo"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-xl border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Cloudinary Image Uploader */}
              <GalleryImageUploader
                value={imageUrl}
                onChange={(url, publicId) => {
                  setImageUrl(url);
                  if (publicId) setImagePublicId(publicId);
                  if (fieldErrors.image) setFieldErrors((prev) => ({ ...prev, image: undefined }));
                }}
                error={fieldErrors.image}
              />

              {/* Title & Caption */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#0B1026] mb-1">Photo Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Crystal Waters of Dawki"
                    className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#3478F6]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0B1026] mb-1">Photo Caption / Subtitle</label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. Boating on the clearest river in Meghalaya"
                    className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#3478F6]"
                  />
                </div>
              </div>

              {/* Searchable Category Combobox */}
              <CategorySearchSelector
                categories={categories}
                value={categoryName}
                onChange={(catName, catId) => {
                  setCategoryName(catName);
                  if (catId) setCategoryId(catId);
                  if (fieldErrors.category) setFieldErrors((prev) => ({ ...prev, category: undefined }));
                }}
                error={fieldErrors.category}
              />

              {/* Searchable Destination Combobox */}
              <DestinationSearchSelector
                destinations={destinations}
                value={destinationId}
                onChange={(dId) => setDestinationId(dId)}
                allowOptional
              />

              {/* Alt Text */}
              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1">Image Alt Text <span className="text-gray-400 font-normal">(SEO & Accessibility)</span></label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="e.g. Meghalaya group trip waterfall view"
                  className="w-full bg-[#F3F7FF] border border-[#E8ECF3] rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-[#3478F6]"
                />
              </div>

              {/* Published Toggle */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#0B1026]">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="w-4 h-4 rounded text-[#3478F6]"
                  />
                  <span>Published (Visible in public gallery)</span>
                </label>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8ECF3]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E8ECF3] text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer min-h-[42px]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#3478F6] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-2 min-h-[42px] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Photo...</span>
                    </>
                  ) : (
                    <span>{editingItem ? "Update Photo" : "Save Photo"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E8ECF3]">
            <div className="flex items-center justify-between border-b border-[#E8ECF3] pb-3">
              <h2 className="text-base font-extrabold text-[#0B1026]">Confirm Delete Photo</h2>
              <button onClick={() => setDeleteTarget(null)} className="p-1 rounded-xl text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 font-medium">
              Are you sure you want to delete this gallery photo?
              {deleteTarget.imagePublicId && " The associated Cloudinary image asset will also be cleaned up safely."}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 border rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Delete Photo</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
