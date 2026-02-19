import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CalendarDays, CircleDollarSign } from "lucide-react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import type { CarItem } from "./admin/types";
import { showApiError } from "./admin/utils";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function getAgeFromBirthDate(dateOfBirth: string) {
  if (!dateOfBirth) return 0;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

const MINIMUM_DRIVER_AGE = 21;

export default function Booking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const [car, setCar] = useState<CarItem | null>(null);
  const [loadingCar, setLoadingCar] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dateDebut, setDateDebut] = useState(toDateInputValue(today));
  const [dateFin, setDateFin] = useState(toDateInputValue(addDays(today, 1)));
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("");
  const [driverLicenseExpiry, setDriverLicenseExpiry] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!fullName) setFullName(user.name || "");
    if (!email) setEmail(user.email || "");
  }, [user, fullName, email]);

  useEffect(() => {
    if (!id) return;

    const fetchCar = async () => {
      setLoadingCar(true);
      try {
        const response = await api.get(`/cars/${id}`);
        setCar(response.data?.data?.car ?? null);
      } catch (error) {
        showApiError(error, "Unable to load car for booking.");
        setCar(null);
      } finally {
        setLoadingCar(false);
      }
    };

    fetchCar();
  }, [id]);

  const numberOfDays = useMemo(() => {
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const diff = end.getTime() - start.getTime();
    if (Number.isNaN(diff) || diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [dateDebut, dateFin]);

  const total = useMemo(() => {
    if (!car || numberOfDays <= 0) return 0;
    return Number((car.prixParJour * numberOfDays).toFixed(2));
  }, [car, numberOfDays]);

  const minStart = toDateInputValue(today);
  const minEnd = toDateInputValue(addDays(new Date(dateDebut), 1));
  const minimumLicenseExpiry = toDateInputValue(addDays(new Date(dateFin), 1));
  const driverAge = useMemo(() => getAgeFromBirthDate(dateOfBirth), [dateOfBirth]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!id || !car) return;

    if (numberOfDays <= 0) {
      toast.error("End date must be after start date.");
      return;
    }

    if (driverAge < MINIMUM_DRIVER_AGE) {
      toast.error(`Minimum age is ${MINIMUM_DRIVER_AGE} years.`);
      return;
    }

    if (!acceptTerms) {
      toast.error("You must agree to rental terms.");
      return;
    }

    if (!driverLicenseExpiry || new Date(driverLicenseExpiry) <= new Date(dateFin)) {
      toast.error("Driving license must remain valid for the full rental period.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/bookings", {
        carId: id,
        dateDebut,
        dateFin,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        driverLicenseNumber: driverLicenseNumber.trim(),
        driverLicenseExpiry,
        dateOfBirth,
        acceptTerms,
      });

      toast.success("Booking created successfully.");
      navigate("/dashboard");
    } catch (error) {
      showApiError(error, "Unable to create booking.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-4 pb-12 pt-28 text-white md:px-6">
      <section className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
          {loadingCar ? (
            <p className="text-zinc-400">Loading car info...</p>
          ) : !car ? (
            <div className="space-y-3">
              <p className="text-zinc-300">Car not found.</p>
              <Link to="/cars" className="inline-block rounded-lg border border-white/20 px-3 py-2 text-sm">
                Back to cars
              </Link>
            </div>
          ) : (
            <>
              <img
                src={car.image || "https://via.placeholder.com/1200x700?text=Car"}
                alt={`${car.marque} ${car.modele}`}
                className="h-60 w-full rounded-xl bg-zinc-900 object-contain"
              />
              <h1 className="mt-4 text-2xl font-bold">
                {car.marque} {car.modele}
              </h1>
              <p className="mt-1 text-sm text-zinc-400">{car.annee || "N/A"} | {car.disponible ? "Available" : "Unavailable"}</p>
              <p className="mt-3 inline-flex items-center gap-2 text-lg font-semibold text-primary">
                <CircleDollarSign className="h-5 w-5" />
                {car.prixParJour} MAD/day
              </p>
              <p className="mt-3 text-sm text-zinc-300">{car.description || "No description provided."}</p>
            </>
          )}
        </article>

        <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
          <h2 className="text-2xl font-bold">Confirm Booking</h2>
          <p className="mt-1 text-sm text-zinc-400">Select your dates and confirm your reservation.</p>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm">
              <span className="mb-1 block text-zinc-300">Full Name</span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-primary"
                
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-zinc-300">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-primary"
                
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-zinc-300">Phone</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-primary"
                placeholder="+212..."
                
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-zinc-300">Driver License Number</span>
              <input
                type="text"
                value={driverLicenseNumber}
                onChange={(e) => setDriverLicenseNumber(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-primary"
                
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-zinc-300">Driving license expiry date</span>
              <input
                type="date"
                value={driverLicenseExpiry}
                min={minimumLicenseExpiry}
                onChange={(e) => setDriverLicenseExpiry(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-primary"
                
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-zinc-300">Date of birth</span>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-primary"
                
              />
              <span className="mt-1 block text-xs text-zinc-400">
                Minimum age: {MINIMUM_DRIVER_AGE} years. Current: {driverAge || 0} years.
              </span>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-zinc-300">Start date</span>
              <input
                type="date"
                value={dateDebut}
                min={minStart}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-primary"
                
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block text-zinc-300">End date</span>
              <input
                type="date"
                value={dateFin}
                min={minEnd}
                onChange={(e) => setDateFin(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-primary"
                
              />
            </label>

            <div className="rounded-xl border border-white/10 bg-zinc-800/70 p-4 text-sm">
              <p className="inline-flex items-center gap-2 text-zinc-300">
                <CalendarDays className="h-4 w-4" />
                Duration: <span className="font-semibold text-white">{numberOfDays} day(s)</span>
              </p>
              <p className="mt-2 text-zinc-300">
                Total: <span className="font-semibold text-primary">{total} MAD</span>
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                
              />
              I agree to the rental terms
            </label>

            <button
              type="submit"
              disabled={submitting || loadingCar || !car || !car.disponible}
              className="w-full rounded-xl bg-primary/90 px-4 py-2.5 font-semibold text-zinc-950 hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Confirming..." : "Confirm reservation"}
            </button>
          </form>
        </article>
      </section>
    </main>
  );
}
