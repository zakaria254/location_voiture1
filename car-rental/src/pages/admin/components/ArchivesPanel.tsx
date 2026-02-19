import { formatDate } from "../utils";
import type { DeletedBookingRecord, DeletedCarRecord } from "../types";

type ArchivesPanelProps = {
  loading: boolean;
  deletedCars: DeletedCarRecord[];
  deletedBookings: DeletedBookingRecord[];
};

export default function ArchivesPanel({ loading, deletedCars, deletedBookings }: ArchivesPanelProps) {
  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
        <h2 className="mb-4 text-xl font-semibold">Deleted cars</h2>
        {loading ? (
          <p className="text-zinc-400">Loading deleted cars...</p>
        ) : deletedCars.length === 0 ? (
          <p className="text-zinc-400">No deleted cars yet.</p>
        ) : (
          <div className="space-y-3">
            {deletedCars.map((record) => (
              <div key={record._id} className="rounded-xl border border-white/10 bg-zinc-800/70 p-3 text-sm">
                <p className="font-semibold">
                  {record.car?.marque || "Unknown"} {record.car?.modele || "car"}
                </p>
                <p className="text-zinc-400">
                  {record.car?.prixParJour || 0} MAD/day | {record.car?.annee || "N/A"} | Deleted: {formatDate(record.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </article>

      <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
        <h2 className="mb-4 text-xl font-semibold">Deleted bookings</h2>
        {loading ? (
          <p className="text-zinc-400">Loading deleted bookings...</p>
        ) : deletedBookings.length === 0 ? (
          <p className="text-zinc-400">No deleted bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {deletedBookings.map((record) => (
              <div key={record._id} className="rounded-xl border border-white/10 bg-zinc-800/70 p-3 text-sm">
                <p className="font-semibold">
                  {record.booking?.carId?.marque || "Unknown"} {record.booking?.carId?.modele || "car"}
                </p>
                <p className="text-zinc-400">
                  Client: {record.booking?.fullName || "N/A"} | Total: {record.booking?.prixTotal || 0} MAD
                </p>
                <p className="text-zinc-500">Deleted: {formatDate(record.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
