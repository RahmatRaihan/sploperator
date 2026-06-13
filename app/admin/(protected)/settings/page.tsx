'use client';

import { useState, useEffect } from 'react';
import { Loader2, Plus, Trash2, Users, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';
import SkeletonSettings from '@/components/ui/SkeletonSettings';
import ConfirmModal from '@/components/ui/ConfirmModal';

type Operator = {
  id: string;
  nama: string;
  npk: string;
};

export default function SettingsPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [nama, setNama] = useState('');
  const [npk, setNpk] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Password & Akun State
  const [emailBaru, setEmailBaru] = useState('');
  const [passwordLama, setPasswordLama] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);

  // Delete state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOperators = async () => {
    try {
      const res = await fetch('/api/operators');
      const result = await res.json();
      if (res.ok) {
        setOperators(result.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/operators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, npk })
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Gagal menambahkan operator');
      
      toast.success('Operator berhasil ditambahkan');
      setNama('');
      setNpk('');
      fetchOperators();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/operators?id=${confirmDeleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Operator berhasil dihapus');
        fetchOperators();
      } else {
        toast.error('Gagal menghapus operator');
      }
    } catch (err) {
      toast.error('Terjadi kesalahan jaringan');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  const handleGantiPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordBaru && passwordBaru !== konfirmasiPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }

    setIsPasswordSubmitting(true);

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailBaru, passwordLama, passwordBaru })
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error || 'Gagal memperbarui profil');
      
      toast.success(result.message);
      setEmailBaru('');
      setPasswordLama('');
      setPasswordBaru('');
      setKonfirmasiPassword('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsPasswordSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pengaturan</h1>
        <p className="text-slate-500 text-sm mt-1">Kelola Master Data Operator</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kolom Kiri: Form Tambah Operator & Form Ganti Password */}
        <div className="flex flex-col gap-6">
          {/* Tambah Operator Form */}
          {loading ? (
            <SkeletonSettings />
          ) : (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
              <Users size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Tambah Operator</h2>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Operator</label>
              <input 
                type="text" 
                required
                value={nama}
                onChange={e => setNama(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Misal: Budi Santoso"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">NPK</label>
              <input 
                type="text" 
                required
                value={npk}
                onChange={e => setNpk(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Misal: 12345"
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-2"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
              Simpan Operator
            </button>
          </form>
        </div>
        )}

        {/* Form Ganti Email & Password Admin */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-orange-100 text-orange-600 rounded-xl">
              <KeyRound size={20} />
            </div>
            <h2 className="text-lg font-bold text-slate-800">Akun & Keamanan Admin</h2>
          </div>

          <form onSubmit={handleGantiPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Baru (Opsional)</label>
              <input 
                type="email" 
                value={emailBaru}
                onChange={e => setEmailBaru(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Biarkan kosong jika tidak diubah"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Baru (Opsional)</label>
              <input 
                type="password" 
                minLength={5}
                value={passwordBaru}
                onChange={e => setPasswordBaru(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Biarkan kosong jika tidak diubah"
              />
            </div>
            {passwordBaru && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konfirmasi Password Baru</label>
                <input 
                  type="password" 
                  required
                  minLength={5}
                  value={konfirmasiPassword}
                  onChange={e => setKonfirmasiPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Ketik ulang password baru"
                />
              </div>
            )}
            
            <hr className="border-slate-100 my-4" />
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password Lama (Wajib)</label>
              <input 
                type="password" 
                required
                value={passwordLama}
                onChange={e => setPasswordLama(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                placeholder="Masukkan password saat ini untuk validasi"
              />
            </div>
            
            <button 
              type="submit"
              disabled={isPasswordSubmitting || (!emailBaru && !passwordBaru) || !passwordLama}
              className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-2"
            >
              {isPasswordSubmitting ? <Loader2 size={18} className="animate-spin" /> : <KeyRound size={18} />}
              Simpan Perubahan
            </button>
          </form>
        </div>
      </div>

        {/* Tabel Master Operator */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Daftar Master Operator</h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
              Total: {operators.length}
            </span>
          </div>
          
          <div className="overflow-y-auto max-h-[600px]">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">NPK</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 size={20} className="animate-spin text-primary" />
                        <span>Memuat data...</span>
                      </div>
                    </td>
                  </tr>
                ) : operators.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                      Belum ada Master Data Operator.
                    </td>
                  </tr>
                ) : (
                  operators.map((op, i) => (
                    <tr key={op.id} className="hover:bg-slate-50 transition-colors text-slate-700">
                      <td className="px-6 py-4 w-12">{i + 1}</td>
                      <td className="px-6 py-4 font-medium">{op.nama}</td>
                      <td className="px-6 py-4 font-mono text-xs">{op.npk}</td>
                      <td className="px-6 py-4 text-center w-24">
                        <button 
                          onClick={() => setConfirmDeleteId(op.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors group"
                          title="Hapus Operator"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Hapus Operator"
        message="Apakah Anda yakin ingin menghapus operator ini dari Master Data? Data yang sudah dihapus tidak dapat dikembalikan."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
