import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  MessageSquare,
  SendHorizontal,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import type { BookingItem, CarItem } from "./admin/types";
import { formatDate, showApiError } from "./admin/utils";
import { fetchReservedCarIds } from "../utils/reservedCars";
import CarRating from "../components/CarRating";

type CarComment = {
  _id: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  isMine: boolean;
  user: {
    _id: string;
    name: string;
  };
};

type CommentPagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export default function CarDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [car, setCar] = useState<CarItem | null>(null);
  const [reservedCarIds, setReservedCarIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeBooking, setActiveBooking] = useState<BookingItem | null>(null);

  const [comments, setComments] = useState<CarComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsPagination, setCommentsPagination] = useState<CommentPagination>({
    total: 0,
    page: 1,
    limit: 6,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [commentFilter, setCommentFilter] = useState<"all" | "mine">("all");
  const [commentSort, setCommentSort] = useState<"newest" | "oldest">("newest");
  const [commentSearch, setCommentSearch] = useState("");
  const [newComment, setNewComment] = useState("");
  const [creatingComment, setCreatingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(true);

  const fromAdmin = searchParams.get("from") === "admin";
  const isAdminPath = location.pathname.startsWith("/admin/") || fromAdmin;
  const backTo = isAdminPath ? "/admin" : "/cars";
  const backLabel = isAdminPath ? "Back to admin" : "Back to cars";

  const refreshComments = useCallback(
    async (page = 1, append = false) => {
      if (!id) return;
      setCommentsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", "6");
        params.set("sort", commentSort);
        if (commentFilter === "mine") params.set("mine", "true");
        if (commentSearch.trim()) params.set("search", commentSearch.trim());

        const response = await api.get(`/cars/${id}/comments?${params.toString()}`);
        const nextComments = response.data?.data?.comments ?? [];
        const nextPagination =
          response.data?.data?.pagination ??
          {
            total: 0,
            page,
            limit: 6,
            pages: 0,
            hasNext: false,
            hasPrev: false,
          };

        setComments((prev) => (append ? [...prev, ...nextComments] : nextComments));
        setCommentsPagination(nextPagination);
      } catch {
        if (!append) setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    },
    [id, commentSort, commentFilter, commentSearch]
  );

  useEffect(() => {
    if (!id) return;

    const fetchCar = async () => {
      setLoading(true);
      try {
        const [carRes, ids] = await Promise.all([api.get(`/cars/${id}`), fetchReservedCarIds()]);
        setCar(carRes.data?.data?.car ?? null);
        setReservedCarIds(ids);
        await refreshComments(1, false);
        setImageFailed(false);
        setActiveImageIndex(0);
      } catch (error) {
        showApiError(error, "Unable to load car details.");
        setCar(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id, refreshComments]);

  useEffect(() => {
    if (!id) return;
    const timeout = setTimeout(() => {
      refreshComments(1, false);
    }, 250);
    return () => clearTimeout(timeout);
  }, [id, commentFilter, commentSort, commentSearch, refreshComments]);

  const galleryImages = useMemo(() => {
    if (!car) return ["https://via.placeholder.com/1200x700?text=Car"];
    const raw = Array.isArray(car.images) && car.images.length ? car.images : car.image ? [car.image] : [];
    const cleaned = raw.map((img) => (img || "").trim()).filter(Boolean);
    return cleaned.length ? cleaned : ["https://via.placeholder.com/1200x700?text=Car"];
  }, [car]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLightboxOpen(false);
      if (event.key === "ArrowRight") setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
      if (event.key === "ArrowLeft") setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen, galleryImages.length]);

  const imageSrc = !imageFailed ? galleryImages[activeImageIndex] : "https://via.placeholder.com/1200x700?text=Car";
  const carAlt = car ? `${car.marque} ${car.modele}` : "Car image";
  const isReserved = car ? reservedCarIds.includes(car._id) : false;

  useEffect(() => {
    if (!car?._id || !isReserved || user?.role !== "admin") {
      setActiveBooking(null);
      return;
    }

    const fetchActiveBooking = async () => {
      try {
        const response = await api.get(`/bookings/car/${car._id}/active`);
        setActiveBooking(response.data?.data?.booking ?? null);
      } catch {
        setActiveBooking(null);
      }
    };

    fetchActiveBooking();
  }, [car?._id, isReserved, user?.role]);

  const createComment = async () => {
    if (!car?._id) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (!newComment.trim()) return;

    setCreatingComment(true);
    try {
      await api.post(`/cars/${car._id}/comments`, { comment: newComment.trim() });
      setNewComment("");
      await refreshComments(1, false);
    } catch (error) {
      showApiError(error, "Unable to post comment.");
    } finally {
      setCreatingComment(false);
    }
  };

  const removeComment = async (commentId: string) => {
    if (!car?._id) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setDeletingCommentId(commentId);
    try {
      await api.delete(`/cars/${car._id}/comments/${commentId}`);
      await refreshComments(1, false);
    } catch (error) {
      showApiError(error, "Unable to delete comment.");
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-10 pt-28 text-white md:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Link to={backTo} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-zinc-800">
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        {loading ? (
          <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
            <p className="text-zinc-400">Loading car details...</p>
          </section>
        ) : !car ? (
          <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
            <p className="text-zinc-400">Car not found.</p>
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70">
            <button type="button" onClick={() => setIsLightboxOpen(true)} className="block w-full cursor-zoom-in bg-zinc-900" aria-label="Open car image fullscreen">
              <img src={imageSrc} alt={carAlt} className="h-72 w-full bg-zinc-900 object-contain" onError={() => setImageFailed(true)} />
            </button>
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-t border-white/10 bg-zinc-900/70 p-3">
                {galleryImages.map((img, index) => (
                  <button
                    type="button"
                    key={`${img.slice(0, 20)}-${index}`}
                    onClick={() => {
                      setActiveImageIndex(index);
                      setImageFailed(false);
                    }}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border ${activeImageIndex === index ? "border-primary" : "border-white/10"}`}
                  >
                    <img src={img} alt={`${carAlt} ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-6 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold">
                    {car.marque} {car.modele}
                  </h1>
                  <p className="text-sm text-zinc-400">ID: {car._id}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${car.disponible ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                  {car.disponible ? "Available" : "Unavailable"}
                </span>
                {isReserved && (
                  <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-1 text-sm font-medium text-amber-200">
                    Reserved
                  </span>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-zinc-800/70 p-4">
                  <p className="mb-1 inline-flex items-center gap-2 text-zinc-400">
                    <CircleDollarSign className="h-4 w-4" />
                    Price
                  </p>
                  <p className="text-lg font-semibold">{car.prixParJour} MAD/day</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-800/70 p-4">
                  <p className="mb-1 inline-flex items-center gap-2 text-zinc-400">
                    <Calendar className="h-4 w-4" />
                    Year
                  </p>
                  <p className="text-lg font-semibold">{car.annee || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-800/70 p-4">
                  <p className="mb-1 inline-flex items-center gap-2 text-zinc-400">
                    <ShieldCheck className="h-4 w-4" />
                    Added on
                  </p>
                  <p className="text-lg font-semibold">{formatDate(car.createdAt)}</p>
                </div>
              </div>

              <CarRating
                carId={car._id}
                initialAverageRating={Number(car.averageRating ?? 0)}
                initialTotalRatings={Number(car.totalRatings ?? 0)}
                initialUserRating={car.userRating ?? null}
                isLoggedIn={Boolean(user)}
                canRate={Boolean(user)}
                onRated={({ averageRating, totalRatings, userRating }) => {
                  setCar((prev) => (prev ? { ...prev, averageRating, totalRatings, userRating } : prev));
                }}
              />

              <section className="rounded-xl border border-white/10 bg-zinc-800/70 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-200">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Community comments
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-zinc-400">{commentsPagination.total} comment(s)</p>
                    <button
                      type="button"
                      onClick={() => setIsCommentsExpanded((prev) => !prev)}
                      className="rounded-md border border-white/15 p-1.5 text-zinc-200 hover:bg-zinc-700/50"
                      aria-expanded={isCommentsExpanded}
                      aria-label={isCommentsExpanded ? "Collapse comments section" : "Expand comments section"}
                    >
                      {isCommentsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isCommentsExpanded && (
                  <>
                    <div className="mb-3 grid gap-2 sm:grid-cols-3">
                      <select value={commentFilter} onChange={(e) => setCommentFilter(e.target.value as "all" | "mine")} className="rounded-lg border border-white/15 bg-zinc-950/60 px-2 py-2 text-xs outline-none">
                        <option value="all">All comments</option>
                        <option value="mine">My comments</option>
                      </select>
                      <select value={commentSort} onChange={(e) => setCommentSort(e.target.value as "newest" | "oldest")} className="rounded-lg border border-white/15 bg-zinc-950/60 px-2 py-2 text-xs outline-none">
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                      </select>
                      <input value={commentSearch} onChange={(e) => setCommentSearch(e.target.value)} placeholder="Search comments..." className="rounded-lg border border-white/15 bg-zinc-950/60 px-2 py-2 text-xs outline-none" />
                    </div>

                    <div className="mb-4 rounded-xl border border-white/10 bg-zinc-900/60 p-4">
                      <p className="mb-2 text-sm font-medium text-zinc-200">Write a new comment</p>
                      <textarea
                        value={newComment}
                        onChange={(event) => setNewComment(event.target.value)}
                        maxLength={500}
                        rows={4}
                        placeholder={user ? "Share your experience..." : "Login to leave a comment"}
                        disabled={!user || creatingComment}
                        className="w-full rounded-xl border border-white/10 bg-zinc-950/60 p-3 text-sm text-zinc-200 outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button type="button" onClick={createComment} disabled={creatingComment || !newComment.trim()} className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-zinc-950 hover:opacity-90 disabled:opacity-60">
                          <SendHorizontal className="h-4 w-4" />
                          {creatingComment ? "Posting..." : "Post comment"}
                        </button>
                        {!user && (
                          <Link to="/login" className="rounded-lg border border-white/20 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-800">
                            Login to comment
                          </Link>
                        )}
                      </div>
                    </div>

                    {commentsLoading && comments.length === 0 ? (
                      <p className="text-sm text-zinc-400">Loading comments...</p>
                    ) : comments.length === 0 ? (
                      <p className="text-sm text-zinc-400">No comments found.</p>
                    ) : (
                      <div className="h-[30rem] space-y-2 overflow-y-auto pr-1">
                        {comments.map((comment) => (
                          <article key={comment._id} className="rounded-lg border border-white/10 bg-zinc-900/60 p-2.5">
                            <div className="mb-1 flex items-center justify-between gap-2">
                              <p className="truncate text-xs font-semibold text-zinc-100">{comment.user?.name || "User"}</p>
                              <p className="text-xs text-zinc-500">{formatDate(comment.updatedAt || comment.createdAt)}</p>
                            </div>
                            <p className="max-h-24 overflow-y-auto pr-1 text-xs leading-5 text-zinc-300 break-words [overflow-wrap:anywhere]">
                              {comment.comment}
                            </p>
                            {comment.isMine && (
                              <button type="button" onClick={() => removeComment(comment._id)} disabled={deletingCommentId === comment._id} className="mt-2 inline-flex items-center gap-1 rounded-md border border-red-400/40 px-2 py-1 text-[11px] text-red-300 hover:bg-red-500/10 disabled:opacity-60">
                                <Trash2 className="h-3 w-3" />
                                {deletingCommentId === comment._id ? "Deleting..." : "Delete"}
                              </button>
                            )}
                          </article>
                        ))}
                      </div>
                    )}

                    {commentsPagination.hasNext && (
                      <button type="button" onClick={() => refreshComments(commentsPagination.page + 1, true)} disabled={commentsLoading} className="mt-4 w-full rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-60">
                        {commentsLoading ? "Loading..." : "Load more"}
                      </button>
                    )}
                  </>
                )}
              </section>

              <div className="rounded-xl border border-white/10 bg-zinc-800/70 p-4">
                <p className="mb-2 inline-flex items-center gap-2 text-zinc-400">
                  <Car className="h-4 w-4" />
                  Description
                </p>
                <p className="text-sm leading-6 text-zinc-200">{car.description || "No description provided."}</p>
              </div>

              {isReserved && activeBooking && (
                <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-4">
                  <p className="mb-2 text-sm font-semibold text-amber-200">Reserved by client</p>
                  <div className="grid gap-2 text-sm text-zinc-200 md:grid-cols-2">
                    <p>Full name: {activeBooking.fullName || activeBooking.userId?.name || "N/A"}</p>
                    <p>Email: {activeBooking.email || activeBooking.userId?.email || "N/A"}</p>
                    <p>Phone: {activeBooking.phone || "N/A"}</p>
                    <p>Driver license: {activeBooking.driverLicenseNumber || "N/A"}</p>
                    <p>License expiry: {formatDate(activeBooking.driverLicenseExpiry)}</p>
                    <p>Status: {activeBooking.statut}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Link to="/cars" className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-zinc-800">
                  Browse more cars
                </Link>
                {car.disponible && user?.role !== "admin" && (
                  <Link to={user ? `/booking/${car._id}` : "/login"} className="rounded-xl bg-primary/90 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-primary">
                    {user ? "Book now" : "Login to book"}
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}
      </div>

      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setIsLightboxOpen(false)} role="dialog" aria-modal="true" aria-label="Car image fullscreen view">
          <button type="button" onClick={() => setIsLightboxOpen(false)} className="absolute right-4 top-4 rounded-full border border-white/30 p-2 text-white hover:bg-white/10" aria-label="Close fullscreen image">
            <X className="h-5 w-5" />
          </button>
          <img src={imageSrc} alt={carAlt} className="max-h-[90vh] w-auto max-w-full object-contain" onClick={(event) => event.stopPropagation()} />
          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/30 p-2 text-white hover:bg-white/10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/30 p-2 text-white hover:bg-white/10"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}
