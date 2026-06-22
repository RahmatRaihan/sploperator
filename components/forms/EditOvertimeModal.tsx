import { useState, useEffect } from 'react';
import { Save, X, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function EditOvertimeModal({ record, onClose, onSuccess }: { record: any, onClose: () => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState(record);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formData.start_time && formData.out_time) {
      const [h1, m1] = formData.start_time.split(':').map(Number);
      const [h2, m2] = formData.out_time.split(':').map(Number);
      let mins1 = h1 * 60 + m1;
      let mins2 = h2 * 60 + m2;
      if (mins2 <= mins1) mins2 += 24 * 60;
      let diffHours = (mins2 - mins1) / 60;
      diffHours = Math.round(diffHours * 100) / 100;
      setFormData((prev: any) => ({ ...prev, jam_lembur: diffHours }));
    }
  }, [formData.start_time, formData.out_time]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined && formData[key] !== null) {
          data.append(key, String(formData[key]));
        }
      });
      if (file) data.append('bukti_file', file);

      const res = await fetch('/api/overtime', { method: 'PUT', body: data });
      if (!res.ok) throw new Error("Gagal update data");
      
      onSuccess();
    } catch (err) {
      alert("Error: Gagal menyimpan perubahan");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-slate-800">Edit Data Lembur</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal</label>
              <input type="date" value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Divisi</label>
              <select value={formData.divisi} onChange={e => setFormData({...formData, divisi: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none bg-white">
                <option value="Thermal Power Plant - BTG">Thermal Power Plant - BTG</option>
                <option value="Thermal Power Plant - C&CHS">Thermal Power Plant - C&CHS</option>
                <option value="Thermal Power Plant - PDCA">Thermal Power Plant - PDCA</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Operator</label>
              <input type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">NPK</label>
              <input type="text" value={formData.npk} onChange={e => setFormData({...formData, npk: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jam Mulai</label>
              <input type="time" value={formData.start_time.substring(0, 5)} onChange={e => setFormData({...formData, start_time: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jam Selesai</label>
              <input type="time" value={formData.out_time.substring(0, 5)} onChange={e => setFormData({...formData, out_time: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Jam Lembur</label>
              <input type="text" readOnly value={formData.jam_lembur} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 outline-none cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Keterangan Hari</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="Hari Kerja" checked={formData.ket_hari === 'Hari Kerja'} onChange={e => setFormData({...formData, ket_hari: e.target.value})} className="w-4 h-4 text-primary focus:ring-primary" />
                  <span className="text-sm font-medium">Hari Kerja</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="Hari Libur" checked={formData.ket_hari === 'Hari Libur'} onChange={e => setFormData({...formData, ket_hari: e.target.value})} className="w-4 h-4 text-primary focus:ring-primary" />
                  <span className="text-sm font-medium">Hari Libur</span>
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Keterangan</label>
            <textarea value={formData.keterangan || ''} onChange={e => setFormData({...formData, keterangan: e.target.value})} rows={2} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Timpa Bukti SPL (Opsional)</label>
            <input type="file" accept="image/*,application/pdf" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-colors" />
            {formData.bukti_url && !file && (
              <p className="text-xs text-blue-600 mt-2">Data ini sudah memiliki file bukti. Unggah file baru hanya jika ingin mengubahnya.</p>
            )}
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-70">
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
