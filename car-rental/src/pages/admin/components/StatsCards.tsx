import { CalendarCheck, CarFront, CircleDollarSign, Users } from "lucide-react";

type StatsCardsProps = {
  carsTotalCount: number;
  availableCarsCount: number;
  bookingsTotalCount: number;
  revenueShown: number;
};

export default function StatsCards({
  carsTotalCount,
  availableCarsCount,
  bookingsTotalCount,
  revenueShown,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
        <div className="mb-2 inline-flex rounded-lg bg-primary/20 p-2 text-primary">
          <CarFront className="h-5 w-5" />
        </div>
        <p className="text-zinc-400">Cars total</p>
        <p className="text-2xl font-bold">{carsTotalCount}</p>
      </article>
      <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
        <div className="mb-2 inline-flex rounded-lg bg-emerald-500/20 p-2 text-emerald-300">
          <Users className="h-5 w-5" />
        </div>
        <p className="text-zinc-400">Available cars</p>
        <p className="text-2xl font-bold">{availableCarsCount}</p>
      </article>
      <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
        <div className="mb-2 inline-flex rounded-lg bg-amber-500/20 p-2 text-amber-300">
          <CalendarCheck className="h-5 w-5" />
        </div>
        <p className="text-zinc-400">Bookings total</p>
        <p className="text-2xl font-bold">{bookingsTotalCount}</p>
      </article>
      <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
        <div className="mb-2 inline-flex rounded-lg bg-fuchsia-500/20 p-2 text-fuchsia-300">
          <CircleDollarSign className="h-5 w-5" />
        </div>
        <p className="text-zinc-400">Revenue (displayed bookings)</p>
        <p className="text-2xl font-bold">{revenueShown.toFixed(2)} MAD</p>
      </article>
    </div>
  );
}

