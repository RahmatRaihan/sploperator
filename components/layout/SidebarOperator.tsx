'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardEdit, FileText } from 'lucide-react';
import { clsx } from 'clsx';

const menuItems = [
  { href: '/entry', label: 'Entry Lembur', icon: ClipboardEdit },
  { href: '/rekapan', label: 'Rekapan Lembur', icon: FileText },
];

export default function SidebarOperator() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-72 bg-white border-t md:border-t-0 md:border-r border-slate-200 md:h-[calc(100vh-4rem)] flex-shrink-0 fixed bottom-0 left-0 z-40 md:sticky md:top-16 md:self-start flex md:flex-col">
      <nav className="p-2 md:p-4 flex flex-row md:flex-col gap-1 md:gap-1.5 md:mt-4 w-full justify-around md:justify-start">
        <div className="hidden md:block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-3">Menu Operator</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href === '/entry' && pathname === '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'group flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-3 py-2 md:py-2.5 rounded-lg transition-all font-medium text-[11px] md:text-[14px] relative overflow-hidden flex-1 md:flex-none',
                isActive 
                  ? 'text-blue-700 bg-blue-50/80 md:bg-blue-50/80' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {isActive && (
                <>
                  <div className="hidden md:block absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-md" />
                  <div className="md:hidden absolute top-0 left-1/2 -translate-x-1/2 h-1 w-1/2 bg-blue-600 rounded-b-md" />
                </>
              )}
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={clsx("md:w-[18px] md:h-[18px]", isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600')} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
