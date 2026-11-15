import React from 'react';
import { MapPin, MessageCircle } from 'lucide-react';

interface FooterProps {
  onOpenSizeGuide: () => void;
  onOpenOrderLookup: () => void;
  onScrollToOrder: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenSizeGuide,
  onOpenOrderLookup,
  onScrollToOrder,
}) => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800/80 text-right">
          
          {/* Col 1: About */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-[#38BDF8] text-slate-950 font-black text-[10px] flex items-center justify-center">
                IS
              </span>
              <span className="font-bold text-white text-sm">
                دفعة نظم المعلومات ٢٠٢٧
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              مشروع هودي التخرج الرسمي الموحد لطلاب قسم نظم المعلومات الإدارية .
            </p>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
              <span>مقر معهد السلاب - المنصورة / الطريق الدائري</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs mb-3">روابط سريعة</h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button 
                  onClick={onScrollToOrder}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  تسجيل طلب جديد
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenSizeGuide}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  دليل المقاسات المعتمد
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenOrderLookup}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  الاستعلام وتتبع كود الحجز
                </button>
              </li>
              <li>
                <a href="#specs" className="hover:text-white transition-colors">
                  مواصفات القماش والطباعة سلك اسكرين
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Pricing Policies */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-xs mb-3">سياسة الحجز والاستلام</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li>• الطلب الفردي: 675 ج.م للقطعة</li>
              <li>• طلب التيم (5+ أفراد): 640 ج.م للقطعة</li>
              <li>• طباعة DTF اسكرين وش وظهر </li>
              <li>• الاستلام بمقر المعهد بواسطة كود التتبع التسلسلي</li>
            </ul>
          </div>

          {/* Col 4: Support */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs mb-3">الدعم والاستفسارات</h4>
            <p className="text-[11px] text-slate-400">
              إذا واجهتك أي مشكلة أثناء التسجيل أو أردت تعديل بيانات طلبك، تواصل فوراً مع منسقي الدفعة:
            </p>
            <a
              href="https://wa.me/201223589211?text=%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D9%87%D9%88%D8%AF%D9%8A%20%D9%86%D8%B8%D9%85%20%D8%A7%D9%84%D9%85%D8%B9%D9%84%D9%88%D9%85%D8%A7%D8%AA"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 hover:border-emerald-500/50 transition-colors text-xs font-semibold cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>(01223589211)</span>
            </a>
            <a
              href="https://wa.me/201097306587?text=%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D9%87%D9%88%D8%AF%D9%8A%20%D9%86%D8%B8%D9%85%20%D8%A7%D9%84%D9%85%D8%B9%D9%84%D9%88%D9%85%D8%A7%D8%AA"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 hover:border-emerald-500/50 transition-colors text-xs font-semibold cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>(01097306587)</span>
            </a>
            <a
              href="https://wa.me/201092644741?text=%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%A8%D8%AE%D8%B5%D9%88%D8%B5%20%D9%87%D9%88%D8%AF%D9%8A%20%D9%86%D8%B8%D9%85%20%D8%A7%D9%84%D9%85%D8%B9%D9%84%D9%88%D9%85%D8%A7%D8%AA"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 hover:border-emerald-500/50 transition-colors text-xs font-semibold cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span> (01092644741)</span>
            </a>
          </div>
        </div>

        

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <span>
            © 2027 قسم نظم المعلومات الإدارية - معهد السلاب. جميع الحقوق محفوظة.
          </span>
          <div className="flex items-center gap-1">
            <span>صُمم بكل فخر لدفعة تخرج ٢٠٢٧</span>
            <span className="text-[#38BDF8]">IS Seniors</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
