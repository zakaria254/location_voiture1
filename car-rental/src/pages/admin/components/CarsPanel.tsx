import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import type { RefObject } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../utils";
import type { CarForm, CarItem } from "../types";

type CarsPanelProps = {
  carsLoading: boolean;
  cars: CarItem[];
  carsPage: number;
  carsTotalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  onEditCar: (car: CarItem) => void;
  onDeleteCar: (carId: string) => void;
  editingCarId: string | null;
  carForm: CarForm;
  carFormErrors: string[];
  submittingCar: boolean;
  imageInputRef: RefObject<HTMLInputElement | null>;
  onCarFormChange: (next: CarForm) => void;
  onImageFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onSubmitCar: (e: FormEvent) => void;
  onResetCarForm: () => void;
};

export default function CarsPanel({
  carsLoading,
  cars,
  carsPage,
  carsTotalPages,
  onPrevPage,
  onNextPage,
  onEditCar,
  onDeleteCar,
  editingCarId,
  carForm,
  carFormErrors,
  submittingCar,
  imageInputRef,
  onCarFormChange,
  onImageFileChange,
  onClearImage,
  onSubmitCar,
  onResetCarForm,
}: CarsPanelProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Cars list (5 per page)</h2>
          <div className="flex items-center gap-2 text-sm">
            <button
              type="button"
              disabled={carsPage <= 1 || carsLoading}
              onClick={onPrevPage}
              className="rounded-lg border border-white/10 px-3 py-1.5 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-zinc-400">
              Page {carsPage}/{carsTotalPages}
            </span>
            <button
              type="button"
              disabled={carsPage >= carsTotalPages || carsLoading}
              onClick={onNextPage}
              className="rounded-lg border border-white/10 px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        {carsLoading ? (
          <p className="text-zinc-400">Loading cars...</p>
        ) : cars.length === 0 ? (
          <p className="text-zinc-400">No cars yet.</p>
        ) : (
          <div className="space-y-3">
            {cars.map((car) => (
              <article key={car._id} className="rounded-xl border border-white/10 bg-zinc-800/70 p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center ">
                  <div>
                    {car.image ? (
                      <img
                        src={car.image}
                        alt={`${car.marque} ${car.modele}`}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-zinc-700" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {car.marque} {car.modele}
                    </p>
                    <p className="text-sm text-zinc-400">
                      Added: {formatDate(car.createdAt)} | {car.prixParJour} MAD/day |{" "}
                      {car.disponible ? "Available" : "Unavailable"}
                    </p>
                  </div>
                  <div className="flex gap-2 md:justify-between md:ml-auto">
                    <Link
                      to={`/admin/cars/${car._id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-400/50 px-3 py-1.5 text-sm text-blue-200 hover:bg-blue-500/15"
                    >
                      <Eye className="h-4 w-4" /> View
                    </Link>
                    <button
                      type="button"
                      onClick={() => onEditCar(car)}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-sm hover:bg-zinc-700"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCar(car._id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-400/50 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/15"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
        <h2 className="mb-4 text-xl font-semibold">{editingCarId ? "Edit car" : "Add new car"}</h2>
        <form onSubmit={onSubmitCar} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={carForm.marque}
              onChange={(e) => onCarFormChange({ ...carForm, marque: e.target.value })}
              className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-primary"
              placeholder="Marque"
              required
            />
            <input
              value={carForm.modele}
              onChange={(e) => onCarFormChange({ ...carForm, modele: e.target.value })}
              className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-primary"
              placeholder="Modele"
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              min="0"
              step="0.01"
              value={carForm.prixParJour}
              onChange={(e) => onCarFormChange({ ...carForm, prixParJour: e.target.value })}
              className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-primary"
              placeholder="Price per day"
              required
            />
            <input
              type="number"
              min="1900"
              max="2100"
              value={carForm.annee}
              onChange={(e) => onCarFormChange({ ...carForm, annee: e.target.value })}
              className="rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-primary"
              placeholder="Year"
            />
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={onImageFileChange}
            className="w-full rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary/90 file:px-3 file:py-1.5 file:font-medium file:text-zinc-950"
          />
          <p className="text-xs text-zinc-400">Upload image (jpg/png/webp), max 3MB.</p>
          {carForm.image && (
            <div className="rounded-xl border border-white/10 bg-zinc-800/60 p-3">
              <p className="mb-2 text-xs text-zinc-400">Image preview</p>
              <img src={carForm.image} alt="Selected car" className="h-36 w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={onClearImage}
                className="mt-2 rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-zinc-700"
              >
                Remove image
              </button>
            </div>
          )}
          <textarea
            value={carForm.description}
            onChange={(e) => onCarFormChange({ ...carForm, description: e.target.value })}
            className="min-h-24 w-full rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-primary"
            placeholder="Description"
          />
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={carForm.disponible}
              onChange={(e) => onCarFormChange({ ...carForm, disponible: e.target.checked })}
            />
            Available for booking
          </label>
          {carFormErrors.length > 0 && (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
              {carFormErrors.map((errorItem) => (
                <p key={errorItem}>- {errorItem}</p>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={submittingCar}
              className="inline-flex items-center gap-2 rounded-xl bg-primary/90 px-4 py-2 font-semibold text-zinc-950 hover:bg-primary disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {submittingCar ? "Saving..." : editingCarId ? "Update car" : "Create car"}
            </button>
            {editingCarId && (
              <button
                type="button"
                onClick={onResetCarForm}
                className="rounded-xl border border-white/15 px-4 py-2"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
