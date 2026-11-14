import React, { useState, useEffect } from 'react';
import { Clock, Users, ChevronLeft, Play, Sparkles, ShieldCheck } from 'lucide-react';
import promoVideo from '../videos/video.mp4';
import frontPoster from '../assets/images/front.jpeg';
import { INDIVIDUAL_PRICE_EGP, TEAM_PRICE_EGP } from '../utils/tracking';

interface HeroSectionProps {
  onScrollToOrder: () => void;
  onOpenSizeGuide: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onScrollToOrder,
  onOpenSizeGuide,
}) => {
  // Countdown Timer State
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 4,
    hours: 18,
    minutes: 42,
    seconds: 35,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const indDeposit = Math.ceil(INDIVIDUAL_PRICE_EGP * 0.5);
  const teamSaving = INDIVIDUAL_PRICE_EGP - TEAM_PRICE_EGP;

  return (
    <section className="relative pt-6 pb-16 md:pt-12 md:pb-24 overflow-hidden">
      {/* Ambient background glow accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#38BDF8]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-[#F59E0B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column (Text & Value Proposition) */}
          <div className="lg:col-span-6 space-y-6 text-right">
            {/* Department & Institute Trust Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 shadow-md">
              <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
              <span className="text-xs font-semibold text-slate-200">
                قسم نظم المعلومات الإدارية
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-xs font-mono font-bold text-[#F59E0B]">دفعة 2027</span>
            </div>

            {/* Main Headline + Highlighted Fabric Specs */}
            <div className="space-y-3.5">
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Senior IS Hoodies <br />
                <span className="bg-gradient-to-l from-[#38BDF8] via-sky-300 to-[#F59E0B] bg-clip-text text-transparent">
                  هودي التخرج الرسمي 2027
                </span>
              </h1>

              {/* Eye-catching Hoodie Fabric & Craftsmanship Strip */}
              <div className="inline-flex flex-wrap items-center gap-2 sm:gap-2.5 px-4 py-2.5 rounded-2xl bg-gradient-to-l from-sky-500/15 via-slate-900/95 to-amber-500/15 border border-sky-400/40 shadow-lg shadow-sky-500/10">
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-white">
                  <Sparkles className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <span>هودي ميلتون قطن إسفنجي</span>
                </span>
                <span className="text-slate-600 font-bold">•</span>
                <span className="px-2.5 py-0.5 rounded-lg bg-[#38BDF8]/15 border border-[#38BDF8]/35 text-xs sm:text-sm font-black text-[#38BDF8]">
                  دابل زونط
                </span>
                <span className="text-slate-600 font-bold">•</span>
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>معالج ضد الوبرة والانكماش</span>
                </span>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                النسخة المعتمدة لدفعة تخرج نظم المعلومات بمعهد السلاب. تصميم استثنائي يجمع بين الهوية التقنية الأنيقة وطباعة DTF عالية الدقة وش وظهر، مع إمكانية تأكيد الحجز بسداد 50% عربون فقط.
              </p>
            </div>

            {/* Countdown Timer Box */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/70 shadow-xl max-w-lg">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#F59E0B]">
                  <Clock className="w-4 h-4" />
                  <span>متبقي على إغلاق باب الحجز وتوريد القماش:</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">LIMITED RUN #01</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-800">
                  <span className="text-xl sm:text-2xl font-black font-mono text-white block">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">يوم</span>
                </div>
                <div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-800">
                  <span className="text-xl sm:text-2xl font-black font-mono text-white block">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">ساعة</span>
                </div>
                <div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-800">
                  <span className="text-xl sm:text-2xl font-black font-mono text-white block">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">دقيقة</span>
                </div>
                <div className="bg-slate-950 p-2 sm:p-2.5 rounded-xl border border-slate-800">
                  <span className="text-xl sm:text-2xl font-black font-mono text-[#38BDF8] block animate-pulse">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">ثانية</span>
                </div>
              </div>
            </div>

            {/* Dynamic Pricing Callouts (Side-by-side with 50% deposit note) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              {/* Individual Card */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">طلب فردي (عربون {indDeposit} ج.م)</span>
                  <span className="text-lg font-black text-white font-mono">{INDIVIDUAL_PRICE_EGP} ج.م</span>
                </div>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 font-medium">
                  فردي
                </span>
              </div>

              {/* Team Discount Card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/40 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-amber-300 font-bold block">طلب التيم (عربون 50%)</span>
                    <span className="text-[9px] bg-amber-500 text-slate-950 px-1 py-0.2 rounded font-black">وفّر {teamSaving}</span>
                  </div>
                  <span className="text-lg font-black text-amber-400 font-mono">{TEAM_PRICE_EGP} ج.م / للقطعة</span>
                </div>
                <Users className="w-5 h-5 text-amber-400" />
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                onClick={onScrollToOrder}
                className="py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#38BDF8] to-sky-500 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-black text-sm transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>احجز وسدد العربون الآن</span>
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenSizeGuide}
                className="py-3.5 px-5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-sm transition-colors border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>دليل المقاسات المعتمد</span>
              </button>
            </div>
          </div>

          {/* Right Column: Responsive Video Showcase Element */}
          <div className="lg:col-span-6 w-full">
            <div className="relative rounded-2xl p-2 bg-gradient-to-b from-slate-800/90 to-slate-900/95 border border-slate-700/80 shadow-2xl">
              {/* Top Bar Badge */}
              <div className="flex items-center justify-between px-3 py-2 mb-2 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200">فيديو علي الطبيعه</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#38BDF8]">
                  <Play className="w-3 h-3 fill-current" />
                  <span>PROMO 2027</span>
                </span>
              </div>

              {/* Video Player Container */}
              <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800/80 flex items-center justify-center">
                <video
                  src={promoVideo}
                  poster={frontPoster}
                  preload="metadata"
                  autoPlay
                  loop
                  muted
                  controls
                  playsInline
                  className="w-full max-h-[480px] object-contain"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};