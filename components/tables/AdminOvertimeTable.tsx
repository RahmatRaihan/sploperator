'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Search, Filter, Loader2, ChevronLeft, ChevronRight, Download, Trash2, Edit, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import EditOvertimeModal from '@/components/forms/EditOvertimeModal';
import SkeletonTable from '@/components/ui/SkeletonTable';
import ConfirmModal from '@/components/ui/ConfirmModal';

type OvertimeRecord = {
  id: string;
  tanggal: string;
  nama: string;
  npk: string;
  divisi: string;
  start_time: string;
  out_time: string;
  jam_lembur: number;
  ket_hari: string;
  keterangan: string | null;
  bukti_url: string | null;
  is_validated: boolean;
};

export default function AdminOvertimeTable() {
  const [data, setData] = useState<OvertimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 0 });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('tanggal');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Actions
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<OvertimeRecord | null>(null);
  const [togglingValidationId, setTogglingValidationId] = useState<string | null>(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '25',
        sort_by: sortBy,
        sort_order: sortOrder
      });
      
      if (debouncedSearch) {
        if (/^\d+$/.test(debouncedSearch)) {
          queryParams.append('npk', debouncedSearch);
        } else {
          queryParams.append('nama', debouncedSearch);
        }
      }
      
      if (month) queryParams.append('bulan', month);
      if (year) queryParams.append('tahun', year);

      const res = await fetch(`/api/overtime?${queryParams.toString()}`);
      const result = await res.json();

      if (res.ok) {
        setData(result.data || []);
        setMeta(result.meta || { total: 0, page: 1, limit: 25, totalPages: 0 });
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [debouncedSearch, month, year, page, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    
    setDeletingId(confirmDeleteId);
    try {
      const res = await fetch(`/api/overtime?id=${confirmDeleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("Data lembur berhasil dihapus");
        fetchData(); // reload
      } else {
        toast.error("Gagal menghapus data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleValidationToggle = async (recordId: string, currentStatus: boolean) => {
    setTogglingValidationId(recordId);
    try {
      const res = await fetch('/api/overtime', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: recordId, is_validated: !currentStatus })
      });
      if (res.ok) {
        toast.success(!currentStatus ? "Data berhasil divalidasi" : "Validasi dibatalkan");
        // Update local state tanpa refresh tabel
        setData(prevData => 
          prevData.map(record => 
            record.id === recordId 
              ? { ...record, is_validated: !currentStatus } 
              : record
          )
        );
      } else {
        toast.error("Gagal mengubah status validasi");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setTogglingValidationId(null);
    }
  };

  const handleExport = () => {
    // Navigate to export endpoint with current filters
    const queryParams = new URLSearchParams();
    if (month) queryParams.append('bulan', month);
    if (year) queryParams.append('tahun', year);
    if (debouncedSearch) {
      if (/^\d+$/.test(debouncedSearch)) queryParams.append('npk', debouncedSearch);
      else queryParams.append('nama', debouncedSearch);
    }
    
    window.open(`/api/export?${queryParams.toString()}`, '_blank');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      
      {/* Header & Filters */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between mb-6">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari Nama atau NPK..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
        
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="relative w-1/2 md:w-auto">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={month}
              onChange={(e) => { setMonth(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none appearance-none bg-white font-medium text-slate-700"
            >
              <option value="">Semua Bulan</option>
              {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{format(new Date(2026, m - 1, 1), 'MMMM', { locale: id })}</option>
              ))}
            </select>
          </div>
          
          <select 
            value={year}
            onChange={(e) => { setYear(e.target.value); setPage(1); }}
            className="w-1/2 md:w-auto px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white font-medium text-slate-700"
          >
            <option value="">Semua Tahun</option>
            {[2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <button 
            onClick={handleExport}
            className="w-full md:w-auto flex justify-center items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-sm shadow-green-600/20"
          >
            <Download size={18} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[calc(100vh-250px)] rounded-xl border border-slate-200 shadow-inner">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4">No</th>
              <th className="px-6 py-4 text-center">Aksi</th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('tanggal')}>
                Tanggal {sortBy === 'tanggal' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('nama')}>
                Nama {sortBy === 'nama' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('npk')}>
                NPK {sortBy === 'npk' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('divisi')}>
                Divisi {sortBy === 'divisi' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4">Jam</th>
              <th className="px-6 py-4 text-center cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('jam_lembur')}>
                Total Lembur {sortBy === 'jam_lembur' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 text-center">Bukti SPL</th>
              <th className="px-6 py-4">Keterangan</th>
              <th className="px-6 py-4 text-center cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('is_validated')}>
                Status {sortBy === 'is_validated' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={11} className="px-0 py-0">
                  <SkeletonTable rows={5} columns={11} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center text-slate-500 font-medium">
                  Tidak ada data lembur ditemukan.
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors text-slate-700">
                  <td className="px-6 py-4">{(meta.page - 1) * meta.limit + i + 1}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setEditingRecord(row)}
                        className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit Data"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => setConfirmDeleteId(row.id)}
                        disabled={deletingId === row.id}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Data"
                      >
                        {deletingId === row.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{format(new Date(row.tanggal), 'dd MMM yyyy', { locale: id })}</td>
                  <td className="px-6 py-4">{row.nama}</td>
                  <td className="px-6 py-4 font-mono text-xs">{row.npk}</td>
                  <td className="px-6 py-4 text-slate-500">{row.divisi}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold border border-slate-200">
                      {row.start_time.substring(0, 5)} - {row.out_time.substring(0, 5)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx(
                      "px-2.5 py-1 rounded-full text-xs font-bold",
                      row.ket_hari === 'Hari Libur' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                    )}>
                      {row.jam_lembur} Jam
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {row.bukti_url ? (
                      <a href={row.bukti_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-primary hover:text-white text-primary rounded-lg transition-colors text-xs font-semibold">
                        Lihat Bukti
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs font-medium">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 max-w-[200px] truncate" title={row.keterangan || '-'}>
                    {row.keterangan || '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleValidationToggle(row.id, row.is_validated)}
                      disabled={togglingValidationId === row.id}
                      className={clsx(
                        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                        row.is_validated 
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                        togglingValidationId === row.id && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {togglingValidationId === row.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : row.is_validated ? (
                        <CheckCircle size={14} />
                      ) : null}
                      {row.is_validated ? "Tervalidasi" : "Validasi"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && meta.totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6">
          <p className="text-sm text-slate-500 text-center md:text-left">
            Menampilkan <span className="font-semibold text-slate-700">{(meta.page - 1) * meta.limit + 1}</span> hingga <span className="font-semibold text-slate-700">{Math.min(meta.page * meta.limit, meta.total)}</span> dari <span className="font-semibold text-slate-700">{meta.total}</span> data
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={meta.page === 1}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={18} className="text-slate-600" />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
              disabled={meta.page === meta.totalPages}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={18} className="text-slate-600" />
            </button>
          </div>
        </div>
      )}

      {editingRecord && (
        <EditOvertimeModal 
          record={editingRecord}
          onClose={() => setEditingRecord(null)}
          onSuccess={() => {
            setEditingRecord(null);
            fetchData(); // reload
          }}
        />
      )}

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Hapus Data Lembur"
        message="Apakah Anda yakin ingin menghapus data lembur ini? Data yang sudah dihapus tidak dapat dikembalikan."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
        isLoading={deletingId !== null}
      />
    </div>
  );
}
