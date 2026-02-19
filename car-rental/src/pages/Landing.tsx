import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import ThreeCar from "../components/ThreeCar";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden animated-gradient">
      <ThreeCar />

      {/* Floating particles background (optional) */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] bg-[length:50px_50px]" />

      <div className="relative z-20 text-center px-6 max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-7xl md:text-8xl font-bold tracking-tighter mb-6"
        >
          Drive the<br />Extraordinary
        </motion.h1>

        <p className="text-xl text-zinc-400 mb-10 max-w-lg mx-auto">
          Premium car rental reimagined. Instant booking. Zero hassle.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/cars"
            className="group px-10 py-6 bg-white text-black rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all duration-300 text-lg"
          >
            Explore Fleet
            <ArrowRight className="group-hover:translate-x-2 transition" />
          </Link>
          <Link
            to="/cars"
            className="px-10 py-6 border border-white/30 rounded-2xl font-semibold flex items-center gap-3 hover:bg-white/10 transition text-lg"
          >
            <Play className="w-5 h-5" /> Watch the film
          </Link>
        </div>
      </div>

      {/* Scroll prompt */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs tracking-[4px] opacity-60"
      >
        SCROLL TO DISCOVER
      </motion.div>
    </div>
  );
}
