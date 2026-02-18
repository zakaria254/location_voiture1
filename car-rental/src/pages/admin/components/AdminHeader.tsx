import { RefreshCcw } from "lucide-react";

type AdminHeaderProps = {
  onRefresh: () => void;
};

export default function AdminHeader({ onRefresh }: AdminHeaderProps) {
  return (
    <header className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Control Center</p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">Modern Admin Dashboard</h1>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-zinc-800 px-4 py-2 text-sm hover:bg-zinc-700"
        >
          <RefreshCcw className="h-4 w-4" /> Refresh data
        </button>
      </div>
    </header>
  );
}

