import { Eye, Pencil, Trash2 } from "lucide-react";
import type { CarItem } from "../types";
import { formatDate } from "../utils";
import { Link } from "react-router-dom";

type OverviewPanelProps = {
  carsLoading: boolean;
  cars: CarItem[];
  reservedCarIds: string[];
  onEditCar: (car: CarItem) => void;
  onDeleteCar: (carId: string) => void;
  pendingBookingsCount: number;
  confirmedBookingsCount: number;
  inProgressBookingsCount: number;
};

export default function OverviewPanel({
  carsLoading,
  cars,
  reservedCarIds,
  onEditCar,
  onDeleteCar,
  pendingBookingsCount,
  confirmedBookingsCount,
  inProgressBookingsCount,
}: OverviewPanelProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Latest 5 cars</h2>
          <span className="text-xs text-zinc-400">Sorted by newest</span>
        </div>

        {carsLoading ? (
          <p className="text-zinc-400">Loading cars...</p>
        ) : cars.length === 0 ? (
          <p className="text-zinc-400">No cars found.</p>
        ) : (
          <div className="space-y-3">
            {cars.map((car) => (
              <article key={car._id} className="rounded-xl border border-white/10 bg-zinc-800/70 p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    {(car.images?.[0] || car.image) ? (
                      <img
                        src={car.images?.[0] || car.image}
                        alt={`${car.marque} ${car.modele}`}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-zinc-700" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {car.marque} {car.modele}
                      </p>
                      {reservedCarIds.includes(car._id) && (
                        <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-200">
                          Reserved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-400">
                      Added: {formatDate(car.createdAt)} | {car.prixParJour} MAD/day |{" "}
                      {car.disponible ? "Available" : "Unavailable"}
                    </p>
                  </div>
                  <div className="flex gap-2 md:ml-auto md:justify-between">
                    <Link
                      to={`/cars/${car._id}?from=admin`}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-400/50 px-3 py-1.5 text-sm text-blue-200 hover:bg-blue-500/15"
                    >
                      <Eye className="h-4 w-4" /> View
                    </Link>
                    <button
                      type="button"
                      onClick={() => onEditCar(car)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-zinc-700"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCar(car._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-400/50 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/15"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
        <h2 className="mb-4 text-xl font-semibold">Booking pipeline</h2>
        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-zinc-800/70 p-4">
            <p className="text-zinc-400">Pending</p>
            <p className="text-2xl font-bold">{pendingBookingsCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-800/70 p-4">
            <p className="text-zinc-400">Confirmed</p>
            <p className="text-2xl font-bold">{confirmedBookingsCount}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-800/70 p-4">
            <p className="text-zinc-400">In progress</p>
            <p className="text-2xl font-bold">{inProgressBookingsCount}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

