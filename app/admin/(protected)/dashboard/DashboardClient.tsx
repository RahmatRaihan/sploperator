'use client';

import { useState, useMemo } from 'react';
import { ClipboardList, Clock, Users, Calendar, Search } from "lucide-react";
import DashboardCharts from "./DashboardCharts";

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
  is_validated: boolean;
};

export default function DashboardClient({ initialRecords }: { initialRecords: OvertimeRecord[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 1. Filter Data
  const filteredRecords = useMemo(() => {
    return initialRecords.filter((record) => {
      // Filter Nama
      if (searchQuery && !record.nama.toLowerCase().includes(searchQuery.toLowerCase()) && !record.npk.includes(searchQuery)) {
        return false;
      }
      // Filter Tanggal
      if (startDate && record.tanggal < startDate) {
        return false;
      }
      if (endDate && record.tanggal > endDate) {
        return false;
      }
      return true;
    });
  }, [initialRecords, searchQuery, startDate, endDate]);

  // 2. Calculate Stats
  const totalLembur = filteredRecords.length;
  const totalJam = filteredRecords.reduce((sum, r) => sum + (r.jam_lembur || 0), 0);
  const uniqueOperators = new Set(filteredRecords.map(r => r.npk)).size;
  
  const hariLibur = filteredRecords.filter(r => r.ket_hari === 'Hari Libur').length;
  const hariKerja = filteredRecords.filter(r => r.ket_hari === 'Hari Kerja').length;

  // 3. Prepare Chart Data
  const operatorMap = new Map<string, number>();
  filteredRecords.forEach(r => {
    operatorMap.set(r.nama, (operatorMap.get(r.nama) || 0) + r.jam_lembur);
  });
  const barChartData = Array.from(operatorMap, ([name, jam]) => ({ name, jam }))
    .sort((a, b) => b.jam - a.jam)
    .slice(0, 10); // Top 10

  const pieChartData = [
    { name: 'Hari Libur', value: hariLibur, fill: '#ea580c' },
    { name: 'Hari Kerja', value: hariKerja, fill: '#1d4ed8' },
  ];

  const statCards = [
    { title: "Total Data Lembur", value: totalLembur, icon: ClipboardList, color: "bg-blue-100 text-blue-600" },
    { title: "Total Jam Lembur", value: `${totalJam} Jam`, icon: Clock, color: "bg-green-100 text-green-600" },
    { title: "Operator Aktif", value: `${uniqueOperators} Orang`, icon: Users, color: "bg-purple-100 text-purple-600" },
    { title: "Libur vs Kerja", value: `${hariLibur} : ${hariKerja}`, icon: Calendar, color: "bg-orange-100 text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Ringkasan aktivitas lembur</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto bg-white p-3 rounded-2xl shadow-sm border border-slate-200">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari Nama atau NPK..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-600"
                title="Tanggal Awal"
              />
            </div>
            <span className="text-slate-400 text-sm font-medium">s/d</span>
            <div className="relative w-full">
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-slate-600"
                title="Tanggal Akhir"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
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

      {/* Charts */}
      <DashboardCharts barData={barChartData} pieData={pieChartData} />
    </div>
  );
}
