import React from 'react';
import { Layers, Feather, ShieldCheck, Sparkles, Award, Eye } from 'lucide-react';
import frontHoodieImg from '../assets/images/front.jpeg';
import backHoodieImg from '../assets/images/back.jpeg';

export const FabricSpecsSection: React.FC = () => {
  const specs = [
    {
      title: 'خامة قطنية 400 GSM فائقة الثقل',
      desc: 'نسيج ميلتون قطن طبيعي 100% يوفر دفئاً ممتازاً ووزناً فخماً مع بطانة وبرية داخلية فائقة النعومة ومريحة جداً.',
      icon: Layers,
    },
    {
      title: 'طباعة DTF عالية الكثافة (وش وظهر)',
      desc: 'تقنية طباعة DTF فائقة الدقة والوضوح؛ ألوان ثابتة ومجسمة بالكامل على الصدر والظهر مقاومة لتكرار الغسيل دون تشقق.',
      icon: Sparkles,
    },
    {
      title: 'قصّة أوفرسايز عصرية (Streetwear Fit)',
      desc: 'أكتاف ساقطة مريحة وتصميم فضفاض يلائم الجميع مع خياطة مزدوجة معززة عند الياقة والأكمام.',
      icon: Feather,
    },
    {
      title: 'معالجة ضد الانكماش والوبر (Anti-Pilling)',
      desc: 'أقمشة معالجة مسبقاً وتثبيت صبغات حراري يضمن بقاء اللون زاهياً وناعماً بعد شهور من الارتداء.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section id="specs" className="py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Images Grid Showcase: Front View Card and Back View Card */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {/* Front View Card */}
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-sky-500/30 bg-slate-900/90 shadow-xl group">
                <img
                  src={frontHoodieImg}
                  alt="التصميم الأمامي لهودي نظم المعلومات 2027 (Front View)"
                  className="w-full h-56 sm:h-64 object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-3 bg-slate-900/95 text-right border-t border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-[#38BDF8]">
                      التصميم الأمامي (Front View)
                    </span>
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    طباعة DTF فاخرة لشعار IS 2027 على الصدر
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-right">
                <div className="flex items-center gap-2 text-xs font-bold text-[#38BDF8] mb-1">
                  <Award className="w-4 h-4 text-[#F59E0B]" />
                  <span>معتمد من لجنة تخرج نظم المعلومات</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  تم اعتماد خامات الميلتون وطباعة DTF لضمان أقصى درجات الثبات والفخامة.
                </p>
              </div>
            </div>

            {/* Back View Card */}
            <div className="space-y-4 pt-6">
              <div className="rounded-2xl overflow-hidden border border-amber-500/30 bg-slate-900/90 shadow-xl group">
                <img
                  src={backHoodieImg}
                  alt="التصميم الخلفي لهودي نظم المعلومات 2027 (Back View)"
                  className="w-full h-72 sm:h-80 object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-3 bg-slate-900/95 text-right border-t border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-[#F59E0B]">
                      التصميم الخلفي (Back View)
                    </span>
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    جرافيك مسارات الدوائر المتكاملة بطباعة DTF عالية الدقة
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Specs List */}
          <div className="lg:col-span-6 space-y-6 text-right">
            <div>
              <span className="text-xs font-bold text-[#38BDF8] tracking-wider uppercase block mb-2">
                FABRIC & DTF PRINTING SPECIFICATIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                خامة راقية وطباعة DTF وش وظهر تدوم طويلاً
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                تم اعتماد تقنية طباعة DTF على الوجه والظهر (وش وظهر) لإبراز تفاصيل الهوية التقنية بدقة فائقة مع نسيج قطني ثقيل 400 GSM لمظهر شتوي استثنائي.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {specs.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 text-right hover:border-slate-700 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-[#38BDF8] mb-3">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};