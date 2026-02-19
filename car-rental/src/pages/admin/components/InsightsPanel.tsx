export default function InsightsPanel() {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
        <h3 className="mb-2 font-semibold">Operational notes</h3>
        <p className="text-sm text-zinc-400">
          Admin can now manually update booking statuses (pending, confirmed, in progress, finished, cancelled) from
          the bookings panel.
        </p>
      </article>
      <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
        <h3 className="mb-2 font-semibold">Performance tip</h3>
        <p className="text-sm text-zinc-400">
          Cars are intentionally loaded in slices (`limit=5`) so dashboard remains fast even with large fleet.
        </p>
      </article>
    </section>
  );
}

