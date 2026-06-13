import { LayoutDashboard } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="text-slate-400" size={24} />
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          </div>
          <p className="text-slate-500 text-sm">Ringkasan aktivitas lembur bulan ini</p>
        </div>
        <div className="px-4 py-2 bg-slate-100 rounded-lg text-slate-500 font-medium text-sm animate-pulse h-9 w-32" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="h-6 w-16 bg-slate-300 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 h-96 flex flex-col">
          <div className="h-6 w-48 bg-slate-200 rounded mb-6 animate-pulse" />
          <div className="flex-1 bg-slate-100/50 rounded-xl border border-slate-100 flex items-end justify-around pb-4 px-4 animate-pulse">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="w-8 bg-slate-200 rounded-t" style={{ height: `${Math.floor(Math.random() * 60) + 20}%` }} />
            ))}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-96 flex flex-col">
          <div className="h-6 w-48 bg-slate-200 rounded mb-6 animate-pulse" />
          <div className="flex-1 bg-slate-100/50 rounded-xl border border-slate-100 flex items-center justify-center animate-pulse">
            <div className="w-48 h-48 rounded-full border-[16px] border-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
