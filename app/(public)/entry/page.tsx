import { Clock } from 'lucide-react';
import OvertimeForm from '@/components/forms/OvertimeForm';

export default function EntryPage() {
  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out mt-4 md:mt-8">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">Entry Lembur Operator</h1>
          <p className="text-slate-500 mt-3 font-medium text-lg">Catat jam lembur Anda dengan akurat dan mudah.</p>
        </div>
        <div className="hidden sm:flex h-14 w-14 bg-white rounded-2xl shadow-sm border border-gray-100 items-center justify-center">
          <Clock className="text-primary animate-pulse" size={28} />
        </div>
      </div>
      
      <OvertimeForm />
    </div>
  );
}
