import { useState } from "react";
import api from "../api/axiosInstance";
import { showApiError } from "../pages/admin/utils";

type CarRatingProps = {
  carId: string;
  initialAverageRating: number;
  initialTotalRatings: number;
  initialUserRating?: number | null;
  isLoggedIn: boolean;
  canRate: boolean;
  loginPath?: string;
  onRated?: (payload: { averageRating: number; totalRatings: number; userRating: number }) => void;
};

export default function CarRating({
  carId,
  initialAverageRating,
  initialTotalRatings,
  initialUserRating = null,
  isLoggedIn,
  canRate,
  loginPath = "/login",
  onRated
}: CarRatingProps) {
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [totalRatings, setTotalRatings] = useState(initialTotalRatings);
  const [userRating, setUserRating] = useState<number | null>(initialUserRating);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const activeValue = canRate ? (hoverValue ?? userRating ?? 0) : (userRating ?? 0);

  const handleStarClick = async (value: number) => {
    if (saving) return;

    if (!canRate) {
      if (!isLoggedIn) {
        window.location.href = loginPath;
      }
      return;
    }

    setSaving(true);
    try {
      const response = await api.put(`/cars/${carId}/rating`, { rating: value });
      const nextAverage = Number(response.data?.data?.ratings?.averageRating ?? averageRating);
      const nextTotal = Number(response.data?.data?.ratings?.totalRatings ?? totalRatings);

      setUserRating(value);
      setAverageRating(nextAverage);
      setTotalRatings(nextTotal);
      onRated?.({ averageRating: nextAverage, totalRatings: nextTotal, userRating: value });
    } catch (error) {
      showApiError(error, "Unable to submit rating.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-800/70 p-4">
      <p className="text-sm text-zinc-200">
        ⭐ {averageRating.toFixed(1)} <span className="text-zinc-400">({totalRatings} reviews)</span>
      </p>

      <div className="mt-2 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => canRate && setHoverValue(star)}
            onMouseLeave={() => canRate && setHoverValue(null)}
            disabled={saving}
            className={`rounded-md px-0.5 text-2xl leading-none transition ${
              star <= activeValue ? "text-yellow-400" : "text-zinc-500"
            } ${(canRate || !isLoggedIn) ? "hover:scale-110" : "cursor-default"} disabled:opacity-60`}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
        {userRating ? <span className="ml-2 text-xs text-zinc-400">Your rating: {userRating}/5</span> : null}
        {!isLoggedIn ? <span className="ml-2 text-xs text-zinc-400">Login to rate</span> : null}
      </div>
    </div>
  );
}
