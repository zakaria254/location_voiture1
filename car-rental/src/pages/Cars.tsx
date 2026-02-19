import { useEffect, useState } from "react";
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
  annee?: number;
  disponible?: boolean;
};

export default function Cars() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [reservedCarIds, setReservedCarIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/cars?limit=12"), fetchReservedCarIds()])
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cars.map((car) => (
              <article key={car._id} className="rounded-2xl border border-white/10 bg-zinc-900/70 overflow-hidden">
                <img
                  src={car.image || "https://via.placeholder.com/800x500?text=Car"}
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
      </section>
    </main>
  );
}
