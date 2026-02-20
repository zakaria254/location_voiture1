import { useEffect, useMemo, useState } from "react";
import api from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";
import { showApiError } from "../../pages/admin/utils";
import { fetchReservedCarIds } from "../../utils/reservedCars";
import type {
  AvailabilityFilter,
  Car,
  CommentFilter,
  CommentItem,
  CommentPagination,
  CommentSort,
  ReservationFilter,
} from "./types";

const INITIAL_PAGINATION: CommentPagination = {
  total: 0,
  page: 1,
  limit: 6,
  pages: 0,
  hasNext: false,
  hasPrev: false,
};

export default function useCarsPage() {
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
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");
  const [reservationFilter, setReservationFilter] = useState<ReservationFilter>("all");

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
  const [panelPagination, setPanelPagination] = useState<CommentPagination>(INITIAL_PAGINATION);
  const [commentFilter, setCommentFilter] = useState<CommentFilter>("all");
  const [commentSort, setCommentSort] = useState<CommentSort>("newest");
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

  const selectedCar = useMemo(
    () => (panelCarId ? cars.find((car) => car._id === panelCarId) ?? null : null),
    [cars, panelCarId]
  );

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
      const pagination = response.data?.data?.pagination ?? INITIAL_PAGINATION;

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

  return {
    user,
    cars,
    filteredCars,
    reservedCarIds,
    loading,
    error,
    search,
    descriptionSearch,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    availabilityFilter,
    reservationFilter,
    ratingSavingCarId,
    hoveredRating,
    panelCarId,
    selectedCar,
    panelRating,
    ratingSavingInPanel,
    newComment,
    creatingComment,
    deletingCommentId,
    panelComments,
    panelLoading,
    panelPagination,
    commentFilter,
    commentSort,
    commentSearch,
    setSearch,
    setDescriptionSearch,
    setMinPrice,
    setMaxPrice,
    setMinYear,
    setMaxYear,
    setAvailabilityFilter,
    setReservationFilter,
    setHoveredRating,
    setPanelRating,
    setNewComment,
    setCommentFilter,
    setCommentSort,
    setCommentSearch,
    openComments,
    closePanel,
    handleRate,
    updateRatingFromPanel,
    createComment,
    removeComment,
    loadComments,
  };
}
