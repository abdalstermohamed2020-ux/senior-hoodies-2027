import React from 'react';
import { Check, Users, User, Sparkles, Tag, ArrowLeft } from 'lucide-react';
import {
  INDIVIDUAL_PRICE_EGP,
  TEAM_PRICE_EGP,
  MIN_TEAM_MEMBERS,
} from '../utils/tracking';

interface PricingTierBannerProps {
  onSelectTier: (tier: 'individual' | 'team') => void;
}

export const PricingTierBanner: React.FC<PricingTierBannerProps> = ({ onSelectTier }) => {
  const indDeposit = Math.ceil(INDIVIDUAL_PRICE_EGP * 0.5); // 338
  const savingPerPiece = INDIVIDUAL_PRICE_EGP - TEAM_PRICE_EGP; // 35
  const minTeamSaving = savingPerPiece * MIN_TEAM_MEMBERS; // 175
  const minTeamDeposit = Math.ceil(TEAM_PRICE_EGP * MIN_TEAM_MEMBERS * 0.5); // 1600

  return (
    <section id="pricing" className="py-12 md:py-16 bg-slate-900/50 border-y border-slate-800/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-[#F59E0B] text-xs font-bold mb-3 border border-amber-500/20">
            <Tag className="w-3.5 h-3.5" />
            <span>تسعير مدعوم مع إمكانية سداد 50% عربون</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            اختر الباقة المناسبة لك أو لفريقك
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            تم دعم وتخفيض الأسعار حصرياً لدفعة نظم المعلومات مع تسهيل الحجز بعربون 50% فقط والباقي عند الاستلام.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {/* Tier 1: Individual Order */}
          <div className="rounded-2xl bg-[#1E293B] border border-slate-700/80 p-6 sm:p-8 flex flex-col justify-between shadow-xl relative group hover:border-slate-600 transition-all">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  INDIVIDUAL ORDER
                </span>
                <span className="p-2 rounded-xl bg-slate-800 text-[#38BDF8]">
                  <User className="w-5 h-5" />
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">طلب فردي</h3>
              <p className="text-xs text-slate-400 mb-4">
                مناسب إذا كنت تريد قطعة واحدة لنفسك مع تحديد المقاس والوزن بدقة وسداد العربون.
              </p>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700 mb-6 flex items-center justify-between">
                <div>
                  <span className="text-3xl font-black text-white font-mono">{INDIVIDUAL_PRICE_EGP}</span>
                  <span className="text-xs font-bold text-slate-300 mr-1.5">ج.م / للقطعة</span>
                </div>
                <div className="text-left text-xs">
                  <span className="text-slate-400 block text-[10px]">العربون المطلوب:</span>
                  <span className="text-amber-400 font-bold font-mono">{indDeposit} ج.م فقط (50%)</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  <span>هودي ميلتون ثقيل 400 GSM بأعلى معايير الجودة</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  <span>طباعة DTF عالية الكثافة (وش وظهر)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  <span>دفع 50% عربون ({indDeposit} ج.م) والمتبقي عند الاستلام</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  <span>كود تتبع رقمي متسلسل فوري [BIS-0001]</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectTier('individual')}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
            >
              <span>اختيار الحجز الفردي ({INDIVIDUAL_PRICE_EGP} ج.م)</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Tier 2: Team Order (5+ Members) - Highlighted */}
          <div className="rounded-2xl bg-gradient-to-b from-[#1E293B] to-slate-900 border-2 border-amber-500/70 p-6 sm:p-8 flex flex-col justify-between shadow-2xl relative group">
            {/* Discount Badge on Top */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#F59E0B] to-amber-500 text-slate-950 font-black text-[11px] px-3.5 py-0.5 rounded-full shadow-lg flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>وفر {savingPerPiece} ج.م على كل قطعة</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  TEAM & GROUP BUNDLE ({MIN_TEAM_MEMBERS}+ MEMBERS)
                </span>
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Users className="w-5 h-5" />
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">طلب التيم ومشاريع التخرج</h3>
              <p className="text-xs text-slate-400 mb-4">
                سجلوا كفريق من {MIN_TEAM_MEMBERS} أفراد فأكثر، باسم تيم موحد واستفيدوا من سعر التخفيض الخاص.
              </p>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 mb-6 flex items-center justify-between">
                <div>
                  <span className="text-3xl font-black text-amber-400 font-mono">{TEAM_PRICE_EGP}</span>
                  <span className="text-xs font-bold text-slate-200 mr-1.5">ج.م / للقطعة</span>
                  <span className="text-xs text-slate-500 line-through mr-1 font-mono">{INDIVIDUAL_PRICE_EGP} ج.م</span>
                </div>
                <div className="text-left text-xs">
                  <span className="text-slate-400 block text-[10px]">عربون {MIN_TEAM_MEMBERS} قطع:</span>
                  <span className="text-emerald-400 font-bold font-mono">{minTeamDeposit} ج.م (50%)</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-slate-300 mb-8">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-emerald-300">توفير {minTeamSaving} ج.م كحد أدنى لكل {MIN_TEAM_MEMBERS} أعضاء</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>طباعة DTF وش وظهر لجميع قطع الفريق</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>سداد 50% عربون للتيم والمتبقي عند الاستلام الجماعي</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>كود تتبع تسلسلي جماعي [BIS TEAM-001] وأولوية استلام</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectTier('team')}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#F59E0B] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>بدء تسجيل التيم ({TEAM_PRICE_EGP} ج.م)</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};