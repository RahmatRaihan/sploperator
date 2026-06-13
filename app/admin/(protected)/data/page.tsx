import AdminOvertimeTable from "@/components/tables/AdminOvertimeTable";

export const metadata = {
  title: 'Kelola Data Lembur - Admin TPP PT Borneo Alumina Indonesia',
};

export default function AdminDataPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Kelola Data Lembur</h1>
        <p className="text-slate-500 text-sm mt-1">Lihat, cari, hapus data, dan ekspor ke Excel</p>
      </div>

      <AdminOvertimeTable />
    </div>
  );
}
