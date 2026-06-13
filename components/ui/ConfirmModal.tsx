'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type ConfirmModalProps = {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export default function ConfirmModal({ 
  isOpen, 
  title = "Konfirmasi Tindakan", 
  message, 
  onConfirm, 
  onCancel,
  isLoading = false
}: ConfirmModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={() => !isLoading && onCancel()}
      />
      <div className={`bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-full">
              <AlertTriangle size={24} />
            </div>
            <button 
              onClick={onCancel}
              disabled={isLoading}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-600 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 transition-colors disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              'Ya, Hapus'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
