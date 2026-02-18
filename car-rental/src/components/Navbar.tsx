// src/components/Navbar.tsx
import { motion } from "framer-motion";
import { Car, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 text-2xl font-bold tracking-tighter">
          <Car className="w-8 h-8 text-primary" /> LUXE
        </Link>

        <div className="flex items-center gap-8 text-sm font-medium">
          <Link to="/cars" className="hover:text-primary transition">Fleet</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-primary transition">My Bookings</Link>
              {user.role === "admin" && <Link to="/admin" className="text-accent">Admin</Link>}
              <button onClick={logout} className="flex items-center gap-2 hover:text-red-400 transition">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="px-6 py-2.5 rounded-full bg-white text-black font-semibold hover:bg-white/90 transition">Sign in</Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
