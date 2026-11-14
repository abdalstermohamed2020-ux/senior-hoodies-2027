import React from 'react';
import { ShoppingBag } from 'lucide-react';

interface HeaderProps {
  onOpenSizeGuide: () => void;
  onOpenOrderLookup?: () => void;
  onScrollToOrder: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSizeGuide,
  onOpenOrderLookup,
  onScrollToOrder,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <a 
          href="#" 
          className="text-base sm:text-lg font-black tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 group"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#38BDF8] to-blue-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            IS
          </span>
          <span className="flex items-center gap-1.5">
            <span>IS SENIOR HOODIES</span>
            <span className="text-[#F59E0B] font-mono text-xs sm:text-sm">'27</span>
          </span>
        </a>

        {/* Zone 2: Navigation Links without Track Order */}
        <nav className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-semibold text-slate-300">
          <a 
            href="#features" 
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            المميزات
          </a>
          <a 
            href="#specs" 
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            مواصفات الخامة والطباعة
          </a>
          <button 
            type="button"
            onClick={onOpenSizeGuide}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            جدول المقاسات
          </button>
          <a 
            href="#pricing" 
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            الأسعار والخصم
          </a>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onScrollToOrder}
            className="py-2 px-4 sm:px-5 text-xs sm:text-sm font-bold text-slate-950 bg-gradient-to-r from-[#38BDF8] to-sky-400 rounded-xl hover:shadow-lg hover:shadow-sky-500/25 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>احجز هوديك الآن</span>
          </button>
        </div>
      </div>
    </header>
  );
};
