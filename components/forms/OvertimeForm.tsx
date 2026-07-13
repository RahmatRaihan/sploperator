'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, CheckCircle2, AlertCircle, Loader2, UploadCloud, FileImage } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import imageCompression from 'browser-image-compression';

// Zod Schema
const formSchema = z.object({
  tanggal: z.string().refine((val) => {
    const date = new Date(val);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return date <= today;
  }, { message: "Tanggal tidak boleh melewati hari ini" }),
  nama: z.string().min(3, "Nama minimal 3 karakter"),
  npk: z.string().regex(/^\d+$/, "NPK harus berupa angka").min(1, "NPK wajib diisi"),
  divisi: z.enum(["Thermal Power Plant - BTG", "Thermal Power Plant - C&AHS", "Thermal Power Plant - PDCA"], { message: "Pilih divisi" }),
  start_time: z.string().min(1, "Jam mulai wajib diisi"),
  out_time: z.string().min(1, "Jam selesai wajib diisi"),
  jam_lembur: z.string().min(1, { message: "Jam lembur harus diisi" }),
  ket_hari: z.enum(["Hari Kerja", "Hari Libur"], { message: "Pilih keterangan hari" }),
  keterangan: z.string().max(500, "Keterangan maksimal 500 karakter").optional(),
});

type FormDataType = z.infer<typeof formSchema>;

export default function OvertimeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [operators, setOperators] = useState<{nama: string, npk: string}[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormDataType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ket_hari: "Hari Kerja",
    }
  });

  const startTime = watch('start_time');
  const outTime = watch('out_time');
  const watchNama = watch('nama');

  useEffect(() => {
    fetch('/api/operators?active_only=true')
      .then(res => res.json())
      .then(data => {
        if (data.data) setOperators(data.data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (watchNama && operators.length > 0) {
      const matchedOp = operators.find(op => op.nama.toLowerCase() === watchNama.toLowerCase());
      if (matchedOp) {
        setValue('npk', matchedOp.npk, { shouldValidate: true });
      }
    }
  }, [watchNama, operators, setValue]);
  useEffect(() => {
    if (startTime && outTime) {
      const [h1, m1] = startTime.split(':').map(Number);
      const [h2, m2] = outTime.split(':').map(Number);
      
      let mins1 = h1 * 60 + m1;
      let mins2 = h2 * 60 + m2;
      
      if (mins2 <= mins1) {
        mins2 += 24 * 60; // Shift malam melewati tengah malam
      }
      
      let diffHours = (mins2 - mins1) / 60;
      // Membulatkan maksimal ke 2 angka desimal untuk kerapian
      diffHours = Math.round(diffHours * 100) / 100;
      setValue('jam_lembur', diffHours.toString(), { shouldValidate: true });
    }
  }, [startTime, outTime, setValue]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Only compress images, ignore PDFs
    if (selectedFile.type.startsWith('image/')) {
      setIsCompressing(true);
      try {
        const options = {
          maxSizeMB: 0.5, // Maksimal 500KB
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(selectedFile, options);
        // Retain original name
        const finalFile = new File([compressedFile], selectedFile.name, {
          type: compressedFile.type,
        });
        setFile(finalFile);
      } catch (error) {
        console.error("Gagal kompresi:", error);
        setFile(selectedFile); // Fallback ke file asli
      } finally {
        setIsCompressing(false);
      }
    } else {
      setFile(selectedFile);
    }
  };

  const onSubmit = async (data: FormDataType) => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        let value = data[key as keyof FormDataType];
        if (value !== undefined) {
          if (key === 'nama') value = String(value).toUpperCase();
          formData.append(key, String(value));
        }
      });

      if (!file) {
        toast.error('Anda wajib mengunggah file Bukti SPL (Foto/PDF).');
        setIsSubmitting(false);
        return;
      }
      
      formData.append('bukti_file', file);

      const res = await fetch('/api/overtime', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Gagal menyimpan data');
      }

      toast.success('Data lembur berhasil disimpan!');
      reset();
      setFile(null); // Clear file
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal Lembur <span className="text-red-500">*</span></label>
            <input 
              type="date" 
              {...register('tanggal')}
              className={clsx("w-full min-h-[44px] px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all", errors.tanggal ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50")}
            />
            {errors.tanggal && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.tanggal.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Divisi <span className="text-red-500">*</span></label>
            <select 
              {...register('divisi')}
              className={clsx("w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white", errors.divisi ? "border-red-300" : "border-slate-200")}
            >
              <option value="">Pilih Divisi...</option>
              <option value="Thermal Power Plant - BTG">Thermal Power Plant - BTG</option>
              <option value="Thermal Power Plant - C&AHS">Thermal Power Plant - C&AHS</option>
              <option value="Thermal Power Plant - PDCA">Thermal Power Plant - PDCA</option>
            </select>
            {errors.divisi && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.divisi.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Operator <span className="text-red-500">*</span></label>
            <div className="relative" ref={dropdownRef}>
              <input 
                type="text" 
                placeholder="Masukkan nama lengkap atau pilih dari daftar"
                autoComplete="off"
                {...register('nama')}
                onFocus={() => setShowDropdown(true)}
                className={clsx("w-full uppercase px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all", errors.nama ? "border-red-300 bg-red-50" : "border-slate-200 bg-white")}
              />
              {showDropdown && operators.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2">
                  {operators
                    .filter(op => op.nama.toLowerCase().includes((watchNama || '').toLowerCase()))
                    .map((op, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors uppercase text-sm font-semibold text-slate-700 flex items-center gap-2"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input onBlur from firing first
                          setValue('nama', op.nama.toUpperCase(), { shouldValidate: true });
                          setShowDropdown(false);
                        }}
                      >
                        {op.nama}
                      </div>
                  ))}
                  {operators.filter(op => op.nama.toLowerCase().includes((watchNama || '').toLowerCase())).length === 0 && (
                    <div className="px-4 py-4 text-sm text-slate-500 text-center italic">
                      Tidak ada operator yang cocok dengan pencarian
                    </div>
                  )}
                </div>
              )}
            </div>
            {errors.nama && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.nama.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">NPK <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              placeholder="Nomor Induk / NPK"
              {...register('npk')}
              className={clsx("w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all", errors.npk ? "border-red-300 bg-red-50" : "border-slate-200 bg-white")}
            />
            {errors.npk && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.npk.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jam Mulai (Start) <span className="text-red-500">*</span></label>
            <input 
              type="time" 
              {...register('start_time')}
              className={clsx("w-full min-h-[44px] px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all", errors.start_time ? "border-red-300 bg-red-50" : "border-slate-200 bg-white")}
            />
            {errors.start_time && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.start_time.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jam Selesai (Out) <span className="text-red-500">*</span></label>
            <input 
              type="time" 
              {...register('out_time')}
              className={clsx("w-full min-h-[44px] px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all", errors.out_time ? "border-red-300 bg-red-50" : "border-slate-200 bg-white")}
            />
            {errors.out_time && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.out_time.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Jam Lembur <span className="text-red-500">*</span></label>
            <input 
              type="text"
              readOnly
              {...register('jam_lembur')}
              className={clsx("w-full px-4 py-2.5 rounded-xl border outline-none bg-slate-100 text-slate-600 cursor-not-allowed font-medium", errors.jam_lembur ? "border-red-300" : "border-slate-200")}
              placeholder="Terhitung otomatis..."
            />
            {errors.jam_lembur && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.jam_lembur.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Keterangan Hari <span className="text-red-500">*</span></label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="Hari Kerja" {...register('ket_hari')} className="w-4 h-4 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-slate-700">Hari Kerja</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" value="Hari Libur" {...register('ket_hari')} className="w-4 h-4 text-primary focus:ring-primary" />
                <span className="text-sm font-medium text-slate-700">Hari Libur</span>
              </label>
            </div>
            {errors.ket_hari && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.ket_hari.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Keterangan / Deskripsi Pekerjaan</label>
          <textarea 
            rows={3}
            placeholder="Tuliskan keterangan lembur atau referensi SPL di sini..."
            {...register('keterangan')}
            className={clsx("w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-y", errors.keterangan ? "border-red-300 bg-red-50" : "border-slate-200 bg-white")}
          />
          {errors.keterangan && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.keterangan.message}</p>}
        </div>

        {/* Upload Bukti SPL */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unggah Bukti SPL (Foto / PDF) <span className="text-red-500">*</span></label>
          <div className="relative">
            <input 
              type="file" 
              accept="image/*,application/pdf"
              capture="environment" // trigger kamera jika di mobile
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload"
              className="flex items-center justify-center w-full sm:w-1/2 md:w-1/3 px-4 py-3 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-primary transition-all group"
            >
              <div className="flex flex-col items-center gap-1">
                {isCompressing ? (
                  <>
                    <Loader2 className="text-primary animate-spin" size={24} />
                    <span className="text-sm font-medium text-slate-600">Memproses...</span>
                  </>
                ) : file ? (
                  <>
                    <FileImage className="text-primary" size={24} />
                    <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">{file.name}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="text-slate-400 group-hover:text-primary transition-colors" size={24} />
                    <span className="text-sm font-medium text-slate-600">Pilih / Ambil Foto</span>
                  </>
                )}
              </div>
            </label>
          </div>
          <p className="text-xs text-slate-500 mt-2">Format yang didukung: JPG, PNG, PDF. Opsional.</p>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={isSubmitting || isCompressing}
            className="w-full sm:w-auto px-8 py-3 bg-primary hover:bg-primary-light text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 shadow-sm shadow-primary/30"
          >
            {isSubmitting || isCompressing ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSubmitting ? 'Menyimpan...' : isCompressing ? 'Memproses Foto...' : 'Simpan Data Lembur'}
          </button>
        </div>
      </form>
    </div>
  );
}
