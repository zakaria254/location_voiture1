import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { fetchReservedCarIds } from "../utils/reservedCars";

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

  useEffect(() => {
    Promise.all([api.get("/cars?limit=50&sort=-createdAt"), fetchReservedCarIds()])
      .then(([carsRes, ids]) => {
        const list = carsRes.data?.data?.cars ?? [];
        setCars(list);
        setReservedCarIds(ids);
      })
      .catch(() => {
        setError("Unable to load fleet right now.");
      })
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
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none"
                placeholder="Search marque/model"
              />
              <input
                value={descriptionSearch}
                onChange={(e) => setDescriptionSearch(e.target.value)}
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none"
                placeholder="Description contains..."
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none"
                placeholder="Min price/day"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none"
                placeholder="Max price/day"
              />
              <input
                type="number"
                min="1900"
                value={minYear}
                onChange={(e) => setMinYear(e.target.value)}
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none"
                placeholder="Min year"
              />
              <input
                type="number"
                min="1900"
                value={maxYear}
                onChange={(e) => setMaxYear(e.target.value)}
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none"
                placeholder="Max year"
              />
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value as "all" | "available" | "unavailable")}
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none"
              >
                <option value="all">All availability</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
              <select
                value={reservationFilter}
                onChange={(e) => setReservationFilter(e.target.value as "all" | "reserved" | "not_reserved")}
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none"
              >
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
              <article key={car._id} className="rounded-2xl border border-white/10 bg-zinc-900/70 overflow-hidden">
                <img
                  src={car.images?.[0] || car.image || "https://via.placeholder.com/800x500?text=Car"}
                  alt={`${car.marque} ${car.modele}`}
                  className="h-48 w-full object-cover"
                />
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">
                      {car.marque} {car.modele}
                    </h2>
                    {reservedCarIds.includes(car._id) && (
                      <span className="rounded-full border border-amber-400/40 bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-200">
                        Reserved
                      </span>
                    )}
                  </div>
                  <p className="text-zinc-400 mt-1">
                    {car.annee || "N/A"} | {car.disponible ? "Available" : "Unavailable"}
                  </p>
                  <p className="text-primary font-bold mt-4">${car.prixParJour}/day</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to={`/cars/${car._id}`}
                      className="inline-block px-4 py-2 rounded-xl bg-white text-black font-medium hover:bg-zinc-200 transition"
                    >
                      View details
                    </Link>
                    {car.disponible ? (
                      <Link
                        to={user ? `/booking/${car._id}` : "/login"}
                        className="inline-block px-4 py-2 rounded-xl bg-primary/90 text-zinc-950 font-semibold hover:bg-primary transition"
                      >
                        {user ? "Book now" : "Login to book"}
                      </Link>
                    ) : (
                      <span className="inline-block px-4 py-2 rounded-xl border border-red-400/40 text-red-300 text-sm">
                        Unavailable
                      </span>
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
    </main>
  );
}
