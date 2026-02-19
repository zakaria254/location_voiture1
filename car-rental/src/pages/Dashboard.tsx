import { useCallback, useEffect, useState } from "react";
import { Ban, CalendarDays, CarFront, CircleDollarSign, RefreshCw } from "lucide-react";
import api from "../api/axiosInstance";
import { formatDate, showApiError } from "./admin/utils";
import type { BookingItem } from "./admin/types";

type StatusColor = "slate" | "amber" | "blue" | "emerald" | "red";

const statusStyles: Record<string, { color: StatusColor; label: string }> = {
  en_attente: { color: "amber", label: "Pending" },
  confirmee: { color: "blue", label: "Confirmed" },
  en_cours: { color: "emerald", label: "In progress" },
  terminee: { color: "slate", label: "Completed" },
  annulee: { color: "red", label: "Cancelled" },
};

const statusColorClass: Record<StatusColor, string> = {
  slate: "bg-zinc-500/20 text-zinc-200 border-zinc-400/30",
  amber: "bg-amber-500/20 text-amber-200 border-amber-400/30",
  blue: "bg-blue-500/20 text-blue-200 border-blue-400/30",
  emerald: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
  red: "bg-red-500/20 text-red-200 border-red-400/30",
};

export default function Dashboard() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBookings = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await api.get("/bookings/my?limit=50&sort=-createdAt");
      setBookings(response.data?.data?.bookings ?? []);
    } catch (error) {
      showApiError(error, "Unable to load your bookings.");
      setBookings([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings(true);
  }, [loadBookings]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings(false);
    setRefreshing(false);
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api.delete(`/bookings/${bookingId}`);
      setBookings((prev) =>
        prev.map((item) => (item._id === bookingId ? { ...item, statut: "annulee" } : item))
      );
    } catch (error) {
      showApiError(error, "Unable to cancel this booking.");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-12 pt-28 text-white md:px-6">
      <section className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Account</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">My Bookings</h1>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-zinc-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-6">
            <p className="text-zinc-400">Loading your bookings...</p>
          </section>
        ) : bookings.length === 0 ? (
          <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-8 text-center">
            <h2 className="text-2xl font-semibold">No bookings yet</h2>
            <p className="mt-2 text-zinc-400">Once you reserve a car, your bookings will appear here.</p>
          </section>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => {
              const statusMeta = statusStyles[booking.statut] ?? { color: "slate" as StatusColor, label: booking.statut };
              const isCancellable = !["terminee", "annulee", "en_cours"].includes(booking.statut);

              return (
                <article key={booking._id} className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <p className="text-xl font-semibold">
                        {booking.carId?.marque || "Unknown"} {booking.carId?.modele || "car"}
                      </p>
                      <div className="grid gap-2 text-sm text-zinc-300 md:grid-cols-2">
                        <p className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-zinc-400" />
                          {formatDate(booking.dateDebut)} to {formatDate(booking.dateFin)}
                        </p>
                        <p className="inline-flex items-center gap-2">
                          <CircleDollarSign className="h-4 w-4 text-zinc-400" />
                          {booking.prixTotal ?? 0} MAD total
                        </p>
                        <p className="inline-flex items-center gap-2 md:col-span-2">
                          <CarFront className="h-4 w-4 text-zinc-400" />
                          Booked on {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                          statusColorClass[statusMeta.color]
                        }`}
                      >
                        {statusMeta.label}
                      </span>
                      <button
                        type="button"
                        disabled={!isCancellable}
                        onClick={() => handleCancelBooking(booking._id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-400/50 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Ban className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
