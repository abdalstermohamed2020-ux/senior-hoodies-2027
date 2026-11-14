import React, { useState } from 'react';
import { X, Search, CheckCircle2, Package, AlertCircle } from 'lucide-react';
import { StoredOrder } from '../types';
import { getSavedOrders } from '../utils/tracking';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<StoredOrder | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim().toUpperCase();
    if (!cleanQuery) return;

    const saved = getSavedOrders();
    const found = saved.find(
      (o) =>
        o.trackingId.toUpperCase().includes(cleanQuery) ||
        o.whatsApp.includes(cleanQuery) ||
        o.fullName.toLowerCase().includes(query.trim().toLowerCase())
    );

    setSearchResult(found || null);
    setHasSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#1E293B] border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-right my-8">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-sky-500/20 text-[#38BDF8]">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">تتبع حالة الحجز والعربون</h3>
            <span className="text-xs text-slate-400">ابحث بكود التتبع [BIS-0001 أو BIS TEAM-001] أو برقم الواتساب</span>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-[#38BDF8] hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors shrink-0 cursor-pointer"
            >
              بحث
            </button>
            <input
              type="text"
              required
              placeholder="مثال: BIS-0001 أو BIS TEAM-001 أو 01012345678"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
            />
          </div>
        </form>

        {hasSearched && searchResult && (
          <div className="bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-mono font-bold text-[#38BDF8]">
                [{searchResult.trackingId}]
              </span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                حجز مؤكد مع سداد العربون
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block text-[10px]">الاسم:</span>
                <span className="font-semibold text-white">{searchResult.fullName}</span>
              </div>
              {searchResult.nameOnHoodie && (
                <div>
                  <span className="text-slate-500 block text-[10px]">الاسم على الهودي:</span>
                  <span className="font-semibold text-amber-300 font-mono">{searchResult.nameOnHoodie}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500 block text-[10px]">المقاس والكمية:</span>
                <span className="font-semibold text-amber-300">{searchResult.size}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">نوع الحجز:</span>
                <span className="font-medium text-[#38BDF8]">{searchResult.orderType === 'team' ? searchResult.teamName : 'طلب فردي'}</span>
              </div>
              {searchResult.weightKg && (
                <div>
                  <span className="text-slate-500 block text-[10px]">الوزن المسجل:</span>
                  <span className="font-mono text-white">{searchResult.weightKg}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500 block text-[10px]">المبلغ الإجمالي:</span>
                <span className="font-mono font-bold text-white">{searchResult.totalPrice} ج.م</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">الطباعة:</span>
                <span className="text-[11px] text-[#38BDF8] font-semibold">سلك اسكرين وش وظهر</span>
              </div>
            </div>

            {/* Payment Summary */}
            {searchResult.payment && (
              <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between items-center text-emerald-400">
                  <span>العربون المسدد:</span>
                  <span className="font-mono font-bold">{searchResult.payment.amountPaid} ج.م</span>
                </div>
                <div className="flex justify-between items-center text-amber-300">
                  <span>المتبقي عند الاستلام:</span>
                  <span className="font-mono font-bold">{searchResult.payment.remainingAmount} ج.م</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>المرجع المالي:</span>
                  <span className="font-mono text-slate-300">{searchResult.payment.transactionRef}</span>
                </div>
              </div>
            )}

            <div className="p-3 bg-slate-950/80 rounded-xl text-[11px] text-slate-300 border border-slate-800/80 flex items-center gap-2 mt-2">
              <Package className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                مكان وموعد الاستلام: سيتم تسليم الطلبات رسمياً بمقر معهد السلاب فور انتهاء مرحلة التصنيع بكود التتبع الرسمي وإيصال العربون.
              </span>
            </div>
          </div>
        )}

        {hasSearched && !searchResult && (
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 text-center">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">لم يتم العثور على حجز بهذا الكود محلياً</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              تأكد من كتابة الكود بشكل صحيح أو تواصل مع لجنة الدفعة عبر واتساب (01223589211) للتحقق من الكشوفات المباشرة.
            </p>
            <a
              href="https://wa.me/201223589211"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 mt-3 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-600/30 transition-colors"
            >
              <span>تواصل مع اللجنة عبر واتساب (01223589211)</span>
            </a>
          </div>
        )}

        {/* Recent local orders list */}
        {!hasSearched && (
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              الحجوزات المحفوظة على هذا الجهاز:
            </span>
            {getSavedOrders().length > 0 ? (
              <div className="space-y-2">
                {getSavedOrders().slice(0, 3).map((ord) => (
                  <div
                    key={ord.trackingId}
                    onClick={() => {
                      setSearchResult(ord);
                      setHasSearched(true);
                    }}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-[#38BDF8] block">[{ord.trackingId}]</span>
                      <span className="text-slate-300">{ord.fullName}</span>
                    </div>
                    <div className="text-left font-mono">
                      <span className="text-emerald-400 font-bold block">{ord.payment?.amountPaid || 0} ج.م عربون</span>
                      <span className="text-[10px] text-slate-500">إجمالي {ord.totalPrice} ج.م</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">لا توجد طلبات مسجلة على هذا المتصفح بعد.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
