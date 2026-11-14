import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, 
  Copy, 
  Check, 
  Camera, 
  MessageCircle, 
  X,
  Scale,
  BadgeCheck,
  Lock,
  CheckCheck
} from 'lucide-react';
import { StoredOrder } from '../types';

interface SuccessConfirmationModalProps {
  order: StoredOrder | null;
  onClose: () => void;
  onNewOrder: () => void;
}

export const SuccessConfirmationModal: React.FC<SuccessConfirmationModalProps> = ({
  order,
  onClose,
  onNewOrder,
}) => {
  const [copied, setCopied] = useState(false);
  const [hasSentToWhatsApp, setHasSentToWhatsApp] = useState(false);

  useEffect(() => {
    if (order) {
      setHasSentToWhatsApp(false);
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38BDF8', '#F59E0B', '#10B981', '#FFFFFF'],
        });
      } catch (e) {
        console.log('Confetti effect executed', e);
      }
    }
  }, [order]);

  if (!order) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(order.trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppConfirmation = () => {
    const hoodieNameInfo = order.nameOnHoodie ? `🏷️ الاسم المطلوب على الهودي: ${order.nameOnHoodie}\n` : '';
    const weightInfo = order.weightKg ? `⚖️ الوزن المسجل: ${order.weightKg}\n` : '';
    const paymentInfo = order.payment ? (
      `💳 سداد العربون: تم سداد ${order.payment.amountPaid} ج.م عبر ${order.payment.method === 'vodafone_cash' ? 'فودافون كاش' : 'إنستاباي'}\n` +
      `🔢 مرجع التحويل: ${order.payment.transactionRef}\n` +
      `💵 المتبقي عند الاستلام بالمعهد: ${order.payment.remainingAmount} ج.م\n`
    ) : '';

    const text = encodeURIComponent(
      `السلام عليكم، قمت بحجز هودي تخرج نظم المعلومات ٢٠٢٧ - معهد السلاب وتأكيد سداد العربون.\n` +
      `📌 كود التتبع التسلسلي الرسمي: [${order.trackingId}]\n` +
      `👤 الاسم: ${order.fullName}\n` +
      hoodieNameInfo +
      weightInfo +
      paymentInfo +
      `👕 المقاس والكمية: ${order.size} (طباعة DTF وش وظهر)\n` +
      `💰 إجمالي المبلغ: ${order.totalPrice} جنيه مصري\n\n` +
      `برجاء اعتماد الحجز في الكشوفات الرسمية.`
    );
    
    window.open(`https://api.whatsapp.com/send?phone=201223589211&text=${text}`, '_blank');
    setHasSentToWhatsApp(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-right overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-80 h-32 bg-[#38BDF8]/15 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
            <CheckCircle className="w-9 h-9" />
          </div>
          <h3 className="text-2xl font-extrabold text-white">
            تم توثيق الحجز وسداد العربون بنجاح!
          </h3>
          <p className="text-sm text-slate-300 mt-1">
            قسم نظم المعلومات الإدارية - معهد السلاب (دفعة ٢٠٢٧)
          </p>
        </div>

        {/* Sequential Unique Tracking ID Display Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-500/60 rounded-2xl p-5 mb-6 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#38BDF8] via-[#F59E0B] to-[#38BDF8]" />
          
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest block mb-1">
            كود التتبع التسلسلي الرسمي المعتمد
          </span>

          <div className="flex items-center justify-center gap-3 my-2">
            <span className="text-3xl sm:text-4xl font-mono font-black text-white tracking-widest selection:bg-amber-500 selection:text-black">
              [{order.trackingId}]
            </span>
            <button
              onClick={handleCopy}
              className="p-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all flex items-center gap-1.5 shadow cursor-pointer"
              title="نسخ كود التتبع"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-bold">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold">نسخ</span>
                </>
              )}
            </button>
          </div>

          {/* Screenshot Reminder Callout */}
          <div className="mt-3 py-2 px-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center justify-center gap-2">
            <Camera className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-bold">
              تنبيه هام: التقط لقطة شاشة (Screenshot) فوراً لهذا الكود وإيصال العربون لتقديمه للجنة الاستلام بالمعهد.
            </span>
          </div>
        </div>

        {/* Order Details Summary Ticket */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-6 text-xs space-y-2.5">
          <div className="flex justify-between items-center text-slate-300 border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">نوع الحجز:</span>
            <span className="font-bold text-[#38BDF8]">
              {order.orderType === 'team' ? `طلب تيم جماعي (${order.teamName})` : 'طلب فردي'}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-300 border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">الاسم المسجل:</span>
            <span className="font-bold text-white">{order.fullName}</span>
          </div>

          {order.nameOnHoodie && (
            <div className="flex justify-between items-center text-slate-300 border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">الاسم على الهودي (Name on Hoodie):</span>
              <span className="font-bold text-amber-400 font-mono">{order.nameOnHoodie}</span>
            </div>
          )}

          {order.weightKg && (
            <div className="flex justify-between items-center text-slate-300 border-b border-slate-800/80 pb-2">
              <span className="text-slate-400 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-sky-400" />
                <span>الوزن المسجل:</span>
              </span>
              <span className="font-mono text-white">{order.weightKg}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-300 border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">المقاس والكمية:</span>
            <span className="font-medium text-white">{order.size}</span>
          </div>

          <div className="flex justify-between items-center text-slate-300 border-b border-slate-800/80 pb-2">
            <span className="text-slate-400">تقنية الطباعة:</span>
            <span className="font-bold text-[#38BDF8]">طباعة DTF (وش وظهر)</span>
          </div>

          {/* Payment Verification Box in Summary */}
          {order.payment && (
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-1.5 my-2">
              <div className="flex justify-between items-center text-emerald-400 font-semibold">
                <span className="flex items-center gap-1 text-[11px]">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>عربون التحويل المسدد:</span>
                </span>
                <span className="font-mono">{order.payment.amountPaid} ج.م ({order.payment.method === 'vodafone_cash' ? 'فودافون كاش' : 'إنستاباي'})</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>مرجع العملية (Ref):</span>
                <span className="font-mono text-slate-300">{order.payment.transactionRef}</span>
              </div>
              <div className="flex justify-between items-center text-amber-300 font-semibold text-[11px] pt-1 border-t border-slate-800">
                <span>المتبقي سداده عند الاستلام:</span>
                <span className="font-mono">{order.payment.remainingAmount} ج.م</span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center text-slate-300 pt-1">
            <span className="text-slate-400 font-bold">إجمالي قيمة الطلب:</span>
            <span className="text-base font-extrabold text-white font-mono">
              {order.totalPrice} جنيه مصري
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-4 space-y-2">
          <button
            onClick={handleWhatsAppConfirmation}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer ${
              hasSentToWhatsApp 
                ? 'bg-emerald-800/80 text-emerald-200 border border-emerald-500/50' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
            <span>{hasSentToWhatsApp ? 'تم تجهيز وتوثيق رسالة الحجز عبر واتساب بنجاح ✓' : 'إرسال وتوثيق الحجز مباشرة للجنة عبر واتساب (01223589211)'}</span>
          </button>
          
          {hasSentToWhatsApp ? (
            <p className="text-[11px] text-emerald-400 text-center flex items-center justify-center gap-1 font-semibold">
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              <span>تم تجهيز رسالة الواتساب. يمكنك تسجيل طلب جديد الآن.</span>
            </p>
          ) : (
            <p className="text-[11px] text-amber-300 text-center flex items-center justify-center gap-1 font-medium">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>زر تسجيل طلب جديد مقفل لحين توثيق وإرسال الحجز عبر واتساب.</span>
            </p>
          )}
        </div>

        <button
          onClick={() => {
            if (hasSentToWhatsApp) {
              onClose();
              onNewOrder();
            }
          }}
          disabled={!hasSentToWhatsApp}
          className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            hasSentToWhatsApp 
              ? 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer shadow-md' 
              : 'bg-slate-900/50 text-slate-500 border border-slate-800/80 cursor-not-allowed opacity-50'
          }`}
        >
          {!hasSentToWhatsApp && <Lock className="w-3.5 h-3.5 text-slate-500" />}
          <span>{hasSentToWhatsApp ? 'تسجيل طلب آخر جديد' : 'تسجيل طلب آخر جديد (مغلق لحين إتمام إرسال الواتساب)'}</span>
        </button>
      </div>
    </div>
  );
};