import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Car, CircleDollarSign, ShieldCheck } from "lucide-react";
import api from "../../../api/axiosInstance";
import type { CarItem } from "../types";
import { formatDate, showApiError } from "../utils";

export default function AdminCarDetails() {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<CarItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchCar = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/cars/${id}`);
        setCar(response.data?.data?.car ?? null);
      } catch (error) {
        showApiError(error, "Unable to load car details.");
        setCar(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-10 pt-28 text-white md:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to admin
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
            {car.image ? (
              <img src={car.image} alt={`${car.marque} ${car.modele}`} className="h-72 w-full object-cover" />
            ) : (
              <div className="h-72 w-full bg-zinc-800" />
            )}

            <div className="space-y-6 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl font-bold">
                    {car.marque} {car.modele}
                  </h1>
                  <p className="text-sm text-zinc-400">ID: {car._id}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    car.disponible ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
                  }`}
                >
                  {car.disponible ? "Available" : "Unavailable"}
                </span>
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

              <div className="rounded-xl border border-white/10 bg-zinc-800/70 p-4">
                <p className="mb-2 inline-flex items-center gap-2 text-zinc-400">
                  <Car className="h-4 w-4" />
                  Description
                </p>
                <p className="text-sm leading-6 text-zinc-200">{car.description || "No description provided."}</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
