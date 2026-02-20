import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, SendHorizontal, Star, Trash2, X } from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { fetchReservedCarIds } from "../utils/reservedCars";
import { formatDate, showApiError } from "./admin/utils";

type Car = {
  _id: string;
  marque: string;
  modele: string;
  prixParJour: number;
  image?: string;
  images?: string[];
  annee?: number;
  disponible?: boolean;
  description?: string;
  averageRating?: number;
  totalRatings?: number;
  userRating?: number | null;
};

type CommentItem = {
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

export default function Cars() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [reservedCarIds, setReservedCarIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [descriptionSearch, setDescriptionSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");
  const [reservationFilter, setReservationFilter] = useState<"all" | "reserved" | "not_reserved">("all");
  const [ratingSavingCarId, setRatingSavingCarId] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState<{ carId: string; value: number } | null>(null);

  const [panelCarId, setPanelCarId] = useState<string | null>(null);
  const [panelRating, setPanelRating] = useState(5);
  const [ratingSavingInPanel, setRatingSavingInPanel] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [creatingComment, setCreatingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [panelComments, setPanelComments] = useState<CommentItem[]>([]);
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelPagination, setPanelPagination] = useState<CommentPagination>({
    total: 0,
    page: 1,
    limit: 6,
    pages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [commentFilter, setCommentFilter] = useState<"all" | "mine">("all");
  const [commentSort, setCommentSort] = useState<"newest" | "oldest">("newest");
  const [commentSearch, setCommentSearch] = useState("");

  useEffect(() => {
    Promise.all([api.get("/cars?limit=50&sort=-createdAt"), fetchReservedCarIds()])
      .then(([carsRes, ids]) => {
        setCars(carsRes.data?.data?.cars ?? []);
        setReservedCarIds(ids);
      })
      .catch(() => setError("Unable to load fleet right now."))
      .finally(() => setLoading(false));
  }, []);

  const filteredCars = useMemo(() => {
    const q = search.trim().toLowerCase();
    const descQ = descriptionSearch.trim().toLowerCase();
    const minP = minPrice ? Number(minPrice) : null;
    const maxP = maxPrice ? Number(maxPrice) : null;
    const minY = minYear ? Number(minYear) : null;
    const maxY = maxYear ? Number(maxYear) : null;

    return cars.filter((car) => {
      const label = `${car.marque || ""} ${car.modele || ""}`.toLowerCase();
      if (q && !label.includes(q)) return false;

      const description = (car.description || "").toLowerCase();
      if (descQ && !description.includes(descQ)) return false;

      const price = Number(car.prixParJour || 0);
      if (minP !== null && price < minP) return false;
      if (maxP !== null && price > maxP) return false;

      const year = Number(car.annee || 0);
      if (minY !== null && year < minY) return false;
      if (maxY !== null && year > maxY) return false;

      if (availabilityFilter === "available" && !car.disponible) return false;
      if (availabilityFilter === "unavailable" && car.disponible) return false;

      const isReserved = reservedCarIds.includes(car._id);
      if (reservationFilter === "reserved" && !isReserved) return false;
      if (reservationFilter === "not_reserved" && isReserved) return false;

      return true;
    });
  }, [
    cars,
    search,
    descriptionSearch,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    availabilityFilter,
    reservationFilter,
    reservedCarIds,
  ]);

  const selectedCar = panelCarId ? cars.find((car) => car._id === panelCarId) ?? null : null;

  const loadComments = async (carId: string, page = 1, append = false) => {
    setPanelLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "6");
      params.set("sort", commentSort);
      if (commentFilter === "mine") params.set("mine", "true");
      if (commentSearch.trim()) params.set("search", commentSearch.trim());

      const response = await api.get(`/cars/${carId}/comments?${params.toString()}`);
      const comments = response.data?.data?.comments ?? [];
      const pagination = response.data?.data?.pagination ?? panelPagination;

      setPanelComments((prev) => (append ? [...prev, ...comments] : comments));
      setPanelPagination(pagination);
    } catch (error) {
      showApiError(error, "Unable to load comments.");
      if (!append) setPanelComments([]);
    } finally {
      setPanelLoading(false);
    }
  };

  const openComments = (car: Car) => {
    setPanelCarId(car._id);
    setPanelRating(Number(car.userRating ?? 5));
    setNewComment("");
    setCommentFilter("all");
    setCommentSort("newest");
    setCommentSearch("");
  };

  useEffect(() => {
    if (!panelCarId) return;
    const timeout = setTimeout(() => {
      loadComments(panelCarId, 1, false);
    }, 250);
    return () => clearTimeout(timeout);
  }, [panelCarId, commentFilter, commentSort, commentSearch]);

  const closePanel = () => {
    setPanelCarId(null);
    setPanelComments([]);
    setNewComment("");
  };

  const handleRate = async (carId: string, value: number) => {
    if (ratingSavingCarId) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setRatingSavingCarId(carId);
    try {
      const response = await api.put(`/cars/${carId}/rating`, { rating: value });
      const averageRating = Number(response.data?.data?.ratings?.averageRating ?? 0);
      const totalRatings = Number(response.data?.data?.ratings?.totalRatings ?? 0);

      setCars((prev) =>
        prev.map((item) =>
          item._id === carId
            ? { ...item, averageRating, totalRatings, userRating: value }
            : item
        )
      );
    } catch (error) {
      showApiError(error, "Unable to submit rating.");
    } finally {
      setRatingSavingCarId(null);
    }
  };

  const updateRatingFromPanel = async () => {
    if (!panelCarId) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }

    setRatingSavingInPanel(true);
    try {
      const response = await api.put(`/cars/${panelCarId}/rating`, { rating: panelRating });
      const averageRating = Number(response.data?.data?.ratings?.averageRating ?? 0);
      const totalRatings = Number(response.data?.data?.ratings?.totalRatings ?? 0);

      setCars((prev) =>
        prev.map((item) =>
          item._id === panelCarId
            ? { ...item, averageRating, totalRatings, userRating: panelRating }
            : item
        )
      );
    } catch (error) {
      showApiError(error, "Unable to update rating.");
    } finally {
      setRatingSavingInPanel(false);
    }
  };

  const createComment = async () => {
    if (!panelCarId) return;
    if (!user) {
      window.location.href = "/login";
      return;
    }

    if (!newComment.trim()) return;

    setCreatingComment(true);
    try {
      await api.post(`/cars/${panelCarId}/comments`, { comment: newComment.trim() });
      setNewComment("");
      await loadComments(panelCarId, 1, false);
    } catch (error) {
      showApiError(error, "Unable to post comment.");
    } finally {
      setCreatingComment(false);
    }
  };

  const removeComment = async (commentId: string) => {
    if (!panelCarId) return;
    setDeletingCommentId(commentId);
    try {
      await api.delete(`/cars/${panelCarId}/comments/${commentId}`);
      await loadComments(panelCarId, 1, false);
    } catch (error) {
      showApiError(error, "Unable to delete comment.");
    } finally {
      setDeletingCommentId(null);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 pt-32 pb-16 px-6">
      <section className="max-w-7xl mx-auto">
        <header className="mb-10">
          <p className="text-primary uppercase tracking-[0.2em] text-xs">Fleet</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mt-2">Choose Your Ride</h1>
        </header>

        {loading && <p className="text-zinc-300">Loading cars...</p>}
        {!loading && error && <p className="text-red-400">{error}</p>}
        {!loading && !error && cars.length === 0 && (
          <p className="text-zinc-400">No cars found. Add cars from admin API first.</p>
        )}

        {!loading && cars.length > 0 && (
          <>
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none" placeholder="Search marque/model" />
              <input value={descriptionSearch} onChange={(e) => setDescriptionSearch(e.target.value)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none" placeholder="Description contains..." />
              <input type="number" min="0" step="0.01" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none" placeholder="Min price/day" />
              <input type="number" min="0" step="0.01" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none" placeholder="Max price/day" />
              <input type="number" min="1900" value={minYear} onChange={(e) => setMinYear(e.target.value)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none" placeholder="Min year" />
              <input type="number" min="1900" value={maxYear} onChange={(e) => setMaxYear(e.target.value)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none" placeholder="Max year" />
              <select value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value as "all" | "available" | "unavailable")} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none">
                <option value="all">All availability</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
              <select value={reservationFilter} onChange={(e) => setReservationFilter(e.target.value as "all" | "reserved" | "not_reserved")} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none">
                <option value="all">All reservation states</option>
                <option value="reserved">Reserved</option>
                <option value="not_reserved">Not reserved</option>
              </select>
            </div>

            {filteredCars.length === 0 ? (
              <p className="text-zinc-400">No cars match your current filters.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCars.map((car) => (
                  <article key={car._id} className="group rounded-2xl border border-white/10 bg-zinc-900/70 overflow-hidden">
                    <div className="relative">
                      <img src={car.images?.[0] || car.image || "https://via.placeholder.com/800x500?text=Car"} alt={`${car.marque} ${car.modele}`} className="h-48 w-full object-cover" />
                      <div className="absolute left-3 top-3 rounded-full border border-white/25 bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                        ⭐ {Number(car.averageRating ?? 0).toFixed(1)}
                        <span className="ml-1 text-zinc-300">({Number(car.totalRatings ?? 0)})</span>
                      </div>
                      <div className="absolute left-3 top-12 rounded-xl border border-white/15 bg-black/65 px-2 py-1 opacity-0 translate-y-1 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((starValue) => {
                            const preview = hoveredRating?.carId === car._id ? hoveredRating.value : Number(car.userRating ?? 0);
                            return (
                              <button
                                key={starValue}
                                type="button"
                                onClick={() => handleRate(car._id, starValue)}
                                onMouseEnter={() => setHoveredRating({ carId: car._id, value: starValue })}
                                onMouseLeave={() => setHoveredRating(null)}
                                disabled={ratingSavingCarId === car._id}
                                className={`text-lg leading-none transition ${starValue <= preview ? "text-yellow-400" : "text-zinc-400"} hover:scale-110 disabled:opacity-60`}
                                aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
                              >
                                ★
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold">{car.marque} {car.modele}</h2>
                        {reservedCarIds.includes(car._id) && (
                          <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-200">Reserved</span>
                        )}
                      </div>
                      <p className="text-zinc-400 mt-1">{car.annee || "N/A"} | {car.disponible ? "Available" : "Unavailable"}</p>
                      <p className="text-primary font-bold mt-4">${car.prixParJour}/day</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Link to={`/cars/${car._id}`} className="inline-block px-4 py-2 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition">View details</Link>
                        <button type="button" onClick={() => openComments(car)} className="inline-flex items-center gap-1 rounded-xl border border-white/20 px-4 py-2 text-sm text-white hover:bg-zinc-800 transition">
                          <MessageSquare className="h-4 w-4" />
                          Comments
                        </button>
                        {car.disponible ? (
                          <Link to={user ? `/booking/${car._id}` : "/login"} className="inline-block px-4 py-2 rounded-xl bg-primary/90 text-zinc-950 font-semibold hover:bg-primary transition">
                            {user ? "Book now" : "Login to book"}
                          </Link>
                        ) : (
                          <span className="inline-block px-4 py-2 rounded-xl border border-red-400/40 text-red-300 text-sm">Unavailable</span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {panelCarId && selectedCar && (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 backdrop-blur-sm" onClick={closePanel}>
          <div className="mx-auto mt-14 max-h-[82vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-zinc-900 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-sm text-zinc-400">Comments & rating</p>
                <h3 className="text-lg font-semibold">{selectedCar.marque} {selectedCar.modele}</h3>
              </div>
              <button type="button" onClick={closePanel} className="rounded-lg border border-white/20 p-2 text-zinc-200 hover:bg-zinc-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-0 md:grid-cols-2">
              <div className="border-b border-white/10 p-5 md:border-b-0 md:border-r">
                <p className="mb-2 text-sm font-medium text-zinc-300">Your rating</p>
                <div className="mb-3 flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((starValue) => (
                    <button key={starValue} type="button" onClick={() => setPanelRating(starValue)} className={`text-2xl transition ${starValue <= panelRating ? "text-yellow-400" : "text-zinc-500"}`}>
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  ))}
                </div>
                <button type="button" onClick={updateRatingFromPanel} disabled={ratingSavingInPanel} className="mb-5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-zinc-950 hover:opacity-90 disabled:opacity-60">
                  {ratingSavingInPanel ? "Updating..." : "Update rating"}
                </button>

                <p className="mb-2 text-sm font-medium text-zinc-300">Write a new comment</p>
                <textarea value={newComment} onChange={(event) => setNewComment(event.target.value)} maxLength={500} rows={5} disabled={!user || creatingComment} placeholder={user ? "Write your comment..." : "Login to comment"} className="w-full rounded-xl border border-white/15 bg-zinc-950/70 p-3 text-sm outline-none focus:border-primary disabled:opacity-60" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={createComment} disabled={creatingComment || !newComment.trim()} className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-zinc-950 hover:opacity-90 disabled:opacity-60">
                    <SendHorizontal className="h-4 w-4" />
                    {creatingComment ? "Posting..." : "Post comment"}
                  </button>
                  {!user && <Link to="/login" className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-zinc-800">Login</Link>}
                </div>
              </div>

              <div className="h-[56vh] overflow-y-auto p-4">
                <div className="mb-3 grid gap-2 sm:grid-cols-3">
                  <select value={commentFilter} onChange={(e) => setCommentFilter(e.target.value as "all" | "mine")} className="rounded-lg border border-white/15 bg-zinc-950/60 px-2 py-2 text-xs">
                    <option value="all">All comments</option>
                    <option value="mine">My comments</option>
                  </select>
                  <select value={commentSort} onChange={(e) => setCommentSort(e.target.value as "newest" | "oldest")} className="rounded-lg border border-white/15 bg-zinc-950/60 px-2 py-2 text-xs">
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                  </select>
                  <input value={commentSearch} onChange={(e) => setCommentSearch(e.target.value)} placeholder="Search text..." className="rounded-lg border border-white/15 bg-zinc-950/60 px-2 py-2 text-xs outline-none" />
                </div>

                <p className="mb-3 text-xs text-zinc-400">{panelPagination.total} comment(s)</p>

                {panelLoading && panelComments.length === 0 ? (
                  <p className="text-sm text-zinc-400">Loading comments...</p>
                ) : panelComments.length === 0 ? (
                  <p className="text-sm text-zinc-400">No comments found.</p>
                ) : (
                  <div className="space-y-2">
                    {panelComments.map((comment) => (
                      <article key={comment._id} className="rounded-lg border border-white/10 bg-zinc-950/50 p-2.5">
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

                {panelPagination.hasNext && (
                  <button type="button" onClick={() => loadComments(panelCarId, panelPagination.page + 1, true)} disabled={panelLoading} className="mt-4 w-full rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-60">
                    {panelLoading ? "Loading..." : "Load more"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
