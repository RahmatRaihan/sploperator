'use client';

import Link from 'next/link';
import { Activity, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function TopNav({ mode = 'operator' }: { mode?: 'operator' | 'admin' }) {
  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between h-full px-4 md:px-8 w-full">
        <div className="flex items-center gap-3 md:gap-4">
          <Link href="/" className="flex items-center justify-center shrink-0">
            <img 
              src="https://www.bai.id/bai-logo.png" 
              alt="PT BAI Logo" 
              className="h-8 md:h-10 w-auto object-contain drop-shadow-sm"
            />
          </Link>
          <div className="w-px h-6 bg-slate-300 hidden sm:block" />
          <Link href="/" className="font-extrabold text-base md:text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 line-clamp-1">
            {process.env.NEXT_PUBLIC_APP_NAME || "Rekapan Lembur"}
          </Link>
        </div>
        <div className="flex items-center gap-5 md:gap-6">
          <span className="text-sm font-medium text-slate-500 hidden md:flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
            </span>
            Sistem Aktif
          </span>
          
          {mode === 'operator' ? (
            <Link 
              href="/admin/login" 
              className="text-xs md:text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 px-3 md:px-5 py-2 md:py-2.5 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              <span className="md:hidden">Admin</span>
              <span className="hidden md:inline">Login Admin</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 md:gap-3">
              <Link 
                href="/entry" 
                className="text-xs md:text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors whitespace-nowrap hidden sm:inline"
              >
                Ke Halaman Operator
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: '/admin/login' })}
                className="text-xs md:text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 md:px-5 py-2 md:py-2.5 rounded-full transition-all duration-300 flex items-center gap-2"
                title="Logout"
              >
                <LogOut size={16} className="md:w-4 md:h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
