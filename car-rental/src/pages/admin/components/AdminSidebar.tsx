import { Car, CalendarCheck, ChartNoAxesCombined, LayoutDashboard } from "lucide-react";
import type { ReactNode } from "react";
import type { TabKey } from "../types";

type SidebarItem = {
  key: TabKey;
  label: string;
  icon: ReactNode;
};

const sidebarItems: SidebarItem[] = [
  { key: "overview", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { key: "cars", label: "Cars", icon: <Car className="h-4 w-4" /> },
  { key: "bookings", label: "Bookings", icon: <CalendarCheck className="h-4 w-4" /> },
  { key: "insights", label: "Insights", icon: <ChartNoAxesCombined className="h-4 w-4" /> },
];

type AdminSidebarProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

export default function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  return (
    <aside className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 lg:sticky lg:top-28 lg:h-fit">
      <p className="mb-4 text-xs uppercase tracking-[0.25em] text-zinc-400">Admin Panel</p>
      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
        {sidebarItems.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onTabChange(item.key)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm transition lg:justify-start ${
              activeTab === item.key
                ? "border-primary bg-primary/20 text-primary"
                : "border-white/10 bg-zinc-800/70 text-zinc-300 hover:border-white/30"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

