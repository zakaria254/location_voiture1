import { Link } from "react-router-dom";
import { MessageSquare, Star } from "lucide-react";
import type { Car } from "./types";

type CarsGridCardProps = {
  car: Car;
  isReserved: boolean;
  isLoggedIn: boolean;
  ratingSaving: boolean;
  previewRating: number;
  onRate: (value: number) => void;
  onHoverRating: (value: number) => void;
  onLeaveRating: () => void;
  onOpenComments: () => void;
};

export default function CarsGridCard({
  car,
  isReserved,
  isLoggedIn,
  ratingSaving,
  previewRating,
  onRate,
  onHoverRating,
  onLeaveRating,
  onOpenComments,
}: CarsGridCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70">
      <div className="relative">
        <img src={car.images?.[0] || car.image || "https://via.placeholder.com/800x500?text=Car"} alt={`${car.marque} ${car.modele}`} className="h-48 w-full object-cover" />
        <div className="absolute left-3 top-3 rounded-full border border-white/25 bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-current text-yellow-400" />
            {Number(car.averageRating ?? 0).toFixed(1)}
          </span>
          <span className="ml-1 text-zinc-300">({Number(car.totalRatings ?? 0)})</span>
        </div>
        <div className="absolute left-3 top-12 translate-y-1 rounded-xl border border-white/15 bg-black/65 px-2 py-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((starValue) => (
              <button
                key={starValue}
                type="button"
                onClick={() => onRate(starValue)}
                onMouseEnter={() => onHoverRating(starValue)}
                onMouseLeave={onLeaveRating}
                disabled={ratingSaving}
                className={`text-lg leading-none transition ${starValue <= previewRating ? "text-yellow-400" : "text-zinc-400"} hover:scale-110 disabled:opacity-60`}
                aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">
            {car.marque} {car.modele}
          </h2>
          {isReserved && (
            <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-200">Reserved</span>
          )}
        </div>
        <p className="mt-1 text-zinc-400">
          {car.annee || "N/A"} | {car.disponible ? "Available" : "Unavailable"}
        </p>
        <p className="mt-4 font-bold text-primary">${car.prixParJour}/day</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/cars/${car._id}`} className="inline-block rounded-xl bg-white px-4 py-2 font-medium text-black transition hover:bg-zinc-200">
            View details
          </Link>
          <button type="button" onClick={onOpenComments} className="inline-flex items-center gap-1 rounded-xl border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-zinc-800">
            <MessageSquare className="h-4 w-4" />
            Comments
          </button>
          {car.disponible ? (
            <Link to={isLoggedIn ? `/booking/${car._id}` : "/login"} className="inline-block rounded-xl bg-primary/90 px-4 py-2 font-semibold text-zinc-950 transition hover:bg-primary">
              {isLoggedIn ? "Book now" : "Login to book"}
            </Link>
          ) : (
            <span className="inline-block rounded-xl border border-red-400/40 px-4 py-2 text-sm text-red-300">Unavailable</span>
          )}
        </div>
      </div>
    </article>
  );
}
