export default function SkeletonSettings() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-6 animate-pulse">
        <div className="w-10 h-10 bg-slate-200 rounded-xl" />
        <div className="h-6 w-48 bg-slate-200 rounded" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 animate-pulse">
            <div className="flex flex-col gap-2">
              <div className="h-5 w-32 bg-slate-200 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
            </div>
            <div className="h-8 w-8 bg-slate-200 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
