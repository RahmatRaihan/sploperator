import { createClient } from "@supabase/supabase-js";
import { ClipboardList, Clock, Users, Calendar } from "lucide-react";
import DashboardCharts from "./DashboardCharts";

export const dynamic = 'force-dynamic';

// Server component to fetch dashboard data
export default async function AdminDashboard() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  const startOfMonth = `${year}-${String(month).padStart(2, '0')}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endOfMonth = `${endYear}-${String(endMonth).padStart(2, '0')}-01`;

  // Fetch current month data
  const { data: records, error } = await supabaseAdmin
    .from('overtime_records')
    .select('*')
    .gte('tanggal', startOfMonth)
    .lt('tanggal', endOfMonth);

  if (error) {
    console.error("Dashboard fetch error:", error);
    return <div>Terjadi kesalahan saat memuat data dashboard.</div>;
  }

  // Calculate stats
  const totalLembur = records?.length || 0;
  const totalJam = records?.reduce((sum, r) => sum + (r.jam_lembur || 0), 0) || 0;
  const uniqueOperators = new Set(records?.map(r => r.npk)).size;
  
  const hariLibur = records?.filter(r => r.ket_hari === 'Hari Libur').length || 0;
  const hariKerja = records?.filter(r => r.ket_hari === 'Hari Kerja').length || 0;

  // Prepare chart data
  // 1. Jam lembur per operator
  const operatorMap = new Map<string, number>();
  records?.forEach(r => {
    operatorMap.set(r.nama, (operatorMap.get(r.nama) || 0) + r.jam_lembur);
  });
  const barChartData = Array.from(operatorMap, ([name, jam]) => ({ name, jam }))
    .sort((a, b) => b.jam - a.jam)
    .slice(0, 10); // Top 10

  // 2. Pie chart data
  const pieChartData = [
    { name: 'Hari Libur', value: hariLibur, fill: '#ea580c' },
    { name: 'Hari Kerja', value: hariKerja, fill: '#1d4ed8' },
  ];

  const statCards = [
    { title: "Total Lembur Bulan Ini", value: totalLembur, icon: ClipboardList, color: "bg-blue-100 text-blue-600" },
    { title: "Total Jam Lembur", value: `${totalJam} Jam`, icon: Clock, color: "bg-green-100 text-green-600" },
    { title: "Operator Aktif", value: `${uniqueOperators} Orang`, icon: Users, color: "bg-purple-100 text-purple-600" },
    { title: "Libur vs Kerja", value: `${hariLibur} : ${hariKerja}`, icon: Calendar, color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Ringkasan aktivitas lembur bulan {date.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts (Client Component) */}
      <DashboardCharts barData={barChartData} pieData={pieChartData} />
    </div>
  );
}
