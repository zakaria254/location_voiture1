import type { AvailabilityFilter, ReservationFilter } from "./types";

type CarsFiltersProps = {
  search: string;
  descriptionSearch: string;
  minPrice: string;
  maxPrice: string;
  minYear: string;
  maxYear: string;
  availabilityFilter: AvailabilityFilter;
  reservationFilter: ReservationFilter;
  onSearchChange: (value: string) => void;
  onDescriptionSearchChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onMinYearChange: (value: string) => void;
  onMaxYearChange: (value: string) => void;
  onAvailabilityFilterChange: (value: AvailabilityFilter) => void;
  onReservationFilterChange: (value: ReservationFilter) => void;
};

export default function CarsFilters({
  search,
  descriptionSearch,
  minPrice,
  maxPrice,
  minYear,
  maxYear,
  availabilityFilter,
  reservationFilter,
  onSearchChange,
  onDescriptionSearchChange,
  onMinPriceChange,
  onMaxPriceChange,
  onMinYearChange,
  onMaxYearChange,
  onAvailabilityFilterChange,
  onReservationFilterChange,
}: CarsFiltersProps) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <input value={search} onChange={(e) => onSearchChange(e.target.value)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none" placeholder="Search marque/model" />
      <input value={descriptionSearch} onChange={(e) => onDescriptionSearchChange(e.target.value)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none" placeholder="Description contains..." />
      <input type="number" min="0" step="0.01" value={minPrice} onChange={(e) => onMinPriceChange(e.target.value)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none" placeholder="Min price/day" />
      <input type="number" min="0" step="0.01" value={maxPrice} onChange={(e) => onMaxPriceChange(e.target.value)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none" placeholder="Max price/day" />
      <input type="number" min="1900" value={minYear} onChange={(e) => onMinYearChange(e.target.value)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none" placeholder="Min year" />
      <input type="number" min="1900" value={maxYear} onChange={(e) => onMaxYearChange(e.target.value)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none" placeholder="Max year" />
      <select value={availabilityFilter} onChange={(e) => onAvailabilityFilterChange(e.target.value as AvailabilityFilter)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none">
        <option value="all">All availability</option>
        <option value="available">Available</option>
        <option value="unavailable">Unavailable</option>
      </select>
      <select value={reservationFilter} onChange={(e) => onReservationFilterChange(e.target.value as ReservationFilter)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-sm outline-none">
        <option value="all">All reservation states</option>
        <option value="reserved">Reserved</option>
        <option value="not_reserved">Not reserved</option>
      </select>
    </div>
  );
}
