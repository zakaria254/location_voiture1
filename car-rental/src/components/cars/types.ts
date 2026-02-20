export type Car = {
  _id: string;
  marque: string;
  modele: string;
  prixParJour: number;
  image?: string;
  images?: string[];
  annee?: number;
  disponible?: boolean;
  description?: string;
  averageRating?: number;
  totalRatings?: number;
  userRating?: number | null;
};

export type CommentItem = {
  _id: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  isMine: boolean;
  user: {
    _id: string;
    name: string;
  };
};

export type CommentPagination = {
  total: number;
  page: number;
  limit: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type AvailabilityFilter = "all" | "available" | "unavailable";
export type ReservationFilter = "all" | "reserved" | "not_reserved";
export type CommentFilter = "all" | "mine";
export type CommentSort = "newest" | "oldest";
