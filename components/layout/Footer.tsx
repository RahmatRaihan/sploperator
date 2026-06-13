export default function Footer() {
  return (
    <footer className="bg-white/40 backdrop-blur-md border-t border-gray-200/50 mt-auto pt-8 pb-24 md:pb-8 px-6 text-center text-sm text-slate-500 relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-2">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-px bg-slate-300" />
          <span className="font-bold tracking-[0.2em] uppercase text-[10px] text-slate-400">Internal System</span>
          <div className="w-12 h-px bg-slate-300" />
        </div>
        <p className="font-semibold text-slate-700 text-base">Aplikasi Rekapan Lembur Operator</p>
        <p className="text-slate-500">Divisi <span className="font-bold text-primary">{process.env.NEXT_PUBLIC_DIVISI || "Thermal Power Plant"}</span> &bull; {process.env.NEXT_PUBLIC_INSTANSI || "PT Borneo Alumina Indonesia"}</p>
        <p className="mt-5 text-xs text-slate-400">&copy; 2026 PT Borneo Alumina Indonesia. Semua Hak Dilindungi.</p>
      </div>
    </footer>
  );
}
