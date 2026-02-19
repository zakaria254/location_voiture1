import { Ban } from "lucide-react";
import { formatDate } from "../utils";
import type { BookingFilter, BookingItem } from "../types";

type BookingsPanelProps = {
  bookingFilter: BookingFilter;
  bookingStatuses: BookingFilter[];
  bookingSearch: string;
  bookingMinPrice: string;
  bookingMaxPrice: string;
  bookingDateFrom: string;
  bookingDateTo: string;
  bookingsLoading: boolean;
  filteredBookings: BookingItem[];
  editableStatuses: BookingItem["statut"][];
  onFilterChange: (value: BookingFilter) => void;
  onSearchChange: (value: string) => void;
  onBookingMinPriceChange: (value: string) => void;
  onBookingMaxPriceChange: (value: string) => void;
  onBookingDateFromChange: (value: string) => void;
  onBookingDateToChange: (value: string) => void;
  onCancelBooking: (id: string) => void;
  onUpdateBookingStatus: (id: string, status: BookingItem["statut"]) => void;
};

export default function BookingsPanel({
  bookingFilter,
  bookingStatuses,
  bookingSearch,
  bookingMinPrice,
  bookingMaxPrice,
  bookingDateFrom,
  bookingDateTo,
  bookingsLoading,
  filteredBookings,
  editableStatuses,
  onFilterChange,
  onSearchChange,
  onBookingMinPriceChange,
  onBookingMaxPriceChange,
  onBookingDateFromChange,
  onBookingDateToChange,
  onCancelBooking,
  onUpdateBookingStatus,
}: BookingsPanelProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-xl font-semibold">Bookings management</h2>
        <div className="grid w-full gap-2 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-3">
          <select
            value={bookingFilter}
            onChange={(e) => onFilterChange(e.target.value as BookingFilter)}
            className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-sm outline-none"
          >
            {bookingStatuses.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All statuses" : status}
              </option>
            ))}
          </select>
          <input
            value={bookingSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-sm outline-none"
            placeholder="Search user/car/status"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={bookingMinPrice}
            onChange={(e) => onBookingMinPriceChange(e.target.value)}
            className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-sm outline-none"
            placeholder="Min total (MAD)"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={bookingMaxPrice}
            onChange={(e) => onBookingMaxPriceChange(e.target.value)}
            className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-sm outline-none"
            placeholder="Max total (MAD)"
          />
          <input
            type="date"
            value={bookingDateFrom}
            onChange={(e) => onBookingDateFromChange(e.target.value)}
            className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-sm outline-none"
          />
          <input
            type="date"
            value={bookingDateTo}
            onChange={(e) => onBookingDateToChange(e.target.value)}
            className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-sm outline-none"
          />
        </div>
      </div>

      {bookingsLoading ? (
        <p className="text-zinc-400">Loading bookings...</p>
      ) : filteredBookings.length === 0 ? (
        <p className="text-zinc-400">No bookings found with current filters.</p>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => {
            const isCancellable = !["terminee", "annulee", "en_cours"].includes(booking.statut);
            return (
              <article key={booking._id} className="rounded-xl border border-white/10 bg-zinc-800/70 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold">
                      {booking.carId?.marque || "Unknown"} {booking.carId?.modele || "car"}
                    </p>
                    <p className="text-sm text-zinc-400">
                      User: {booking.userId?.name || "Unknown"} ({booking.userId?.email || "No email"})
                    </p>
                    <p className="text-sm text-zinc-400">
                      {formatDate(booking.dateDebut)} to {formatDate(booking.dateFin)} | {booking.prixTotal || 0} MAD
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-wide text-zinc-300">
                      {booking.statut}
                    </span>
                    <select
                      value={booking.statut}
                      onChange={(e) => onUpdateBookingStatus(booking._id, e.target.value as BookingItem["statut"])}
                      className="rounded-lg border border-white/10 bg-zinc-900 px-2 py-1.5 text-sm outline-none"
                    >
                      {editableStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!isCancellable}
                      onClick={() => onCancelBooking(booking._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-400/50 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Ban className="h-4 w-4" /> Cancel booking
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

