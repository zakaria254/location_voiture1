import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [navigate, user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 px-6 pt-32 pb-16">
      <section className="max-w-md mx-auto border border-white/10 rounded-2xl p-8 bg-zinc-900/60">
        <h1 className="text-3xl font-bold mb-2">Sign In</h1>
        <p className="text-zinc-400 mb-8">Access your bookings and profile.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold rounded-xl py-3 hover:bg-zinc-200 transition disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-zinc-400 text-sm mt-6">
          No account yet?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </section>
    </main>
  );
}
