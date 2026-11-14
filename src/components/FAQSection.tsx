import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import {
  INDIVIDUAL_PRICE_EGP,
  TEAM_PRICE_EGP,
  MIN_TEAM_MEMBERS,
} from '../utils/tracking';

interface FAQItem {
  q: string;
  a: string;
}

const indDeposit = Math.ceil(INDIVIDUAL_PRICE_EGP * 0.5);
const teamSaving = INDIVIDUAL_PRICE_EGP - TEAM_PRICE_EGP;

const FAQS: FAQItem[] = [
  {
    q: 'لماذا يُشترط سداد عربون 50% على الأقل لتأكيد الحجز؟',
    a: `لأن الهودي يُصنع ويُطبع خصيصاً لكل طالب وفقاً لمقاسه ووزنه المختار. سداد العربون (${indDeposit} ج.م للفردي أو 50% للتيم) هو الضمان الفعلي لجدية الحجز لتوريد الأقمشة والطباعة، ولا يتم تسجيل الطلب رسمياً في كشوفات جوجل إلا بعد التحقق من سداد العربون.`,
  },
  {
    q: 'ما هي طرق الدفع المتاحة لسداد العربون؟',
    a: 'يمكنك التحويل عبر فودافون كاش على الرقم الرسمي المعتمد (01032964194) أو عبر تطبيق إنستاباي على المعرف (abdullsattarmohamed@instapay)، مع إدخال بيانات التحويل للتوثيق الفوري.',
  },
  {
    q: 'متى سيتم تسليم الهوديز رسمياً؟',
    a: 'سيتم التسليم فور اكتمال دورة تصنيع القماش وطباعة DTF عالية الدقة في مقر معهد السلاب. سيتم إرسال إشعار عبر واتساب وتحديد جدول مواعيد منظم وفقاً لكود التتبع التسلسلي الخاص بك.',
  },
  {
    q: 'ما هي مواصفات ومناطق الطباعة المعتمدة؟',
    a: 'الطباعة بتقنية DTF فاخرة عالية الكثافة والدقة، ومطبوعة على الوجه والظهر (وش وظهر) فقط بدون طباعة على الأكمام، لضمان أعلى متانة وثبات ألوان.',
  },
  {
    q: 'ما هو كود التتبع التسلسلي الرسمي (Tracking ID)؟',
    a: 'هو كود تسلسلي فريد يتم توليده تلقائياً فور توثيق الدفع والحجز (يبدأ بـ BIS للطلبات الفردية وبـ BIS-TEAM لطلبات التيم) ويُطلب منك إبرازه مع بيانات التحويل عند استلام الهودي بالمعهد.',
  },
  {
    q: `كيف يعمل خصم التيم (${TEAM_PRICE_EGP} ج.م بدلاً من ${INDIVIDUAL_PRICE_EGP} ج.م)؟`,
    a: `عند تسجيل ${MIN_TEAM_MEMBERS} أعضاء أو أكثر في استمارة "طلب تيم"، يتم تطبيق خصم ${teamSaving} ج.م فوراً على كل قطعة، ويحصل الفريق على كود تيم تسلسلي موحد مع تسجيل وزن ومقاس كل عضو.`,
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="features" className="py-16 md:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-[#38BDF8] text-xs font-bold mb-3 border border-sky-500/20">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>الأسئلة الشائعة وتفاصيل الاستلام</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          كل ما تحتاج معرفته عن حجز الهودي وسداد العربون
        </h2>
      </div>

      <div className="space-y-3">
        {FAQS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-right hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <span className="text-sm sm:text-base font-bold text-white">
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#38BDF8] shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};