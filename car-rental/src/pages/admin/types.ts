export type CarItem = {
  _id: string;
  marque: string;
  modele: string;
  prixParJour: number;
  image?: string;
  images?: string[];
  annee?: number;
  description?: string;
  averageRating?: number;
  totalRatings?: number;
  userRating?: number | null;
  userReview?: {
    _id: string;
    rating: number;
    comment: string;
    updatedAt?: string;
  } | null;
  disponible: boolean;
  createdAt?: string;
};

export type BookingItem = {
  _id: string;
  statut: "en_attente" | "confirmee" | "en_cours" | "terminee" | "annulee";
  prixTotal: number;
  dateDebut: string;
  dateFin: string;
  createdAt: string;
  fullName?: string;
  email?: string;
  phone?: string;
  driverLicenseNumber?: string;
  driverLicenseExpiry?: string;
  dateOfBirth?: string;
  acceptTerms?: boolean;
  userId?: { name?: string; email?: string };
  carId?: {
    _id?: string;
    marque?: string;
    modele?: string;
    prixParJour?: number;
    image?: string;
    images?: string[];
    annee?: number;
    description?: string;
    disponible?: boolean;
    createdAt?: string;
  };
};

export type CarForm = {
  marque: string;
  modele: string;
  prixParJour: string;
  annee: string;
  image: string;
  images: string[];
  description: string;
  disponible: boolean;
};

export type TabKey = "overview" | "cars" | "bookings" | "insights" | "archives";

export type BookingFilter = "all" | BookingItem["statut"];

export type DeletedBookingRecord = {
  _id: string;
  createdAt: string;
  booking: BookingItem;
};

export type DeletedCarRecord = {
  _id: string;
  createdAt: string;
  car: CarItem;
};

export const bookingStatuses: BookingFilter[] = [
  "all",
  "en_attente",
  "confirmee",
  "en_cours",
  "terminee",
  "annulee",
];

export const editableBookingStatuses: BookingItem["statut"][] = [
  "en_attente",
  "confirmee",
  "en_cours",
  "terminee",
  "annulee",
];

export const initialCarForm: CarForm = {
  marque: "",
  modele: "",
  prixParJour: "",
  annee: "",
  image: "",
  images: [],
  description: "",
  disponible: true,
};

