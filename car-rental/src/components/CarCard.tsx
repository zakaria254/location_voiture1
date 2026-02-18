import { motion } from "framer-motion";
import { Link } from "react-router-dom";

type Car = {
  _id: string;
  marque: string;
  modele: string;
  prixParJour: number;
  image: string;
  disponible: boolean;
};

export default function CarCard({ car }: { car: Car }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, rotateX: 8, rotateY: 8 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="group relative overflow-hidden rounded-3xl glass h-full"
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={car.image}
          alt={car.modele}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
        />
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-semibold">{car.marque} {car.modele}</h3>
            <p className="text-zinc-400 text-sm">from ${car.prixParJour}/day</p>
          </div>
          <div className={`px-4 py-1 rounded-full text-xs font-medium ${car.disponible ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {car.disponible ? "Available" : "Booked"}
          </div>
        </div>

        <Link
          to={`/cars/${car._id}`}
          className="mt-6 block w-full py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-center font-medium transition"
        >
          View Details →
        </Link>
      </div>
    </motion.div>
  );
}
