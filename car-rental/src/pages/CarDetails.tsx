import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, Car, ChevronLeft, ChevronRight, CircleDollarSign, ShieldCheck, X } from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import type { BookingItem, CarItem } from "./admin/types";
import { formatDate, showApiError } from "./admin/utils";
import { fetchReservedCarIds } from "../utils/reservedCars";

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

  const fromAdmin = searchParams.get("from") === "admin";
  const isAdminPath = location.pathname.startsWith("/admin/") || fromAdmin;
  const backTo = isAdminPath ? "/admin" : "/cars";
  const backLabel = isAdminPath ? "Back to admin" : "Back to cars";

  useEffect(() => {
    if (!id) return;

    const fetchCar = async () => {
      setLoading(true);
      try {
        const [carRes, ids] = await Promise.all([api.get(`/cars/${id}`), fetchReservedCarIds()]);
        setCar(carRes.data?.data?.car ?? null);
        setReservedCarIds(ids);
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
  }, [id]);

  const galleryImages = useMemo(() => {
    if (!car) return ["https://via.placeholder.com/1200x700?text=Car"];
    const raw = Array.isArray(car.images) && car.images.length ? car.images : (car.image ? [car.image] : []);
    const cleaned = raw.map((img) => (img || "").trim()).filter(Boolean);
    return cleaned.length ? cleaned : ["https://via.placeholder.com/1200x700?text=Car"];
  }, [car]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsLightboxOpen(false);
      if (event.key === "ArrowRight") {
        setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
      }
      if (event.key === "ArrowLeft") {
        setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
      }
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
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border ${
                      activeImageIndex === index ? "border-primary" : "border-white/10"
                    }`}
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
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    car.disponible ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"
                  }`}
                >
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
