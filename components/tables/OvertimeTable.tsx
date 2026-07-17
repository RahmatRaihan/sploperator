'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Search, Filter, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import SkeletonTable from '../ui/SkeletonTable';

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
};

export default function OvertimeTable() {
  const [data, setData] = useState<OvertimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 25, totalPages: 0 });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('tanggal');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
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
        
        if (startDate) queryParams.append('start_date', startDate);
        if (endDate) queryParams.append('end_date', endDate);

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

    fetchData();
  }, [debouncedSearch, startDate, endDate, page, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between mb-6">
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
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-600"
            title="Tanggal Awal"
          />
          <span className="text-slate-400 text-sm font-medium">s/d</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-600"
            title="Tanggal Akhir"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="px-6 py-4">No</th>
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
              <th className="px-6 py-4">Status Hari</th>
              <th className="px-6 py-4">Jam</th>
              <th className="px-6 py-4 text-center cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => handleSort('jam_lembur')}>
                Total Lembur {sortBy === 'jam_lembur' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-4 text-center">Bukti SPL</th>
              <th className="px-6 py-4">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={10} className="px-0 py-0">
                  <SkeletonTable rows={5} columns={10} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-6 py-12 text-center text-slate-500 font-medium">
                  Tidak ada data lembur ditemukan.
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors text-slate-700">
                  <td className="px-6 py-4">{(meta.page - 1) * meta.limit + i + 1}</td>
                  <td className="px-6 py-4 font-medium">{format(new Date(row.tanggal), 'dd MMM yyyy', { locale: id })}</td>
                  <td className="px-6 py-4">{row.nama}</td>
                  <td className="px-6 py-4 font-mono text-xs">{row.npk}</td>
                  <td className="px-6 py-4 text-slate-500">{row.divisi}</td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      "px-2.5 py-1 rounded-md text-xs font-bold border",
                      row.ket_hari === 'Hari Libur' 
                        ? "bg-orange-50 text-orange-600 border-orange-200" 
                        : "bg-blue-50 text-blue-600 border-blue-200"
                    )}>
                      {row.ket_hari}
                    </span>
                  </td>
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
    </div>
  );
}
