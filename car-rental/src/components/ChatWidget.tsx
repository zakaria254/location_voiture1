import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

type ChatMessage = {
  id: string;
  sender: "user" | "bot";
  text: string;
};

type ChatCar = {
  _id: string;
  marque: string;
  modele: string;
  prixParJour: number;
  annee?: number;
};

type ChatBooking = {
  _id: string;
  statut: string;
  carId?: {
    marque?: string;
    modele?: string;
  };
};

type ChatResponse = {
  answer?: string;
  cars?: ChatCar[];
  bookings?: ChatBooking[];
};

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: makeId(),
      sender: "bot",
      text: "Hi! Ask me about expensive cars, reserved cars, 2026 cars, or bookings."
    }
  ]);

  const roleLabel = useMemo(() => {
    if (!user) return "visitor";
    return user.role;
  }, [user]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    setMessages((prev) => [...prev, { id: makeId(), sender: "user", text: message }]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/chat", { message });
      const data: ChatResponse = res.data?.data ?? {};
      const lines: string[] = [];
      if (data.answer) lines.push(data.answer);

      if (data.cars?.length) {
        lines.push("");
        lines.push("Cars:");
        for (const car of data.cars.slice(0, 6)) {
          lines.push(
            `- ${car.marque} ${car.modele} (${car.prixParJour}$/day${car.annee ? `, ${car.annee}` : ""})`
          );
        }
      }

      if (data.bookings?.length) {
        lines.push("");
        lines.push("Bookings:");
        for (const booking of data.bookings.slice(0, 6)) {
          const label = `${booking.carId?.marque || "Car"} ${booking.carId?.modele || ""}`.trim();
          lines.push(`- ${label}: ${booking.statut}`);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          sender: "bot",
          text: lines.join("\n") || "I could not find matching data for this question."
        }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          sender: "bot",
          text: "I could not answer right now. Please try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="w-[330px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/15 bg-zinc-900/95 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Rental Assistant</p>
              <p className="text-xs text-zinc-400">Role: {roleLabel}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-md px-2 py-1 text-xs text-zinc-300 hover:bg-white/10"
            >
              Close
            </button>
          </div>

          <div className="max-h-80 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl px-3 py-2 text-sm whitespace-pre-line ${
                  msg.sender === "user"
                    ? "ml-8 bg-primary/20 text-primary"
                    : "mr-8 bg-white/8 text-zinc-100"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <p className="text-xs text-zinc-400">Typing...</p>}
          </div>

          <form onSubmit={sendMessage} className="border-t border-white/10 p-3">
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Example: "cars lghaliyin"'
                className="flex-1 rounded-xl border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-zinc-950 disabled:opacity-60"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-full border border-primary/40 bg-zinc-900 px-4 py-3 text-sm font-semibold text-primary shadow-lg"
        >
          Chat Assistant
        </button>
      )}
    </div>
  );
}
