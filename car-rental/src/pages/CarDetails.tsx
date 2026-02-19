import { useEffect, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, Car, CircleDollarSign, ShieldCheck, X } from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import type { CarItem } from "./admin/types";
import { formatDate, showApiError } from "./admin/utils";

export default function CarDetails() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [car, setCar] = useState<CarItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const fromAdmin = searchParams.get("from") === "admin";
  const isAdminPath = location.pathname.startsWith("/admin/") || fromAdmin;
  const backTo = isAdminPath ? "/admin" : "/cars";
  const backLabel = isAdminPath ? "Back to admin" : "Back to cars";

  useEffect(() => {
    if (!id) return;

    const fetchCar = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/cars/${id}`);
        setCar(response.data?.data?.car ?? null);
        setImageFailed(false);
      } catch (error) {
        showApiError(error, "Unable to load car details.");
        setCar(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [id]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLightboxOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen]);

  const normalizedImage = car?.image?.trim();
  const imageSrc = !imageFailed && normalizedImage ? normalizedImage : "https://via.placeholder.com/1200x700?text=Car";
  const carAlt = car ? `${car.marque} ${car.modele}` : "Car image";

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-10 pt-28 text-white md:px-6">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-zinc-800"
        >
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
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="block w-full cursor-zoom-in bg-zinc-900"
              aria-label="Open car image fullscreen"
            >
              <img
                src={imageSrc}
                alt={carAlt}
                className="h-72 w-full bg-zinc-900 object-contain"
                onError={() => setImageFailed(true)}
              />
            </button>

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

              <div className="flex flex-wrap gap-3">
                <Link to="/cars" className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-zinc-800">
                  Browse more cars
                </Link>
                {car.disponible && user?.role !== "admin" && (
                  <Link
                    to={user ? `/booking/${car._id}` : "/login"}
                    className="rounded-xl bg-primary/90 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-primary"
                  >
                    {user ? "Book now" : "Login to book"}
                  </Link>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Car image fullscreen view"
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-4 top-4 rounded-full border border-white/30 p-2 text-white hover:bg-white/10"
            aria-label="Close fullscreen image"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={imageSrc}
            alt={carAlt}
            className="max-h-[90vh] w-auto max-w-full object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
