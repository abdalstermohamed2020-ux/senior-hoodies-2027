import React, { useState, useEffect } from 'react';
import { X, Ruler, ShieldCheck, Sparkles, Scissors, Shirt, Check, Info } from 'lucide-react';
import { HoodieSize } from '../types';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSize?: HoodieSize;
  onSelectSize?: (size: HoodieSize) => void;
}

interface FactorySizeRow {
  size: HoodieSize;
  chestWidthCm: number;
  hoodieLengthCm: number;
  recommendedWeight: string;
  recommendedHeight: string;
}

const FACTORY_SIZE_CHART: FactorySizeRow[] = [
  {
    size: 'M',
    chestWidthCm: 58,
    hoodieLengthCm: 70,
    recommendedWeight: '55 – 68 كجم',
    recommendedHeight: '160 – 172 سم',
  },
  {
    size: 'L',
    chestWidthCm: 60,
    hoodieLengthCm: 72,
    recommendedWeight: '68 – 80 كجم',
    recommendedHeight: '170 – 178 سم',
  },
  {
    size: 'XL',
    chestWidthCm: 62,
    hoodieLengthCm: 74,
    recommendedWeight: '80 – 92 كجم',
    recommendedHeight: '175 – 185 سم',
  },
  {
    size: 'XXL',
    chestWidthCm: 64,
    hoodieLengthCm: 76,
    recommendedWeight: '92 – 108 كجم',
    recommendedHeight: '180 – 192 سم',
  },
];

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({
  isOpen,
  onClose,
  selectedSize = 'L',
  onSelectSize,
}) => {
  const [activeSize, setActiveSize] = useState<HoodieSize>(selectedSize);

  useEffect(() => {
    if (selectedSize) {
      setActiveSize(selectedSize);
    }
  }, [selectedSize]);

  if (!isOpen) return null;

  const handleConfirmSize = () => {
    if (onSelectSize) {
      onSelectSize(activeSize);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#111827] border border-slate-700/90 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative text-right my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-l from-slate-900 via-[#1E293B] to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center justify-end gap-2">
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-[#F59E0B] border border-amber-500/30">
                  Hoodie Oversize
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  جدول مقاسات الهودي المعتمد
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                اختر مقاسك بسهولة بناءً على وزنك وطولك أو أبعاد الباترون بالسنتيمتر (سم)
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-[#38BDF8] shrink-0">
              <Ruler className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Fabric Badge (قطن اسفنجي - COTTON FLEECE) */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg bg-[#F59E0B]/15 text-[#F59E0B] border border-amber-500/30 text-xs font-mono font-bold tracking-wider">
                COTTON FLEECE
              </span>
              <span className="text-xs font-semibold text-slate-400">الخامة المعتمدة</span>
            </div>
            <div className="text-right">
              <h3 className="text-base font-extrabold text-white">
                قطن اسفنجي
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                خامة ثقيلة - ناعمة - معالج ضد الوبرة والانكماش
              </p>
            </div>
          </div>

          {/* Complete Size Table with Weight & Height */}
          <div className="overflow-x-auto rounded-xl border border-slate-700/90 shadow-inner">
            <table className="w-full text-center border-collapse min-w-[540px]">
              <thead>
                <tr className="bg-slate-800/95 text-slate-200 text-xs sm:text-sm font-bold border-b border-slate-700">
                  <th className="py-3.5 px-3 text-amber-400">الطول المقترح</th>
                  <th className="py-3.5 px-3 border-x border-slate-700/70 text-emerald-400">الوزن المقترح</th>
                  <th className="py-3.5 px-3">طول الهودي (سم)</th>
                  <th className="py-3.5 px-3 border-x border-slate-700/70">عرض الصدر (سم)</th>
                  <th className="py-3.5 px-3 text-[#38BDF8]">المقاس</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900/70 text-xs sm:text-sm">
                {FACTORY_SIZE_CHART.map((row) => {
                  const isSelected = activeSize === row.size;
                  return (
                    <tr
                      key={row.size}
                      onClick={() => setActiveSize(row.size)}
                      className={`transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500/15 text-white'
                          : 'hover:bg-slate-800/60 text-slate-200'
                      }`}
                    >
                      <td className="py-3.5 px-3 font-bold text-amber-200">
                        {row.recommendedHeight}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-emerald-300 border-x border-slate-800">
                        {row.recommendedWeight}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-sm sm:text-base">
                        {row.hoodieLengthCm} <span className="text-[11px] font-sans text-slate-400">سم</span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-sm sm:text-base border-x border-slate-800">
                        {row.chestWidthCm} <span className="text-[11px] font-sans text-slate-400">سم</span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-black text-base sm:text-lg text-[#38BDF8]">
                        <span className="inline-flex items-center gap-1.5">
                          {isSelected && <Check className="w-4 h-4 text-[#F59E0B]" />}
                          {row.size}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Sizing Tip & Measurement Guide */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
            <Info className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
            <p>
              <strong className="text-white">نصيحة لاختيار المقاس:</strong> الهودي بقصة <strong className="text-[#F59E0B]">Oversize</strong> مريحة. إذا كان طولك أعلى من المعدل المعتاد لوزنك، اعتمد على عمود <strong className="text-amber-300">الطول المقترح</strong> لضمان طول مناسب، وإذا كنت بين مقاسين اختر المقاس الأكبر لإطلالة أوفرسايز أوسع.
            </p>
          </div>

          {/* 4 Factory Quality Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center">
              <ShieldCheck className="w-5 h-5 text-[#F59E0B] mb-1.5" />
              <span className="text-xs font-bold text-white">جودة عالية</span>
              <span className="text-[10px] text-slate-400 mt-0.5">أفضل الخامات</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center">
              <Sparkles className="w-5 h-5 text-[#38BDF8] mb-1.5" />
              <span className="text-xs font-bold text-white">راحة تامة</span>
              <span className="text-[10px] text-slate-400 mt-0.5">ملمس ناعم ومريح</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center">
              <Scissors className="w-5 h-5 text-[#F59E0B] mb-1.5" />
              <span className="text-xs font-bold text-white">تشطيب احترافي</span>
              <span className="text-[10px] text-slate-400 mt-0.5">دقة في كل تفصيلة</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center text-center">
              <Shirt className="w-5 h-5 text-[#38BDF8] mb-1.5" />
              <span className="text-xs font-bold text-white">هودي أوفر سايز</span>
              <span className="text-[10px] text-slate-400 mt-0.5">تلبيس عصري ومريح</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              إغلاق
            </button>

            {onSelectSize && (
              <button
                type="button"
                onClick={handleConfirmSize}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#38BDF8] to-sky-500 hover:from-sky-400 hover:to-sky-500 text-slate-950 text-xs font-black shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              >
                تأكيد واختيار مقاس {activeSize}
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400">
            المقاس المحدد حالياً:{' '}
            <span className="font-mono font-extrabold text-[#38BDF8] text-sm">
              {activeSize}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};