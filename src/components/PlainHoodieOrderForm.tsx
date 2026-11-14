import React, { useState } from 'react';
import { 
  Sparkles, Check, Loader2, AlertCircle, CreditCard, Copy, Send, HelpCircle 
} from 'lucide-react';
import { HoodieSize, StoredOrder, PaymentMethod, PaymentDetails } from '../types';
import { 
  PLAIN_HOODIE_PRICE_EGP,
  OFFICIAL_PAYMENT_ACCOUNTS,
  generatePlainHoodieTrackingId,
  calculatePlainHoodiePrice,
  validateAdvancePayment,
  sendOrderToGoogleSheet,
  validatePhone
} from '../utils/tracking';

const SIZES: HoodieSize[] = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

interface PlainHoodieOrderFormProps {
  onOrderSuccess: (order: StoredOrder) => void;
  onOpenSizeGuide: () => void;
}

export const PlainHoodieOrderForm: React.FC<PlainHoodieOrderFormProps> = ({
  onOrderSuccess,
  onOpenSizeGuide,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    whatsApp: '',
    weightKg: '',
    size: 'L' as HoodieSize,
    quantity: 1,
    notes: '',
    payment: {
      method: 'vodafone_cash' as PaymentMethod,
      amountPaid: 225, // 50% من 450
      senderAccountOrPhone: '',
      transactionRef: '',
      receiptPreviewUrl: '',
      paidPercentage: 50,
      remainingAmount: 225,
      isVerified: true,
    },
  });

  const pricing = calculatePlainHoodiePrice(form.quantity);

  const handleCopyAccount = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleSelectPaymentMethod = (newMethod: PaymentMethod) => {
    setForm((prev) => ({
      ...prev,
      payment: { ...prev.payment, method: newMethod, senderAccountOrPhone: '', transactionRef: '' },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!form.fullName.trim() || form.fullName.trim().split(' ').length < 2) {
      setErrorMessage('يرجى كتابة الاسم ثلاثي أو رباعي بالكامل');
      return;
    }
    if (!validatePhone(form.whatsApp)) {
      setErrorMessage('يرجى كتابة رقم واتساب مصري صحيح (مثال: 01012345678)');
      return;
    }
    if (!form.weightKg.trim()) {
      setErrorMessage('يرجى إدخال الوزن التقريبي بالكيلوجرام');
      return;
    }

    const minAllowedDeposit = pricing.totalPrice * 0.5;
    if (form.payment.amountPaid < minAllowedDeposit) {
      setErrorMessage(`عربون الحجز لا يمكن أن يقل عن نصف المبلغ الإجمالي (${minAllowedDeposit} جنيه مصري).`);
      return;
    }

    const validation = validateAdvancePayment(form.payment, pricing.totalPrice);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'يرجى مراجعة بيانات سداد العربون بدقة.');
      return;
    }

    setIsSubmitting(true);

    try {
      const trackingId = generatePlainHoodieTrackingId();
      const remainingAmount = pricing.totalPrice - form.payment.amountPaid;
      const verifiedPayment: PaymentDetails = {
        ...form.payment,
        remainingAmount,
        isVerified: true,
      };

      const formattedDate = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });
      const instapayRef = form.payment.method === 'instapay' ? form.payment.transactionRef.trim() : 'غير متاح';
      const vfcashSender = form.payment.method === 'vodafone_cash' ? form.payment.senderAccountOrPhone.trim() : 'غير متاح';

      await sendOrderToGoogleSheet(
        {
          timestamp: formattedDate,
          trackingId,
          orderType: 'plain_hoodie',
          fullName: form.fullName.trim(),
          nameOnHoodie: 'هودي سادة بدون طباعة',
          whatsApp: form.whatsApp.trim(),
          size: form.size,
          weight: form.weightKg.trim() + ' كجم',
          quantity: form.quantity,
          paidAmount: form.payment.amountPaid,
          totalPrice: pricing.totalPrice,
          instapayRef,
          vfcashSender,
          receiptProofUrl: 'تم التحقق يدوياً عبر بيانات الدفع',
          targetSheet: 'حجز الهودي السادة',
          sheetTab: 'حجز الهودي السادة',
          sheetName: 'حجز الهودي السادة',
          tabName: 'حجز الهودي السادة',
          customerWhatsApp: form.whatsApp.trim(),
          row: [
            formattedDate, 
            trackingId, 
            'plain_hoodie', 
            form.fullName.trim(), 
            form.whatsApp.trim(), 
            form.size, 
            form.weightKg.trim() + ' كجم', 
            form.quantity, 
            form.payment.amountPaid, 
            pricing.totalPrice, 
            instapayRef, 
            vfcashSender, 
            form.notes.trim() || 'لا توجد ملاحظات'
          ],
        },
        verifiedPayment
      );

      onOrderSuccess({
        trackingId,
        orderType: 'individual', // لعرض نافذة النجاح العامة
        fullName: form.fullName.trim(),
        nameOnHoodie: 'هودي سادة بدون طباعة',
        whatsApp: form.whatsApp.trim(),
        weightKg: form.weightKg.trim() + ' كجم',
        size: form.size,
        printStyle: 'PLAIN_NO_PRINT',
        teamName: 'حجز هودي سادة',
        totalPrice: pricing.totalPrice,
        itemCount: form.quantity,
        payment: verifiedPayment,
        createdAt: new Date().toISOString(),
        status: 'confirmed',
      });
    } catch (err) {
      console.error('Plain hoodie submission error:', err);
      setErrorMessage('حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="plain-order-section" className="relative scroll-mt-20 py-12 md:py-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>حجز الهودي السادة الرسمي • دفعة نظم المعلومات BIS 2027</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            سجّل طلب الهودي السادة وأكد سداد العربون
          </h2>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div><p className="font-semibold">{errorMessage}</p></div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-[#1E293B] border border-indigo-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-700/70">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>بيانات حجز الهودي السادة</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {PLAIN_HOODIE_PRICE_EGP} ج.م للقطعة • بدون طباعة
              </span>
            </h3>
            <button
              type="button"
              onClick={onOpenSizeGuide}
              className="text-xs text-indigo-400 hover:underline flex items-center gap-1 font-medium bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>جدول المقاسات</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">الاسم ثلاثي أو رباعي <span className="text-red-400">*</span></label>
              <input
                type="text"
                required
                placeholder="مثال: أحمد محمد علي حسن"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">رقم الواتساب للتأكيد والاستلام <span className="text-red-400">*</span></label>
              <input
                type="tel"
                required
                dir="ltr"
                placeholder="01012345678"
                value={form.whatsApp}
                onChange={(e) => setForm({ ...form, whatsApp: e.target.value })}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white text-left font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">الوزن التقريبي (كجم) <span className="text-red-400">*</span></label>
              <input
                type="number"
                required
                min="40"
                max="160"
                placeholder="مثال: 75"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">عدد القطع</label>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-900/90 border border-slate-700 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => {
                      const newQ = Math.max(1, form.quantity - 1);
                      const newTotal = newQ * PLAIN_HOODIE_PRICE_EGP;
                      const newDeposit = Math.ceil(newTotal * 0.5);
                      setForm({
                        ...form,
                        quantity: newQ,
                        payment: { ...form.payment, amountPaid: newDeposit, remainingAmount: newTotal - newDeposit }
                      });
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-white font-bold cursor-pointer"
                  >-</button>
                  <span className="w-12 text-center font-mono font-bold text-white text-base">{form.quantity}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const newQ = Math.min(10, form.quantity + 1);
                      const newTotal = newQ * PLAIN_HOODIE_PRICE_EGP;
                      const newDeposit = Math.ceil(newTotal * 0.5);
                      setForm({
                        ...form,
                        quantity: newQ,
                        payment: { ...form.payment, amountPaid: newDeposit, remainingAmount: newTotal - newDeposit }
                      });
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-white font-bold cursor-pointer"
                  >+</button>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-300 mb-2">المقاس المطلوب <span className="text-red-400">*</span></label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setForm({ ...form, size: sz })}
                  className={`py-3 px-3 rounded-xl border text-sm font-bold transition-all text-center cursor-pointer ${
                    form.size === sz ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300' : 'border-slate-700 bg-slate-900/60 text-slate-300'
                  }`}
                >{sz}</button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-300 mb-2">ملاحظات إضافية أو اللون المفضل (اختياري)</label>
            <input
              type="text"
              placeholder="مثال: لون أسود مفضل إن وجد"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-indigo-500/40 shadow-xl">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">بيانات سداد العربون (الحد الأدنى 50% أي {pricing.minDepositRequired} ج.م)</h4>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">فودافون كاش المعتمد:</span>
                  <span className="text-sm font-mono font-bold text-white" dir="ltr">{OFFICIAL_PAYMENT_ACCOUNTS.vodafoneCash.number}</span>
                </div>
                <button type="button" onClick={() => handleCopyAccount(OFFICIAL_PAYMENT_ACCOUNTS.vodafoneCash.number, 'voda')} className="p-2 bg-slate-800 text-indigo-400 text-xs cursor-pointer">
                  {copiedAccount === 'voda' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">إنستاباي المعتمد:</span>
                  <span className="text-xs font-mono font-bold text-white" dir="ltr">{OFFICIAL_PAYMENT_ACCOUNTS.instaPay.address}</span>
                </div>
                <button type="button" onClick={() => handleCopyAccount(OFFICIAL_PAYMENT_ACCOUNTS.instaPay.address, 'insta')} className="p-2 bg-slate-800 text-indigo-400 text-xs cursor-pointer">
                  {copiedAccount === 'insta' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-2">طريقة الدفع المستخدمة <span className="text-red-400">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectPaymentMethod('vodafone_cash')}
                  className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                    form.payment.method === 'vodafone_cash' ? 'border-red-500 bg-red-500/10 text-red-300' : 'border-slate-700 bg-slate-900/60 text-slate-400'
                  }`}
                >فودافون كاش</button>

                <button
                  type="button"
                  onClick={() => handleSelectPaymentMethod('instapay')}
                  className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                    form.payment.method === 'instapay' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-slate-700 bg-slate-900/60 text-slate-400'
                  }`}
                >إنستاباي</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">المبلغ المحول كعربون (لا يقل عن 50%) <span className="text-red-400">*</span></label>
                <input
                  type="number"
                  required
                  min={pricing.minDepositRequired}
                  max={pricing.totalPrice}
                  value={form.payment.amountPaid}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setForm({
                      ...form,
                      payment: { ...form.payment, amountPaid: val, remainingAmount: Math.max(0, pricing.totalPrice - val) }
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">المتبقي عند الاستلام:</label>
                <div className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-amber-300">
                  {pricing.totalPrice - form.payment.amountPaid} جنيه مصري
                </div>
              </div>
            </div>

            <div className="mb-4">
              {form.payment.method === 'vodafone_cash' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">رقم فودافون كاش المُحول منه <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 01098765432"
                    value={form.payment.senderAccountOrPhone}
                    onChange={(e) => setForm({
                      ...form,
                      payment: { ...form.payment, senderAccountOrPhone: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">الرقم المرجعي للعملية (Ref No) <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 202711019948271"
                    value={form.payment.transactionRef}
                    onChange={(e) => setForm({
                      ...form,
                      payment: { ...form.payment, transactionRef: e.target.value }
                    })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono"
                  />
                </div>
              )}
            </div>

            {/* السعر الإجمالي تحت خانة رقم المرسل منه */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-white">
              <span className="text-xs font-bold text-indigo-400">إجمالي قيمة طلب الهودي السادة:</span>
              <span className="text-base font-extrabold font-mono text-emerald-400">{pricing.totalPrice} جنيه مصري</span>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-extrabold text-base shadow-lg cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جارٍ تأكيد حجز الهودي السادة وإصدار الكود...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>تأكيد حجز الهودي السادة وإصدار كود التتبع الفوري</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};