import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, CircleDollarSign, IdCard, Mail, Phone, ShieldCheck, User } from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import type { BookingItem } from "./admin/types";
import { formatDate, showApiError } from "./admin/utils";

function getAge(dateOfBirth?: string) {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 ? age : null;
}

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/bookings/${id}`);
        setBooking(response.data?.data?.booking ?? null);
      } catch (error) {
        showApiError(error, "Unable to load booking details.");
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const carImages = useMemo(() => {
    const raw = booking?.carId?.images?.length ? booking.carId.images : (booking?.carId?.image ? [booking.carId.image] : []);
    return raw.length ? raw : ["https://via.placeholder.com/1200x700?text=Car"];
  }, [booking]);

  const age = getAge(booking?.dateOfBirth);
  const backTo = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-12 pt-28 text-white md:px-6">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <button
          type="button"
          onClick={() => navigate(backTo)}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {loading ? (
          <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 text-zinc-400">Loading booking details...</section>
        ) : !booking ? (
          <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6 text-zinc-400">Booking not found.</section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
              <h2 className="text-xl font-semibold">Car information</h2>
              <img
                src={carImages[activeImageIndex]}
                alt={`${booking.carId?.marque || "Car"} ${booking.carId?.modele || ""}`}
                className="h-64 w-full rounded-xl bg-zinc-900 object-contain"
              />
              {carImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {carImages.map((img, index) => (
                    <button
                      type="button"
                      key={`${img.slice(0, 20)}-${index}`}
                      onClick={() => setActiveImageIndex(index)}
                      className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border ${
                        activeImageIndex === index ? "border-primary" : "border-white/10"
                      }`}
                    >
                      <img src={img} alt={`Car ${index + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-zinc-800/70 p-4">
                  <p className="text-zinc-400">Model</p>
                  <p className="font-semibold">{booking.carId?.marque || "N/A"} {booking.carId?.modele || ""}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-800/70 p-4">
                  <p className="text-zinc-400">Price/day</p>
                  <p className="font-semibold">{booking.carId?.prixParJour ?? 0} MAD</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-800/70 p-4">
                  <p className="text-zinc-400">Year of release</p>
                  <p className="font-semibold">{booking.carId?.annee || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-zinc-800/70 p-4">
                  <p className="text-zinc-400">Added on</p>
                  <p className="font-semibold">{formatDate(booking.carId?.createdAt)}</p>
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-zinc-800/70 p-4">
                <p className="mb-1 text-zinc-400">Description</p>
                <p className="text-sm text-zinc-200">{booking.carId?.description || "No description provided."}</p>
              </div>
            </section>

            <section className="space-y-4 rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
              <h2 className="text-xl font-semibold">Client information</h2>
              <div className="grid gap-3">
                <p className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-800/70 p-3 text-sm">
                  <User className="h-4 w-4 text-zinc-400" />
                  Full name: <span className="font-semibold">{booking.fullName || booking.userId?.name || "N/A"}</span>
                </p>
                <p className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-800/70 p-3 text-sm">
                  <Mail className="h-4 w-4 text-zinc-400" />
                  Email: <span className="font-semibold">{booking.email || booking.userId?.email || "N/A"}</span>
                </p>
                <p className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-800/70 p-3 text-sm">
                  <Phone className="h-4 w-4 text-zinc-400" />
                  Phone: <span className="font-semibold">{booking.phone || "N/A"}</span>
                </p>
                <p className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-800/70 p-3 text-sm">
                  <IdCard className="h-4 w-4 text-zinc-400" />
                  Driver license: <span className="font-semibold">{booking.driverLicenseNumber || "N/A"}</span>
                </p>
                <p className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-800/70 p-3 text-sm">
                  <ShieldCheck className="h-4 w-4 text-zinc-400" />
                  License expiry: <span className="font-semibold">{formatDate(booking.driverLicenseExpiry)}</span>
                </p>
                <p className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-800/70 p-3 text-sm">
                  <CalendarDays className="h-4 w-4 text-zinc-400" />
                  Age: <span className="font-semibold">{age ?? "N/A"}{age !== null ? " years" : ""}</span>
                </p>
              </div>

              <h3 className="pt-2 text-lg font-semibold">Reservation information</h3>
              <div className="grid gap-3">
                <p className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-800/70 p-3 text-sm">
                  <CalendarDays className="h-4 w-4 text-zinc-400" />
                  Dates: <span className="font-semibold">{formatDate(booking.dateDebut)} to {formatDate(booking.dateFin)}</span>
                </p>
                <p className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-800/70 p-3 text-sm">
                  <CircleDollarSign className="h-4 w-4 text-zinc-400" />
                  Total price: <span className="font-semibold">{booking.prixTotal || 0} MAD</span>
                </p>
                <p className="rounded-xl border border-white/10 bg-zinc-800/70 p-3 text-sm">
                  Status: <span className="font-semibold uppercase">{booking.statut}</span>
                </p>
                <p className="rounded-xl border border-white/10 bg-zinc-800/70 p-3 text-sm">
                  Terms accepted: <span className="font-semibold">{booking.acceptTerms ? "Yes" : "No"}</span>
                </p>
              </div>

              {booking.carId?._id && (
                <Link
                  to={`/cars/${booking.carId._id}${user?.role === "admin" ? "?from=admin" : ""}`}
                  className="inline-flex rounded-xl border border-white/20 px-4 py-2 text-sm hover:bg-zinc-800"
                >
                  Open car details
                </Link>
              )}
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
