"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  createInstagramPost,
  updateInstagramPost,
  deleteInstagramPost,
  toggleInstagramPostActive,
  fetchInstagramPreview,
  retryInstagramPostThumbnail,
  reorderInstagramPosts,
  InstagramPostInputData,
} from "@/actions";
import {
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  X,
  ArrowUpRight,
  GripVertical,
  RotateCw,
  Film,
  Image as ImageIcon,
} from "lucide-react";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export interface InstagramPost {
  id: string;
  instagramUrl: string;
  normalizedUrl?: string | null;
  shortcode?: string | null;
  mediaType?: "post" | "reel" | null;
  thumbnailUrl?: string | null;
  title?: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string | Date;
}

interface InstagramManagerClientProps {
  initialPosts: InstagramPost[];
}

interface SortablePostRowProps {
  post: InstagramPost;
  onEdit: (post: InstagramPost) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, currentStatus: boolean) => void;
  onRetryThumbnail: (id: string) => void;
  isRetrying: boolean;
}

function SortablePostRow({
  post,
  onEdit,
  onDelete,
  onToggleActive,
  onRetryThumbnail,
  isRetrying,
}: SortablePostRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: post.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-3 sm:p-4 gap-4 ${
        isDragging
          ? "border-[#3478F6] shadow-xl ring-2 ring-[#3478F6]/20 bg-blue-50/20"
          : post.isActive
          ? "border-gray-200/80 hover:border-gray-300 shadow-xs"
          : "border-gray-200 bg-gray-50/60 opacity-80"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Dedicated Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag handle to reorder post"
          className="p-2 text-gray-400 hover:text-gray-700 active:text-[#3478F6] hover:bg-gray-100 rounded-xl cursor-grab active:cursor-grabbing touch-none shrink-0"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Thumbnail Preview Card */}
        <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden bg-gradient-to-br from-[#050A24] to-[#0B143A] shrink-0 border border-gray-200 shadow-xs">
          {post.thumbnailUrl ? (
            <Image
              src={post.thumbnailUrl}
              alt={post.title || "Instagram Post"}
              fill
              sizes="80px"
              className="object-cover object-center"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-white text-center bg-gradient-to-br from-[#833ab4]/90 via-[#fd1d1d]/80 to-[#fcb045]/90">
              <InstagramIcon className="w-6 h-6 mb-1 drop-shadow-sm" />
              <span className="text-[10px] font-bold leading-tight">No Preview</span>
            </div>
          )}

          {/* Media Type Badge */}
          <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
            {post.mediaType === "reel" ? (
              <>
                <Film className="w-2.5 h-2.5 text-pink-400" />
                <span>Reel</span>
              </>
            ) : (
              <>
                <ImageIcon className="w-2.5 h-2.5 text-purple-300" />
                <span>Post</span>
              </>
            )}
          </div>
        </div>

        {/* Post Info Details */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                post.isActive
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {post.isActive ? (
                <>
                  <Eye className="w-3 h-3" />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3" />
                  <span>Hidden</span>
                </>
              )}
            </span>

            {!post.thumbnailUrl && (
              <button
                type="button"
                onClick={() => onRetryThumbnail(post.id)}
                disabled={isRetrying}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <RotateCw className={`w-3 h-3 ${isRetrying ? "animate-spin" : ""}`} />
                <span>{isRetrying ? "Fetching..." : "Fetch Thumbnail"}</span>
              </button>
            )}
          </div>

          <h3 className="text-xs sm:text-sm font-bold text-[#0B1026] truncate">
            {post.title || (post.mediaType === "reel" ? "Instagram Reel" : "Instagram Post")}
          </h3>

          <a
            href={post.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-medium text-pink-600 hover:text-pink-700 truncate block flex items-center gap-1 max-w-full"
          >
            <span className="truncate">{post.instagramUrl}</span>
            <ArrowUpRight className="w-3 h-3 shrink-0" />
          </a>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 shrink-0">
        <button
          type="button"
          onClick={() => onToggleActive(post.id, post.isActive)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[36px] ${
            post.isActive
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
              : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
          }`}
        >
          {post.isActive ? "Hide" : "Show"}
        </button>

        <button
          type="button"
          onClick={() => onEdit(post)}
          className="p-2 text-gray-600 hover:text-[#3478F6] hover:bg-blue-50 rounded-xl transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          title="Edit Post"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onDelete(post.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          title="Delete Post"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function InstagramManagerClient({ initialPosts }: InstagramManagerClientProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<InstagramPost[]>(initialPosts || []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);

  // Form state
  const [instagramUrl, setInstagramUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Preview & Fetch state
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [fetchedThumbnail, setFetchedThumbnail] = useState<string | null>(null);
  const [previewMediaType, setPreviewMediaType] = useState<"post" | "reel" | null>(null);
  const [urlDuplicateError, setUrlDuplicateError] = useState<string | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Configure Sensors for mouse and touch dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const resetForm = () => {
    setInstagramUrl("");
    setTitle("");
    setIsActive(true);
    setFetchedThumbnail(null);
    setPreviewMediaType(null);
    setUrlDuplicateError(null);
    setError(null);
    setSuccess(null);
  };

  const handleOpenAddModal = () => {
    setEditingPost(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: InstagramPost) => {
    setEditingPost(post);
    resetForm();
    setInstagramUrl(post.instagramUrl || "");
    setTitle(post.title || "");
    setIsActive(Boolean(post.isActive));
    setFetchedThumbnail(post.thumbnailUrl || null);
    setPreviewMediaType(post.mediaType || null);
    setIsModalOpen(true);
  };

  // Real-time URL preview fetcher
  useEffect(() => {
    if (!isModalOpen || !instagramUrl || instagramUrl.trim().length < 15) {
      setFetchedThumbnail(editingPost?.thumbnailUrl || null);
      setPreviewMediaType(editingPost?.mediaType || null);
      setUrlDuplicateError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsPreviewLoading(true);
      setUrlDuplicateError(null);

      const res = await fetchInstagramPreview(instagramUrl);
      setIsPreviewLoading(false);

      if (res.error) {
        setFetchedThumbnail(null);
        return;
      }

      if (res.isDuplicate && (!editingPost || editingPost.id !== res.duplicateId)) {
        setUrlDuplicateError("This Instagram post or reel has already been added.");
      }

      if (res.parsed) {
        setPreviewMediaType(res.parsed.mediaType);
      }

      if (res.thumbnailUrl) {
        setFetchedThumbnail(res.thumbnailUrl);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [instagramUrl, isModalOpen, editingPost]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (urlDuplicateError) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    const payload: InstagramPostInputData = {
      instagramUrl: instagramUrl.trim(),
      thumbnailUrl: fetchedThumbnail || undefined,
      title: title.trim() || undefined,
      isActive,
      displayOrder: editingPost ? editingPost.displayOrder : posts.length,
    };

    let result;
    if (editingPost) {
      result = await updateInstagramPost(editingPost.id, payload);
    } else {
      result = await createInstagramPost(payload);
    }

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(editingPost ? "Post updated successfully!" : "Post added successfully!");
      setTimeout(() => {
        setIsModalOpen(false);
        router.refresh();
      }, 600);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: nextStatus } : p))
    );

    const res = await toggleInstagramPostActive(id, nextStatus);
    if (res.error) {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isActive: currentStatus } : p))
      );
    } else {
      router.refresh();
    }
  };

  const handleRetryThumbnail = async (id: string) => {
    setRetryingId(id);
    const res = await retryInstagramPostThumbnail(id);
    setRetryingId(null);

    if (res.error) {
      alert(res.error);
    } else if (res.thumbnailUrl) {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, thumbnailUrl: res.thumbnailUrl } : p))
      );
      router.refresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Instagram post?")) return;

    setPosts((prev) => prev.filter((p) => p.id !== id));
    const res = await deleteInstagramPost(id);
    if (res.error) {
      alert(res.error);
      router.refresh();
    } else {
      router.refresh();
    }
  };

  // Drag and drop handler
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = posts.findIndex((p) => p.id === active.id);
      const newIndex = posts.findIndex((p) => p.id === over.id);

      const newPosts = arrayMove(posts, oldIndex, newIndex).map((p, idx) => ({
        ...p,
        displayOrder: idx,
      }));

      setPosts(newPosts);

      // Save order automatically to MongoDB
      const res = await reorderInstagramPosts(newPosts.map((p) => p.id));
      if (res.error) {
        console.error("Failed to persist order:", res.error);
        router.refresh();
      } else {
        router.refresh();
      }
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <InstagramIcon className="w-6 h-6 text-pink-600" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B1026]">
              Instagram Post Slider
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Drag items using the handle (≡) to reorder them on the public site.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 bg-[#3478F6] hover:bg-[#2563EB] text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer min-h-[44px] shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Instagram Link</span>
        </button>
      </div>

      {/* Reorderable Post List */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200/80 space-y-3">
          <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-500 flex items-center justify-center mx-auto">
            <InstagramIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#0B1026]">No Instagram Links Added</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Paste an Instagram post or reel URL. Thumbnails are fetched automatically.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 bg-[#3478F6] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm hover:bg-[#2563EB] transition-all cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Post</span>
          </button>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={posts.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {posts.map((post) => (
                <SortablePostRow
                  key={post.id}
                  post={post}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  onRetryThumbnail={handleRetryThumbnail}
                  isRetrying={retryingId === post.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-gray-100 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                  <InstagramIcon className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[#0B1026]">
                  {editingPost ? "Edit Instagram Link" : "Add Instagram Link"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notifications */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Instagram URL */}
              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1.5">
                  Instagram URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/p/POST_ID/ or /reel/REEL_ID/"
                  className={`w-full h-11 px-3.5 bg-gray-50 border rounded-xl text-xs font-medium text-[#0B1026] focus:bg-white outline-none transition-all ${
                    urlDuplicateError
                      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                      : "border-gray-200 focus:border-[#3478F6] focus:ring-2 focus:ring-[#3478F6]/20"
                  }`}
                />
                {urlDuplicateError ? (
                  <p className="text-[11px] font-semibold text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{urlDuplicateError}</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-gray-500 mt-1">
                    Paste a link like <code>https://www.instagram.com/reel/xxxx/</code>
                  </p>
                )}
              </div>

              {/* Live Thumbnail Preview Box */}
              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1.5">
                  Automatic Thumbnail Preview
                </label>
                <div className="relative w-full h-40 rounded-2xl bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                  {isPreviewLoading ? (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <RefreshCw className="w-6 h-6 text-[#3478F6] animate-spin" />
                      <span className="text-xs font-semibold">Fetching Instagram thumbnail...</span>
                    </div>
                  ) : fetchedThumbnail ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={fetchedThumbnail}
                        alt="Instagram Thumbnail Preview"
                        fill
                        className="object-cover object-center"
                      />
                      <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
                        {previewMediaType === "reel" ? (
                          <>
                            <Film className="w-3 h-3 text-pink-400" />
                            <span>Reel Cover</span>
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-3 h-3 text-purple-300" />
                            <span>Post Thumbnail</span>
                          </>
                        )}
                      </div>
                    </div>
                  ) : instagramUrl ? (
                    <div className="p-4 text-center space-y-1">
                      <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                        <InstagramIcon className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-gray-700">Could not fetch thumbnail automatically</p>
                      <p className="text-[11px] text-gray-500">
                        The post will save cleanly with a styled Instagram fallback card on the slider.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 space-y-1 p-4">
                      <InstagramIcon className="w-8 h-8 mx-auto text-gray-300" />
                      <p className="text-xs font-medium">Thumbnail preview will appear here</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Title */}
              <div>
                <label className="block text-xs font-bold text-[#0B1026] mb-1.5">
                  Title / Caption (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Exploring Meghalaya Waterfalls 🌊"
                  className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-[#0B1026] focus:bg-white focus:border-[#3478F6] focus:ring-2 focus:ring-[#3478F6]/20 outline-none transition-all"
                />
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-[#3478F6] rounded border-gray-300 focus:ring-[#3478F6]"
                  />
                  <span className="text-xs font-bold text-[#0B1026]">
                    Active (Visible on public slider)
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || Boolean(urlDuplicateError)}
                  className="inline-flex items-center gap-2 bg-[#3478F6] hover:bg-[#2563EB] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all cursor-pointer min-h-[44px]"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingPost ? "Save Changes" : "Add Link"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
