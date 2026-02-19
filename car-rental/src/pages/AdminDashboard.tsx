import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import toast from "react-hot-toast";
import api from "../api/axiosInstance";
import AdminHeader from "./admin/components/AdminHeader";
import AdminSidebar from "./admin/components/AdminSidebar";
import BookingsPanel from "./admin/components/BookingsPanel";
import CarsPanel from "./admin/components/CarsPanel";
import InsightsPanel from "./admin/components/InsightsPanel";
import OverviewPanel from "./admin/components/OverviewPanel";
import StatsCards from "./admin/components/StatsCards";
import { bookingStatuses, initialCarForm } from "./admin/types";
import type { BookingFilter, BookingItem, CarForm, CarItem, TabKey } from "./admin/types";
import { fileToDataUrl, showApiError } from "./admin/utils";
import { fetchReservedCarIds } from "../utils/reservedCars";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const [cars, setCars] = useState<CarItem[]>([]);
  const [carsPage, setCarsPage] = useState(1);
  const [carsTotalPages, setCarsTotalPages] = useState(1);
  const [carsTotalCount, setCarsTotalCount] = useState(0);
  const [availableCarsCount, setAvailableCarsCount] = useState(0);
  const [carsLoading, setCarsLoading] = useState(false);
  const [reservedCarIds, setReservedCarIds] = useState<string[]>([]);

  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>("all");
  const [bookingsTotalCount, setBookingsTotalCount] = useState(0);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [pendingBookingsCount, setPendingBookingsCount] = useState(0);
  const [confirmedBookingsCount, setConfirmedBookingsCount] = useState(0);
  const [inProgressBookingsCount, setInProgressBookingsCount] = useState(0);

  const [carForm, setCarForm] = useState<CarForm>(initialCarForm);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  const [submittingCar, setSubmittingCar] = useState(false);
  const [carFormErrors, setCarFormErrors] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingMinPrice, setBookingMinPrice] = useState("");
  const [bookingMaxPrice, setBookingMaxPrice] = useState("");
  const [bookingDateFrom, setBookingDateFrom] = useState("");
  const [bookingDateTo, setBookingDateTo] = useState("");

  const [carSearch, setCarSearch] = useState("");
  const [carDescriptionSearch, setCarDescriptionSearch] = useState("");
  const [carMinPrice, setCarMinPrice] = useState("");
  const [carMaxPrice, setCarMaxPrice] = useState("");
  const [carYearFilter, setCarYearFilter] = useState("");
  const [carAvailabilityFilter, setCarAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");
  const [carReservedFilter, setCarReservedFilter] = useState<"all" | "reserved" | "not_reserved">("all");

  const fetchCars = async (page = carsPage) => {
    setCarsLoading(true);
    try {
      const [latestCarsRes, allCarsMetaRes, availableCarsMetaRes] = await Promise.all([
        api.get(`/cars?page=${page}&limit=5&sort=-createdAt`),
        api.get("/cars?page=1&limit=1"),
        api.get("/cars?page=1&limit=1&disponible=true"),
      ]);

      const latestCars = latestCarsRes.data?.data?.cars ?? [];
      const latestCarsPagination = latestCarsRes.data?.data?.pagination;
      const allCarsCount = allCarsMetaRes.data?.data?.pagination?.total ?? latestCars.length;
      const availableCount =
        availableCarsMetaRes.data?.data?.pagination?.total ??
        latestCars.filter((car: CarItem) => car.disponible).length;

      setCars(latestCars);
      setCarsTotalPages(latestCarsPagination?.pages || 1);
      setCarsPage(latestCarsPagination?.page || 1);
      setCarsTotalCount(allCarsCount);
      setAvailableCarsCount(availableCount);
      const ids = await fetchReservedCarIds();
      setReservedCarIds(ids);
    } catch (error) {
      showApiError(error);
    } finally {
      setCarsLoading(false);
    }
  };

  const fetchBookings = async (status = bookingFilter) => {
    setBookingsLoading(true);
    try {
      const statusQuery = status === "all" ? "" : `&statut=${status}`;
      const [bookingsRes, allMetaRes, pendingMetaRes, confirmedMetaRes, inProgressMetaRes] = await Promise.all([
        api.get(`/bookings/admin/all?limit=20&sort=-createdAt${statusQuery}`),
        api.get("/bookings/admin/all?limit=1"),
        api.get("/bookings/admin/all?limit=1&statut=en_attente"),
        api.get("/bookings/admin/all?limit=1&statut=confirmee"),
        api.get("/bookings/admin/all?limit=1&statut=en_cours"),
      ]);

      setBookings(bookingsRes.data?.data?.bookings ?? []);
      setBookingsTotalCount(allMetaRes.data?.data?.pagination?.total ?? 0);
      setPendingBookingsCount(pendingMetaRes.data?.data?.pagination?.total ?? 0);
      setConfirmedBookingsCount(confirmedMetaRes.data?.data?.pagination?.total ?? 0);
      setInProgressBookingsCount(inProgressMetaRes.data?.data?.pagination?.total ?? 0);
    } catch (error) {
      showApiError(error);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchCars(1);
    fetchBookings("all");
  }, []);

  useEffect(() => {
    fetchBookings(bookingFilter);
  }, [bookingFilter]);

  const revenueShown = useMemo(
    () => bookings.reduce((sum, booking) => sum + (booking.prixTotal || 0), 0),
    [bookings]
  );

  const filteredBookings = useMemo(() => {
    const q = bookingSearch.trim().toLowerCase();
    const min = bookingMinPrice ? Number(bookingMinPrice) : null;
    const max = bookingMaxPrice ? Number(bookingMaxPrice) : null;
    const fromDate = bookingDateFrom ? new Date(bookingDateFrom) : null;
    const toDate = bookingDateTo ? new Date(bookingDateTo) : null;

    return bookings.filter((booking) => {
      const carLabel = `${booking.carId?.marque || ""} ${booking.carId?.modele || ""}`.toLowerCase();
      const userLabel = `${booking.userId?.name || ""} ${booking.userId?.email || ""}`.toLowerCase();
      const matchText = !q || carLabel.includes(q) || userLabel.includes(q) || booking.statut.toLowerCase().includes(q);
      if (!matchText) return false;

      const total = Number(booking.prixTotal || 0);
      if (min !== null && total < min) return false;
      if (max !== null && total > max) return false;

      const start = new Date(booking.dateDebut);
      const end = new Date(booking.dateFin);
      if (fromDate && end < fromDate) return false;
      if (toDate && start > toDate) return false;

      return true;
    });
  }, [bookings, bookingSearch, bookingMinPrice, bookingMaxPrice, bookingDateFrom, bookingDateTo]);

  const filteredCars = useMemo(() => {
    const q = carSearch.trim().toLowerCase();
    const descriptionQ = carDescriptionSearch.trim().toLowerCase();
    const min = carMinPrice ? Number(carMinPrice) : null;
    const max = carMaxPrice ? Number(carMaxPrice) : null;
    const year = carYearFilter ? Number(carYearFilter) : null;

    return cars.filter((car) => {
      const label = `${car.marque || ""} ${car.modele || ""}`.toLowerCase();
      if (q && !label.includes(q)) return false;

      const description = (car.description || "").toLowerCase();
      if (descriptionQ && !description.includes(descriptionQ)) return false;

      const price = Number(car.prixParJour || 0);
      if (min !== null && price < min) return false;
      if (max !== null && price > max) return false;

      if (year !== null && Number(car.annee || 0) !== year) return false;

      if (carAvailabilityFilter === "available" && !car.disponible) return false;
      if (carAvailabilityFilter === "unavailable" && car.disponible) return false;

      const isReserved = reservedCarIds.includes(car._id);
      if (carReservedFilter === "reserved" && !isReserved) return false;
      if (carReservedFilter === "not_reserved" && isReserved) return false;

      return true;
    });
  }, [
    cars,
    carSearch,
    carDescriptionSearch,
    carMinPrice,
    carMaxPrice,
    carYearFilter,
    carAvailabilityFilter,
    carReservedFilter,
    reservedCarIds,
  ]);

  const resetCarForm = () => {
    setCarForm(initialCarForm);
    setCarFormErrors([]);
    setEditingCarId(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleEditCar = (car: CarItem) => {
    setActiveTab("cars");
    setEditingCarId(car._id);
    setCarForm({
      marque: car.marque || "",
      modele: car.modele || "",
      prixParJour: String(car.prixParJour ?? ""),
      annee: car.annee ? String(car.annee) : "",
      image: car.image || "",
      description: car.description || "",
      disponible: car.disponible,
    });
    setCarFormErrors([]);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleImageFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      const message = "Please select a valid image file.";
      setCarFormErrors([message]);
      toast.error(message);
      e.target.value = "";
      return;
    }

    const maxSizeMb = 3;
    if (selectedFile.size > maxSizeMb * 1024 * 1024) {
      const message = `Image too large. Maximum allowed size is ${maxSizeMb}MB.`;
      setCarFormErrors([message]);
      toast.error(message);
      e.target.value = "";
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(selectedFile);
      setCarForm((prev) => ({ ...prev, image: dataUrl }));
      setCarFormErrors([]);
      toast.success("Image uploaded");
    } catch (error) {
      const parsed = showApiError(error, "Unable to process selected image.");
      setCarFormErrors(parsed.details.length ? parsed.details : [parsed.message]);
      e.target.value = "";
    }
  };

  const handleSubmitCar = async (e: FormEvent) => {
    e.preventDefault();
    setSubmittingCar(true);
    setCarFormErrors([]);

    const payload = {
      marque: carForm.marque.trim(),
      modele: carForm.modele.trim(),
      prixParJour: Number(carForm.prixParJour),
      image: carForm.image.trim() || undefined,
      annee: carForm.annee ? Number(carForm.annee) : undefined,
      description: carForm.description.trim() || undefined,
      disponible: carForm.disponible,
    };

    try {
      if (editingCarId) {
        await api.put(`/cars/${editingCarId}`, payload);
        toast.success("Car updated successfully");
      } else {
        await api.post("/cars", payload);
        toast.success("Car created successfully");
      }

      resetCarForm();
      fetchCars(carsPage);
    } catch (error) {
      const parsed = showApiError(error);
      setCarFormErrors(parsed.details.length ? parsed.details : [parsed.message]);
    } finally {
      setSubmittingCar(false);
    }
  };

  const handleDeleteCar = async (carId: string) => {
    if (!window.confirm("Delete this car? This action cannot be undone.")) return;
    try {
      await api.delete(`/cars/${carId}`);
      toast.success("Car deleted");
      fetchCars(carsPage);
    } catch (error) {
      showApiError(error);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.delete(`/bookings/${bookingId}`);
      toast.success("Booking cancelled");
      fetchBookings(bookingFilter);
    } catch (error) {
      showApiError(error);
    }
  };

  const refreshAll = () => {
    fetchCars(carsPage);
    fetchBookings(bookingFilter);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white px-4 pb-10 pt-28 md:px-6">
      <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[240px_1fr]">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <section className="space-y-6">
          <AdminHeader onRefresh={refreshAll} />

          {(activeTab === "overview" || activeTab === "insights") && (
            <StatsCards
              carsTotalCount={carsTotalCount}
              availableCarsCount={availableCarsCount}
              bookingsTotalCount={bookingsTotalCount}
              revenueShown={revenueShown}
            />
          )}

          {activeTab === "overview" && (
            <OverviewPanel
              carsLoading={carsLoading}
              cars={cars}
              reservedCarIds={reservedCarIds}
              onEditCar={handleEditCar}
              onDeleteCar={handleDeleteCar}
              pendingBookingsCount={pendingBookingsCount}
              confirmedBookingsCount={confirmedBookingsCount}
              inProgressBookingsCount={inProgressBookingsCount}
            />
          )}

          {activeTab === "cars" && (
            <CarsPanel
              carsLoading={carsLoading}
              cars={filteredCars}
              reservedCarIds={reservedCarIds}
              carsPage={carsPage}
              carsTotalPages={carsTotalPages}
              onPrevPage={() => fetchCars(carsPage - 1)}
              onNextPage={() => fetchCars(carsPage + 1)}
              onEditCar={handleEditCar}
              onDeleteCar={handleDeleteCar}
              editingCarId={editingCarId}
              carForm={carForm}
              carFormErrors={carFormErrors}
              submittingCar={submittingCar}
              imageInputRef={imageInputRef}
              onCarFormChange={setCarForm}
              onImageFileChange={handleImageFileChange}
              onClearImage={() => {
                setCarForm((prev) => ({ ...prev, image: "" }));
                if (imageInputRef.current) imageInputRef.current.value = "";
              }}
              onSubmitCar={handleSubmitCar}
              onResetCarForm={resetCarForm}
              carSearch={carSearch}
              carDescriptionSearch={carDescriptionSearch}
              carMinPrice={carMinPrice}
              carMaxPrice={carMaxPrice}
              carYearFilter={carYearFilter}
              carAvailabilityFilter={carAvailabilityFilter}
              carReservedFilter={carReservedFilter}
              onCarSearchChange={setCarSearch}
              onCarDescriptionSearchChange={setCarDescriptionSearch}
              onCarMinPriceChange={setCarMinPrice}
              onCarMaxPriceChange={setCarMaxPrice}
              onCarYearFilterChange={setCarYearFilter}
              onCarAvailabilityFilterChange={setCarAvailabilityFilter}
              onCarReservedFilterChange={setCarReservedFilter}
            />
          )}

          {activeTab === "bookings" && (
            <BookingsPanel
              bookingFilter={bookingFilter}
              bookingStatuses={bookingStatuses}
              bookingSearch={bookingSearch}
              bookingMinPrice={bookingMinPrice}
              bookingMaxPrice={bookingMaxPrice}
              bookingDateFrom={bookingDateFrom}
              bookingDateTo={bookingDateTo}
              bookingsLoading={bookingsLoading}
              filteredBookings={filteredBookings}
              onFilterChange={setBookingFilter}
              onSearchChange={setBookingSearch}
              onBookingMinPriceChange={setBookingMinPrice}
              onBookingMaxPriceChange={setBookingMaxPrice}
              onBookingDateFromChange={setBookingDateFrom}
              onBookingDateToChange={setBookingDateTo}
              onCancelBooking={handleCancelBooking}
            />
          )}

          {activeTab === "insights" && <InsightsPanel />}
        </section>
      </div>
    </main>
  );
}
