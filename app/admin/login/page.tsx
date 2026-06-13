'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      toast.error('Email atau password salah');
      setLoading(false);
    } else {
      router.push('/admin/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 relative z-10 mx-4">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-primary to-blue-400 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Lock className="text-white" size={32} />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Admin Panel</h1>
          <p className="text-slate-500 text-sm">Masuk untuk mengelola data lembur PT Borneo Alumina Indonesia</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all"
                placeholder="admin@bai.id"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="password" 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={clsx(
              "w-full py-3.5 bg-primary text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all duration-300",
              loading ? "opacity-70 cursor-not-allowed" : "hover:bg-primary-light hover:-translate-y-0.5"
            )}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : "Masuk ke Dashboard"}
          </button>

          <div className="text-center mt-6">
            <Link href="/" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors flex items-center justify-center gap-2">
              Kembali ke Halaman Utama
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
