import { createClient } from "@supabase/supabase-js";
import DashboardClient from "./DashboardClient";

export const dynamic = 'force-dynamic';

// Server component to fetch dashboard data
export default async function AdminDashboard() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Fetch all data
  const { data: records, error } = await supabaseAdmin
    .from('overtime_records')
    .select('*');

  if (error) {
    console.error("Dashboard fetch error:", error);
    return <div>Terjadi kesalahan saat memuat data dashboard.</div>;
  }

  return <DashboardClient initialRecords={records || []} />;
}
