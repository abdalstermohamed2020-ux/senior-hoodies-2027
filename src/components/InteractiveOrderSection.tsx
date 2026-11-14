import React, { useState } from 'react';
import {
  Users,
  User,
  Sparkles,
  Check,
  Plus,
  Trash2,
  HelpCircle,
  Loader2,
  AlertCircle,
  CreditCard,
  Send,
  Shirt,
  X,
  ZoomIn,
  MessageCircle,
} from 'lucide-react';
import {
  HoodieSize,
  OrderType,
  IndividualFormData,
  TeamFormData,
  TeamMember,
  StoredOrder,
  PaymentDetails,
  PaymentMethod,
} from '../types';
import {
  INDIVIDUAL_PRICE_EGP,
  TEAM_PRICE_EGP,
  PLAIN_HOODIE_PRICE_EGP,
  MIN_TEAM_MEMBERS,
  OFFICIAL_PAYMENT_ACCOUNTS,
  generateIndividualTrackingId,
  generateTeamTrackingId,
  generatePlainHoodieTrackingId,
  calculateIndividualPrice,
  calculateTeamPrice,
  calculatePlainHoodiePrice,
  validateAdvancePayment,
  sendOrderToGoogleSheet,
  validatePhone,
} from '../utils/tracking';

import imgBlack from '../colors/1.jpeg';
import imgOffWhite from '../colors/2.jpeg';
import imgBurgundy from '../colors/3.jpeg';
import imgBrown from '../colors/4.jpeg';
import imgBabyBlue from '../colors/5.jpeg';
import imgPink from '../colors/6.jpeg';
import imgPetrol from '../colors/7.jpeg';
import imgBeige from '../colors/8.jpeg';
import imgLightGray from '../colors/9.jpeg';
import imgCharcoal from '../colors/10.jpeg';
import imgIndigoBlue from '../colors/11.jpeg';

const SIZES: HoodieSize[] = ['M', 'L', 'XL', 'XXL'];

export interface PlainHoodieColorOption {
  id: string;
  name: string;
  hex: string;
  isLight?: boolean;
  image: string;
}

const PLAIN_HOODIE_COLORS: PlainHoodieColorOption[] = [
  { id: 'black', name: 'أسود', hex: '#18181B', image: imgBlack },
  { id: 'off_white', name: 'أوف وايت', hex: '#EAE5D9', isLight: true, image: imgOffWhite },
  { id: 'burgundy', name: 'نبيتي', hex: '#4A1525', image: imgBurgundy },
  { id: 'brown', name: 'بني', hex: '#3E2723', image: imgBrown },
  { id: 'baby_blue', name: 'بيبي بلو', hex: '#A7C7E7', isLight: true, image: imgBabyBlue },
  { id: 'pink', name: 'بينك', hex: '#F4C2D7', isLight: true, image: imgPink },
  { id: 'petrol', name: 'بترولي', hex: '#1E4345', image: imgPetrol },
  { id: 'beige', name: 'بيج', hex: '#D5C5AE', isLight: true, image: imgBeige },
  { id: 'light_gray', name: 'رمادي فاتح', hex: '#C5C8CC', isLight: true, image: imgLightGray },
  { id: 'charcoal', name: 'رمادي غامق', hex: '#363A3D', image: imgCharcoal },
  { id: 'indigo_blue', name: 'أزرق نيلي', hex: '#1B527A', image: imgIndigoBlue },
];

interface InteractiveOrderSectionProps {
  onOrderSuccess: (order: StoredOrder) => void;
  onOpenSizeGuide: () => void;
}

export const InteractiveOrderSection: React.FC<InteractiveOrderSectionProps> = ({
  onOrderSuccess,
  onOpenSizeGuide,
}) => {
  const [activeTab, setActiveTab] = useState<OrderType>('individual');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);
  const [pendingConfirmType, setPendingConfirmType] = useState<'individual' | 'team' | 'plain' | null>(null);

  const initialIndDeposit = Math.ceil(INDIVIDUAL_PRICE_EGP * 0.5);
  const [individualForm, setIndividualForm] = useState<IndividualFormData>({
    fullName: '',
    nameOnHoodie: '',
    whatsApp: '',
    weightKg: '',
    size: 'L',
    quantity: 1,
    payment: {
      method: 'vodafone_cash',
      amountPaid: initialIndDeposit,
      senderAccountOrPhone: '',
      transactionRef: '',
      receiptPreviewUrl: '',
      paidPercentage: 50,
      remainingAmount: INDIVIDUAL_PRICE_EGP - initialIndDeposit,
      isVerified: true,
    },
  });

  const initialTeamTotal = TEAM_PRICE_EGP * MIN_TEAM_MEMBERS;
  const initialTeamDeposit = Math.ceil(initialTeamTotal * 0.5);
  const [teamForm, setTeamForm] = useState<TeamFormData>({
    teamName: '',
    leaderName: '',
    leaderWhatsApp: '',
    members: [
      { id: '1', fullName: '', nameOnHoodie: '', weightKg: '', size: 'L' },
      { id: '2', fullName: '', nameOnHoodie: '', weightKg: '', size: 'XL' },
      { id: '3', fullName: '', nameOnHoodie: '', weightKg: '', size: 'M' },
      { id: '4', fullName: '', nameOnHoodie: '', weightKg: '', size: 'L' },
      { id: '5', fullName: '', nameOnHoodie: '', weightKg: '', size: 'XL' },
    ],
    payment: {
      method: 'vodafone_cash',
      amountPaid: initialTeamDeposit,
      senderAccountOrPhone: '',
      transactionRef: '',
      receiptPreviewUrl: '',
      paidPercentage: 50,
      remainingAmount: initialTeamTotal - initialTeamDeposit,
      isVerified: true,
    },
  });

  const initialPlainDeposit = Math.ceil(PLAIN_HOODIE_PRICE_EGP * 0.5);
  const [plainForm, setPlainForm] = useState({
    fullName: '',
    whatsApp: '',
    weightKg: '',
    size: 'L' as HoodieSize,
    quantity: 1,
    selectedColorId: PLAIN_HOODIE_COLORS[0].id,
    payment: {
      method: 'vodafone_cash' as PaymentMethod,
      amountPaid: initialPlainDeposit,
      senderAccountOrPhone: '',
      transactionRef: '',
      receiptPreviewUrl: '',
      paidPercentage: 50,
      remainingAmount: PLAIN_HOODIE_PRICE_EGP - initialPlainDeposit,
      isVerified: true,
    },
  });

  const indPricing = calculateIndividualPrice(individualForm.quantity);
  const teamPricing = calculateTeamPrice(teamForm.members.length);
  const plainPricing = calculatePlainHoodiePrice(plainForm.quantity);

  const selectedColorIndex = Math.max(
    0,
    PLAIN_HOODIE_COLORS.findIndex((c) => c.id === plainForm.selectedColorId)
  );
  const selectedPlainColor = PLAIN_HOODIE_COLORS[selectedColorIndex];

  const handleCopyAccount = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleSelectPaymentMethod = (
    newMethod: PaymentMethod,
    type: 'individual' | 'team' | 'plain'
  ) => {
    if (type === 'team') {
      setTeamForm((prev) => ({
        ...prev,
        payment: {
          ...prev.payment,
          method: newMethod,
          senderAccountOrPhone: '',
          transactionRef: '',
        },
      }));
    } else if (type === 'plain') {
      setPlainForm((prev) => ({
        ...prev,
        payment: {
          ...prev.payment,
          method: newMethod,
          senderAccountOrPhone: '',
          transactionRef: '',
        },
      }));
    } else {
      setIndividualForm((prev) => ({
        ...prev,
        payment: {
          ...prev.payment,
          method: newMethod,
          senderAccountOrPhone: '',
          transactionRef: '',
        },
      }));
    }
  };

  const handleAddMember = () => {
    const newMemberId =
      (teamForm.members.length + 1).toString() + '-' + Date.now().toString().slice(-4);
    const newMembers = [
      ...teamForm.members,
      { id: newMemberId, fullName: '', nameOnHoodie: '', weightKg: '', size: 'L' as HoodieSize },
    ];
    const newPricing = calculateTeamPrice(newMembers.length);
    const newDeposit = Math.ceil(newPricing.totalPrice * 0.5);
    setTeamForm((prev) => ({
      ...prev,
      members: newMembers,
      payment: {
        ...prev.payment,
        amountPaid: newDeposit,
        remainingAmount: newPricing.totalPrice - newDeposit,
      },
    }));
  };

  const handleRemoveMember = (indexToRemove: number) => {
    if (teamForm.members.length <= MIN_TEAM_MEMBERS) {
      setErrorMessage(`طلب التيم يتطلب على الأقل ${MIN_TEAM_MEMBERS} أعضاء.`);
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }
    const newMembers = teamForm.members.filter((_, idx) => idx !== indexToRemove);
    const newPricing = calculateTeamPrice(newMembers.length);
    const newDeposit = Math.ceil(newPricing.totalPrice * 0.5);
    setTeamForm((prev) => ({
      ...prev,
      members: newMembers,
      payment: {
        ...prev.payment,
        amountPaid: newDeposit,
        remainingAmount: newPricing.totalPrice - newDeposit,
      },
    }));
  };

  const handleUpdateMember = (index: number, field: keyof TeamMember, value: string) => {
    setTeamForm((prev) => {
      const updated = [...prev.members];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, members: updated };
    });
  };

  // 1. التحقق ثم فتح رسالة التذكير للطلب الفردي
  const handleIndividualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!individualForm.fullName.trim() || individualForm.fullName.trim().split(' ').length < 2) {
      setErrorMessage('يرجى كتابة الاسم ثلاثي أو رباعي بالكامل');
      return;
    }
    if (!individualForm.nameOnHoodie.trim()) {
      setErrorMessage('يرجى كتابة الاسم المراد طباعته على الهودي');
      return;
    }
    if (!validatePhone(individualForm.whatsApp)) {
      setErrorMessage('يرجى كتابة رقم واتساب مصري صحيح (مثال: 01012345678)');
      return;
    }
    if (!individualForm.weightKg.trim()) {
      setErrorMessage('يرجى إدخال الوزن التقريبي بالكيلوجرام');
      return;
    }

    const minAllowedDeposit = Math.ceil(indPricing.totalPrice * 0.5);
    if (individualForm.payment.amountPaid < minAllowedDeposit) {
      setErrorMessage(
        `عربون الحجز لا يمكن أن يقل عن نصف المبلغ الإجمالي (${minAllowedDeposit} جنيه مصري).`
      );
      return;
    }

    const validation = validateAdvancePayment(individualForm.payment, indPricing.totalPrice);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'يرجى مراجعة بيانات سداد العربون بدقة.');
      return;
    }

    setPendingConfirmType('individual');
  };

  const executeIndividualSubmit = async () => {
    setPendingConfirmType(null);
    setIsSubmitting(true);
    try {
      const trackingId = generateIndividualTrackingId();
      const remainingAmount = indPricing.totalPrice - individualForm.payment.amountPaid;
      const verifiedPayment: PaymentDetails = {
        ...individualForm.payment,
        remainingAmount,
        isVerified: true,
      };

      const formattedDate = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });
      const instapayRef =
        individualForm.payment.method === 'instapay'
          ? individualForm.payment.transactionRef.trim()
          : 'غير متاح';
      const vfcashSender =
        individualForm.payment.method === 'vodafone_cash'
          ? individualForm.payment.senderAccountOrPhone.trim()
          : 'غير متاح';

      await sendOrderToGoogleSheet(
        {
          timestamp: formattedDate,
          trackingId,
          orderType: 'individual',
          fullName: individualForm.fullName.trim(),
          nameOnHoodie: individualForm.nameOnHoodie.trim(),
          whatsApp: individualForm.whatsApp.trim(),
          size: individualForm.size,
          weight: individualForm.weightKg.trim() + ' كجم',
          quantity: individualForm.quantity,
          paidAmount: individualForm.payment.amountPaid,
          totalPrice: indPricing.totalPrice,
          instapayRef,
          vfcashSender,
          row: [
            formattedDate,
            trackingId,
            'individual',
            individualForm.fullName.trim(),
            individualForm.nameOnHoodie.trim(),
            individualForm.whatsApp.trim(),
            individualForm.size,
            individualForm.weightKg.trim() + ' كجم',
            individualForm.quantity,
            individualForm.payment.amountPaid,
            indPricing.totalPrice,
            instapayRef,
            vfcashSender,
            'إدخال يدوي مؤكد',
          ],
        },
        verifiedPayment
      );

      onOrderSuccess({
        trackingId,
        orderType: 'individual',
        fullName: individualForm.fullName.trim(),
        nameOnHoodie: individualForm.nameOnHoodie.trim(),
        whatsApp: individualForm.whatsApp.trim(),
        weightKg: individualForm.weightKg.trim() + ' كجم',
        size: individualForm.size,
        printStyle: 'DTF_FRONT_BACK',
        teamName: 'طلب فردي',
        totalPrice: indPricing.totalPrice,
        itemCount: individualForm.quantity,
        payment: verifiedPayment,
        createdAt: new Date().toISOString(),
        status: 'confirmed',
      });
    } catch (err) {
      setErrorMessage('حدث خطأ أثناء حفظ الطلب، يرجى التأكد من الإنترنت والمحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. التحقق ثم فتح رسالة التذكير لطلب التيم
  const handleTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!teamForm.leaderName.trim()) {
      setErrorMessage('يرجى كتابة اسم قائد الفريق');
      return;
    }
    if (!validatePhone(teamForm.leaderWhatsApp)) {
      setErrorMessage('يرجى كتابة رقم واتساب قائد الفريق بشكل صحيح');
      return;
    }
    if (teamForm.members.length < MIN_TEAM_MEMBERS) {
      setErrorMessage(`طلب التيم يتطلب ${MIN_TEAM_MEMBERS} أعضاء على الأقل.`);
      return;
    }

    for (let i = 0; i < teamForm.members.length; i++) {
      const m = teamForm.members[i];
      if (!m.fullName.trim() || !m.weightKg.trim()) {
        setErrorMessage(`يرجى استكمال اسم ووزن العضو رقم (${i + 1})`);
        return;
      }
    }

    const minAllowedDeposit = Math.ceil(teamPricing.totalPrice * 0.5);
    if (teamForm.payment.amountPaid < minAllowedDeposit) {
      setErrorMessage(
        `عربون حجز التيم لا يمكن أن يقل عن نصف المبلغ الإجمالي (${minAllowedDeposit} جنيه مصري).`
      );
      return;
    }

    const validation = validateAdvancePayment(teamForm.payment, teamPricing.totalPrice);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'يرجى مراجعة بيانات تحويل عربون التيم بدقة.');
      return;
    }

    setPendingConfirmType('team');
  };

  const executeTeamSubmit = async () => {
    setPendingConfirmType(null);
    setIsSubmitting(true);
    try {
      const trackingId = generateTeamTrackingId();
      const remainingAmount = teamPricing.totalPrice - teamForm.payment.amountPaid;
      const verifiedPayment: PaymentDetails = {
        ...teamForm.payment,
        remainingAmount,
        isVerified: true,
      };

      const sizesSummary = teamForm.members
        .map((m, i) => `#${i + 1}: ${m.fullName} (${m.size} - ${m.weightKg} كجم)`)
        .join(' | ');
      const formattedDate = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });
      const teamWeightsSummary = teamForm.members
        .map((m) => `${m.fullName}: ${m.weightKg} كجم`)
        .join(' | ');
      const instapayRef =
        teamForm.payment.method === 'instapay'
          ? teamForm.payment.transactionRef.trim()
          : 'غير متاح';
      const vfcashSender =
        teamForm.payment.method === 'vodafone_cash'
          ? teamForm.payment.senderAccountOrPhone.trim()
          : 'غير متاح';

      const leaderDisplayName = `${teamForm.leaderName.trim()} (ليدر الفريق)`;
      const teamDisplayName = teamForm.teamName?.trim() || `تيم ${teamForm.leaderName.trim()}`;
      const teamHoodieNames = teamForm.members
        .map((m, i) => `#${i + 1}: ${m.nameOnHoodie?.trim() || m.fullName.trim()}`)
        .join(' | ');

      await sendOrderToGoogleSheet(
        {
          timestamp: formattedDate,
          trackingId,
          orderType: 'team',
          fullName: leaderDisplayName,
          nameOnHoodie: teamHoodieNames,
          whatsApp: teamForm.leaderWhatsApp.trim(),
          size: sizesSummary,
          weight: teamWeightsSummary,
          quantity: teamForm.members.length,
          paidAmount: teamForm.payment.amountPaid,
          totalPrice: teamPricing.totalPrice,
          instapayRef,
          vfcashSender,
          row: [
            formattedDate,
            trackingId,
            'team',
            leaderDisplayName,
            teamHoodieNames,
            teamForm.leaderWhatsApp.trim(),
            sizesSummary,
            teamWeightsSummary,
            teamForm.members.length,
            teamForm.payment.amountPaid,
            teamPricing.totalPrice,
            instapayRef,
            vfcashSender,
            'إدخال يدوي مؤكد',
          ],
        },
        verifiedPayment
      );

      onOrderSuccess({
        trackingId,
        orderType: 'team',
        fullName: teamForm.leaderName.trim(),
        nameOnHoodie: teamHoodieNames,
        whatsApp: teamForm.leaderWhatsApp.trim(),
        weightKg: 'أوزان متعددة',
        size: `${teamForm.members.length} قطع متنوعة`,
        printStyle: 'DTF_FRONT_BACK',
        teamName: teamDisplayName,
        totalPrice: teamPricing.totalPrice,
        itemCount: teamForm.members.length,
        payment: verifiedPayment,
        details: { teamLeaderName: teamForm.leaderName.trim(), members: teamForm.members },
        createdAt: new Date().toISOString(),
        status: 'confirmed',
      });
    } catch (err) {
      setErrorMessage('حدث خطأ أثناء حفظ الطلب، يرجى التأكد من الإنترنت والمحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. التحقق ثم فتح رسالة التذكير للهودي السادة
  const handlePlainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!plainForm.fullName.trim() || plainForm.fullName.trim().split(' ').length < 2) {
      setErrorMessage('يرجى كتابة الاسم ثلاثي أو رباعي بالكامل');
      return;
    }
    if (!validatePhone(plainForm.whatsApp)) {
      setErrorMessage('يرجى كتابة رقم واتساب مصري صحيح (مثال: 01012345678)');
      return;
    }
    if (!plainForm.weightKg.trim()) {
      setErrorMessage('يرجى إدخال الوزن التقريبي بالكيلوجرام');
      return;
    }

    const minAllowedDeposit = Math.ceil(plainPricing.totalPrice * 0.5);
    if (plainForm.payment.amountPaid < minAllowedDeposit) {
      setErrorMessage(
        `عربون الحجز لا يمكن أن يقل عن نصف المبلغ الإجمالي (${minAllowedDeposit} جنيه مصري).`
      );
      return;
    }

    const validation = validateAdvancePayment(plainForm.payment, plainPricing.totalPrice);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'يرجى مراجعة بيانات سداد العربون بدقة.');
      return;
    }

    setPendingConfirmType('plain');
  };

  const executePlainSubmit = async () => {
    setPendingConfirmType(null);
    setIsSubmitting(true);
    try {
      const trackingId = generatePlainHoodieTrackingId();
      const remainingAmount = plainPricing.totalPrice - plainForm.payment.amountPaid;
      const verifiedPayment: PaymentDetails = {
        ...plainForm.payment,
        remainingAmount,
        isVerified: true,
      };

      const formattedDate = new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' });
      const instapayRef =
        plainForm.payment.method === 'instapay'
          ? plainForm.payment.transactionRef.trim()
          : 'غير متاح';
      const vfcashSender =
        plainForm.payment.method === 'vodafone_cash'
          ? plainForm.payment.senderAccountOrPhone.trim()
          : 'غير متاح';
      const chosenColorNote = `اللون: ${selectedPlainColor.name}`;

      await sendOrderToGoogleSheet(
        {
          timestamp: formattedDate,
          trackingId,
          orderType: 'plain_hoodie',
          fullName: plainForm.fullName.trim(),
          nameOnHoodie: `هودي سادة (${selectedPlainColor.name})`,
          whatsApp: plainForm.whatsApp.trim(),
          size: plainForm.size,
          weight: plainForm.weightKg.trim() + ' كجم',
          quantity: plainForm.quantity,
          paidAmount: plainForm.payment.amountPaid,
          totalPrice: plainPricing.totalPrice,
          instapayRef,
          vfcashSender,
          row: [
            formattedDate,
            trackingId,
            'plain_hoodie',
            plainForm.fullName.trim(),
            plainForm.whatsApp.trim(),
            plainForm.size,
            plainForm.weightKg.trim() + ' كجم',
            plainForm.quantity,
            plainForm.payment.amountPaid,
            plainPricing.totalPrice,
            instapayRef,
            vfcashSender,
            chosenColorNote,
          ],
        },
        verifiedPayment
      );

      onOrderSuccess({
        trackingId,
        orderType: 'individual',
        fullName: plainForm.fullName.trim(),
        nameOnHoodie: `هودي سادة - لون ${selectedPlainColor.name}`,
        whatsApp: plainForm.whatsApp.trim(),
        weightKg: plainForm.weightKg.trim() + ' كجم',
        size: plainForm.size,
        printStyle: 'PLAIN_NO_PRINT',
        teamName: 'حجز هودي سادة',
        totalPrice: plainPricing.totalPrice,
        itemCount: plainForm.quantity,
        payment: verifiedPayment,
        createdAt: new Date().toISOString(),
        status: 'confirmed',
      });
    } catch (err) {
      setErrorMessage('حدث خطأ أثناء حفظ الطلب، يرجى التأكد من الإنترنت والمحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmPendingOrder = () => {
    if (pendingConfirmType === 'individual') executeIndividualSubmit();
    else if (pendingConfirmType === 'team') executeTeamSubmit();
    else if (pendingConfirmType === 'plain') executePlainSubmit();
  };

  return (
    <section id="order-section" className="relative scroll-mt-20 py-12 md:py-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-[#38BDF8] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>الحجز المسبق الرسمي • دفعة نظم المعلومات BIS 2027</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            سجّل طلبك وأكد بيانات تحويل العربون للحصول على كود التتبع الفوري
          </h2>
        </div>

        {/* التبويبات الثلاثة */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-700/80 max-w-2xl mx-auto mb-8 shadow-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('individual');
              setErrorMessage(null);
            }}
            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'individual'
                ? 'bg-[#38BDF8] text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>طلب فردي ({INDIVIDUAL_PRICE_EGP} ج)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('team');
              setErrorMessage(null);
            }}
            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'team'
                ? 'bg-[#F59E0B] text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>طلب تيم ({TEAM_PRICE_EGP} ج)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('plain_hoodie');
              setErrorMessage(null);
            }}
            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              activeTab === 'plain_hoodie'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shirt className="w-4 h-4 shrink-0" />
            <span>هودي سادة ({PLAIN_HOODIE_PRICE_EGP} ج)</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 1. نموذج الطلب الفردي                                                 */}
        {/* ===================================================================== */}
        {activeTab === 'individual' && (
          <form
            onSubmit={handleIndividualSubmit}
            className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-700/70">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                <span>بيانات الطلب الفردي</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-500/20 text-[#38BDF8] border border-sky-500/30">
                  {INDIVIDUAL_PRICE_EGP} ج.م للقطعة • طباعة DTF وش وظهر
                </span>
              </h3>
              <button
                type="button"
                onClick={onOpenSizeGuide}
                className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1 font-medium bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer shrink-0"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>جدول المقاسات</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  الاسم ثلاثي أو رباعي <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد محمد علي حسن"
                  value={individualForm.fullName}
                  onChange={(e) =>
                    setIndividualForm({ ...individualForm, fullName: e.target.value })
                  }
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  الاسم المراد طباعته على الهودي <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: AHMED HASSAN"
                  value={individualForm.nameOnHoodie}
                  onChange={(e) =>
                    setIndividualForm({ ...individualForm, nameOnHoodie: e.target.value })
                  }
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#38BDF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  رقم الواتساب للتأكيد والاستلام <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  placeholder="01012345678"
                  value={individualForm.whatsApp}
                  onChange={(e) =>
                    setIndividualForm({ ...individualForm, whatsApp: e.target.value })
                  }
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  الوزن التقريبي (كجم) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="40"
                  max="160"
                  placeholder="مثال: 75"
                  value={individualForm.weightKg}
                  onChange={(e) =>
                    setIndividualForm({ ...individualForm, weightKg: e.target.value })
                  }
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
                        const newQ = Math.max(1, individualForm.quantity - 1);
                        const newTotal = newQ * INDIVIDUAL_PRICE_EGP;
                        const newDeposit = Math.ceil(newTotal * 0.5);
                        setIndividualForm({
                          ...individualForm,
                          quantity: newQ,
                          payment: {
                            ...individualForm.payment,
                            amountPaid: newDeposit,
                            remainingAmount: newTotal - newDeposit,
                          },
                        });
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-white font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-mono font-bold text-white text-base">
                      {individualForm.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newQ = Math.min(10, individualForm.quantity + 1);
                        const newTotal = newQ * INDIVIDUAL_PRICE_EGP;
                        const newDeposit = Math.ceil(newTotal * 0.5);
                        setIndividualForm({
                          ...individualForm,
                          quantity: newQ,
                          payment: {
                            ...individualForm.payment,
                            amountPaid: newDeposit,
                            remainingAmount: newTotal - newDeposit,
                          },
                        });
                      }}
                      className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-white font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                المقاس المطلوب <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setIndividualForm({ ...individualForm, size: sz })}
                    className={`py-3 px-3 rounded-xl border text-sm font-bold transition-all text-center cursor-pointer ${
                      individualForm.size === sz
                        ? 'border-[#38BDF8] bg-sky-500/20 text-[#38BDF8]'
                        : 'border-slate-700 bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* بيانات سداد العربون للطلب الفردي */}
            <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-sky-500/40 shadow-xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#38BDF8]" />
                  <h4 className="text-sm font-bold text-white">
                    بيانات سداد العربون (الحد الأدنى 50% أي {indPricing.minDepositRequired} ج.م)
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">فودافون كاش المعتمد:</span>
                    <span className="text-sm font-mono font-bold text-white" dir="ltr">
                      {OFFICIAL_PAYMENT_ACCOUNTS.vodafoneCash.number}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyAccount(OFFICIAL_PAYMENT_ACCOUNTS.vodafoneCash.number, 'voda')
                    }
                    className="p-2 rounded-lg bg-slate-800 text-[#38BDF8] text-xs cursor-pointer"
                  >
                    {copiedAccount === 'voda' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      'نسخ'
                    )}
                  </button>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">إنستاباي المعتمد:</span>
                    <span className="text-xs font-mono font-bold text-white" dir="ltr">
                      {OFFICIAL_PAYMENT_ACCOUNTS.instaPay.address}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyAccount(OFFICIAL_PAYMENT_ACCOUNTS.instaPay.address, 'insta')
                    }
                    className="p-2 rounded-lg bg-slate-800 text-[#38BDF8] text-xs cursor-pointer"
                  >
                    {copiedAccount === 'insta' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      'نسخ'
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  طريقة الدفع المستخدمة <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectPaymentMethod('vodafone_cash', 'individual')}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      individualForm.payment.method === 'vodafone_cash'
                        ? 'border-red-500 bg-red-500/10 text-red-300'
                        : 'border-slate-700 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    فودافون كاش
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPaymentMethod('instapay', 'individual')}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      individualForm.payment.method === 'instapay'
                        ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                        : 'border-slate-700 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    إنستاباي
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    المبلغ المحول كعربون (لا يقل عن 50%) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={indPricing.minDepositRequired}
                    max={indPricing.totalPrice}
                    value={individualForm.payment.amountPaid}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setIndividualForm({
                        ...individualForm,
                        payment: {
                          ...individualForm.payment,
                          amountPaid: val,
                          remainingAmount: Math.max(0, indPricing.totalPrice - val),
                        },
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    المتبقي عند الاستلام:
                  </label>
                  <div className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-amber-300">
                    {indPricing.totalPrice - individualForm.payment.amountPaid} جنيه مصري
                  </div>
                </div>
              </div>

              <div>
                {individualForm.payment.method === 'vodafone_cash' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      رقم فودافون كاش المُحول منه <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      placeholder="01098765432"
                      value={individualForm.payment.senderAccountOrPhone}
                      onChange={(e) =>
                        setIndividualForm({
                          ...individualForm,
                          payment: {
                            ...individualForm.payment,
                            senderAccountOrPhone: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono text-left"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      الرقم المرجعي للتحويل (Ref No) في إنستاباي <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      placeholder="مثال: 431298765412"
                      value={individualForm.payment.transactionRef}
                      onChange={(e) =>
                        setIndividualForm({
                          ...individualForm,
                          payment: {
                            ...individualForm.payment,
                            transactionRef: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono text-left"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#38BDF8] to-sky-500 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-black text-base shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري تسجيل طلبك وتوليد كود التتبع...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>تأكيد حجز الطلب الفردي ({indPricing.totalPrice} ج.م)</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ===================================================================== */}
        {/* 2. نموذج طلب التيم                                                    */}
        {/* ===================================================================== */}
        {activeTab === 'team' && (
          <form
            onSubmit={handleTeamSubmit}
            className="bg-[#1E293B] border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-700/70">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                <span>بيانات طلب التيم (5 أعضاء فأكثر)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {TEAM_PRICE_EGP} ج.م / للقطعة • وفّر {teamPricing.discountAmount} ج.م
                </span>
              </h3>
              <button
                type="button"
                onClick={onOpenSizeGuide}
                className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1 font-medium bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer shrink-0"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>جدول المقاسات</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  اسم التيم / الشلة (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: BIS Legends"
                  value={teamForm.teamName}
                  onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  اسم قائد التيم (الليدر) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: محمود خالد"
                  value={teamForm.leaderName}
                  onChange={(e) => setTeamForm({ ...teamForm, leaderName: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  رقم واتساب الليدر <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  placeholder="01012345678"
                  value={teamForm.leaderWhatsApp}
                  onChange={(e) => setTeamForm({ ...teamForm, leaderWhatsApp: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white text-left font-mono"
                />
              </div>
            </div>

            {/* قائمة أعضاء التيم */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300">
                  بيانات أعضاء التيم ({teamForm.members.length} أعضاء)
                </span>
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة عضو جديد</span>
                </button>
              </div>

              {teamForm.members.map((member, index) => (
                <div
                  key={member.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
                >
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] text-slate-400 mb-1">
                      اسم العضو #{index + 1} <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="الاسم بالكامل"
                      value={member.fullName}
                      onChange={(e) => handleUpdateMember(index, 'fullName', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] text-slate-400 mb-1">
                      الاسم على الهودي
                    </label>
                    <input
                      type="text"
                      placeholder="الاسم المطبوع"
                      value={member.nameOnHoodie}
                      onChange={(e) => handleUpdateMember(index, 'nameOnHoodie', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">
                      الوزن (كجم) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="40"
                      max="160"
                      placeholder="75"
                      value={member.weightKg}
                      onChange={(e) => handleUpdateMember(index, 'weightKg', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">المقاس</label>
                    <select
                      value={member.size}
                      onChange={(e) =>
                        handleUpdateMember(index, 'size', e.target.value as HoodieSize)
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white font-bold"
                    >
                      {SIZES.map((sz) => (
                        <option key={sz} value={sz}>
                          {sz}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-1 flex justify-end sm:pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      title="حذف العضو"
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* بيانات سداد عربون التيم */}
            <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 shadow-xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">
                    بيانات سداد عربون التيم (الحد الأدنى 50% أي {teamPricing.minDepositRequired} ج.م)
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">فودافون كاش المعتمد:</span>
                    <span className="text-sm font-mono font-bold text-white" dir="ltr">
                      {OFFICIAL_PAYMENT_ACCOUNTS.vodafoneCash.number}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyAccount(OFFICIAL_PAYMENT_ACCOUNTS.vodafoneCash.number, 'team_voda')
                    }
                    className="p-2 rounded-lg bg-slate-800 text-[#38BDF8] text-xs cursor-pointer"
                  >
                    {copiedAccount === 'team_voda' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      'نسخ'
                    )}
                  </button>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">إنستاباي المعتمد:</span>
                    <span className="text-xs font-mono font-bold text-white" dir="ltr">
                      {OFFICIAL_PAYMENT_ACCOUNTS.instaPay.address}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyAccount(OFFICIAL_PAYMENT_ACCOUNTS.instaPay.address, 'team_insta')
                    }
                    className="p-2 rounded-lg bg-slate-800 text-[#38BDF8] text-xs cursor-pointer"
                  >
                    {copiedAccount === 'team_insta' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      'نسخ'
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  طريقة الدفع المستخدمة <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectPaymentMethod('vodafone_cash', 'team')}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      teamForm.payment.method === 'vodafone_cash'
                        ? 'border-red-500 bg-red-500/10 text-red-300'
                        : 'border-slate-700 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    فودافون كاش
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPaymentMethod('instapay', 'team')}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      teamForm.payment.method === 'instapay'
                        ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                        : 'border-slate-700 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    إنستاباي
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    المبلغ المحول كعربون للتيم <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={teamPricing.minDepositRequired}
                    max={teamPricing.totalPrice}
                    value={teamForm.payment.amountPaid}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setTeamForm({
                        ...teamForm,
                        payment: {
                          ...teamForm.payment,
                          amountPaid: val,
                          remainingAmount: Math.max(0, teamPricing.totalPrice - val),
                        },
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    المتبقي عند الاستلام:
                  </label>
                  <div className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-amber-300">
                    {teamPricing.totalPrice - teamForm.payment.amountPaid} جنيه مصري
                  </div>
                </div>
              </div>

              <div>
                {teamForm.payment.method === 'vodafone_cash' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      رقم فودافون كاش المُحول منه <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      placeholder="01098765432"
                      value={teamForm.payment.senderAccountOrPhone}
                      onChange={(e) =>
                        setTeamForm({
                          ...teamForm,
                          payment: {
                            ...teamForm.payment,
                            senderAccountOrPhone: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono text-left"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      الرقم المرجعي للتحويل (Ref No) في إنستاباي <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      placeholder="مثال: 431298765412"
                      value={teamForm.payment.transactionRef}
                      onChange={(e) =>
                        setTeamForm({
                          ...teamForm,
                          payment: {
                            ...teamForm.payment,
                            transactionRef: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono text-left"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#F59E0B] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري تسجيل طلب التيم وتوليد الكود...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>
                    تأكيد حجز التيم ({teamForm.members.length} قطع • {teamPricing.totalPrice} ج.م)
                  </span>
                </>
              )}
            </button>
          </form>
        )}

        {/* ===================================================================== */}
        {/* 3. نموذج حجز الهودي السادة                                             */}
        {/* ===================================================================== */}
        {activeTab === 'plain_hoodie' && (
          <form
            onSubmit={handlePlainSubmit}
            className="bg-[#1E293B] border border-indigo-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl relative"
          >
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-700/70">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 flex-wrap">
                <span>حجز هودي سادة (بدون طباعة)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {PLAIN_HOODIE_PRICE_EGP} ج.م للقطعة • 11 لون متاح
                </span>
              </h3>
              <button
                type="button"
                onClick={onOpenSizeGuide}
                className="text-xs text-[#38BDF8] hover:underline flex items-center gap-1 font-medium bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer shrink-0"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>جدول المقاسات</span>
              </button>
            </div>

            {/* اختيار اللون والمعاينة الحية */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    اختر اللون المطلوب: <span className="text-indigo-400">{selectedPlainColor.name}</span>
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                  {PLAIN_HOODIE_COLORS.map((color) => {
                    const isSelected = color.id === plainForm.selectedColorId;
                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() =>
                          setPlainForm({ ...plainForm, selectedColorId: color.id })
                        }
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-400 bg-indigo-500/15 scale-105'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-600'
                        }`}
                      >
                        <span
                          className="w-7 h-7 rounded-full border border-white/20 shadow-inner flex items-center justify-center"
                          style={{ backgroundColor: color.hex }}
                        >
                          {isSelected && (
                            <Check
                              className={`w-4 h-4 ${
                                color.isLight ? 'text-slate-900' : 'text-white'
                              }`}
                            />
                          )}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-300 text-center leading-tight">
                          {color.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-5 flex flex-col items-center">
                <div
                  onClick={() => setIsImageModalOpen(true)}
                  className="relative group w-full max-w-[220px] aspect-square rounded-xl overflow-hidden bg-slate-950 border border-slate-700 cursor-zoom-in"
                >
                  <img
                    src={selectedPlainColor.image}
                    alt={selectedPlainColor.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-xs font-bold">
                      <ZoomIn className="w-3.5 h-3.5" />
                      <span>تكبير</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  الاسم ثلاثي أو رباعي <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سارة أحمد محمود"
                  value={plainForm.fullName}
                  onChange={(e) => setPlainForm({ ...plainForm, fullName: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  رقم الواتساب للتأكيد والاستلام <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  dir="ltr"
                  placeholder="01012345678"
                  value={plainForm.whatsApp}
                  onChange={(e) => setPlainForm({ ...plainForm, whatsApp: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  الوزن التقريبي (كجم) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="40"
                  max="160"
                  placeholder="مثال: 65"
                  value={plainForm.weightKg}
                  onChange={(e) => setPlainForm({ ...plainForm, weightKg: e.target.value })}
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">عدد القطع</label>
                <div className="flex items-center bg-slate-900/90 border border-slate-700 rounded-xl p-1 w-fit">
                  <button
                    type="button"
                    onClick={() => {
                      const newQ = Math.max(1, plainForm.quantity - 1);
                      const newTotal = newQ * PLAIN_HOODIE_PRICE_EGP;
                      const newDeposit = Math.ceil(newTotal * 0.5);
                      setPlainForm({
                        ...plainForm,
                        quantity: newQ,
                        payment: {
                          ...plainForm.payment,
                          amountPaid: newDeposit,
                          remainingAmount: newTotal - newDeposit,
                        },
                      });
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-white font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-mono font-bold text-white text-base">
                    {plainForm.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const newQ = Math.min(10, plainForm.quantity + 1);
                      const newTotal = newQ * PLAIN_HOODIE_PRICE_EGP;
                      const newDeposit = Math.ceil(newTotal * 0.5);
                      setPlainForm({
                        ...plainForm,
                        quantity: newQ,
                        payment: {
                          ...plainForm.payment,
                          amountPaid: newDeposit,
                          remainingAmount: newTotal - newDeposit,
                        },
                      });
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-800 text-white font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                المقاس المطلوب <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setPlainForm({ ...plainForm, size: sz })}
                    className={`py-3 px-3 rounded-xl border text-sm font-bold transition-all text-center cursor-pointer ${
                      plainForm.size === sz
                        ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300'
                        : 'border-slate-700 bg-slate-900/60 text-slate-300'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* بيانات سداد عربون الهودي السادة */}
            <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-indigo-500/40 shadow-xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white">
                    بيانات سداد العربون (الحد الأدنى 50% أي {plainPricing.minDepositRequired} ج.م)
                  </h4>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">فودافون كاش المعتمد:</span>
                    <span className="text-sm font-mono font-bold text-white" dir="ltr">
                      {OFFICIAL_PAYMENT_ACCOUNTS.vodafoneCash.number}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyAccount(OFFICIAL_PAYMENT_ACCOUNTS.vodafoneCash.number, 'plain_voda')
                    }
                    className="p-2 rounded-lg bg-slate-800 text-[#38BDF8] text-xs cursor-pointer"
                  >
                    {copiedAccount === 'plain_voda' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      'نسخ'
                    )}
                  </button>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">إنستاباي المعتمد:</span>
                    <span className="text-xs font-mono font-bold text-white" dir="ltr">
                      {OFFICIAL_PAYMENT_ACCOUNTS.instaPay.address}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyAccount(OFFICIAL_PAYMENT_ACCOUNTS.instaPay.address, 'plain_insta')
                    }
                    className="p-2 rounded-lg bg-slate-800 text-[#38BDF8] text-xs cursor-pointer"
                  >
                    {copiedAccount === 'plain_insta' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      'نسخ'
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  طريقة الدفع المستخدمة <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectPaymentMethod('vodafone_cash', 'plain')}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      plainForm.payment.method === 'vodafone_cash'
                        ? 'border-red-500 bg-red-500/10 text-red-300'
                        : 'border-slate-700 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    فودافون كاش
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectPaymentMethod('instapay', 'plain')}
                    className={`p-2.5 rounded-xl border text-xs font-bold cursor-pointer ${
                      plainForm.payment.method === 'instapay'
                        ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                        : 'border-slate-700 bg-slate-900/60 text-slate-400'
                    }`}
                  >
                    إنستاباي
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    المبلغ المحول كعربون <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={plainPricing.minDepositRequired}
                    max={plainPricing.totalPrice}
                    value={plainForm.payment.amountPaid}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setPlainForm({
                        ...plainForm,
                        payment: {
                          ...plainForm.payment,
                          amountPaid: val,
                          remainingAmount: Math.max(0, plainPricing.totalPrice - val),
                        },
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    المتبقي عند الاستلام:
                  </label>
                  <div className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-amber-300">
                    {plainPricing.totalPrice - plainForm.payment.amountPaid} جنيه مصري
                  </div>
                </div>
              </div>

              <div>
                {plainForm.payment.method === 'vodafone_cash' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      رقم فودافون كاش المُحول منه <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      placeholder="01098765432"
                      value={plainForm.payment.senderAccountOrPhone}
                      onChange={(e) =>
                        setPlainForm({
                          ...plainForm,
                          payment: {
                            ...plainForm.payment,
                            senderAccountOrPhone: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono text-left"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      الرقم المرجعي للتحويل (Ref No) في إنستاباي <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      dir="ltr"
                      placeholder="مثال: 431298765412"
                      value={plainForm.payment.transactionRef}
                      onChange={(e) =>
                        setPlainForm({
                          ...plainForm,
                          payment: {
                            ...plainForm.payment,
                            transactionRef: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono text-left"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-black text-base shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري تسجيل حجز الهودي السادة...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>تأكيد حجز الهودي السادة ({plainPricing.totalPrice} ج.م)</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* نافذة تكبير صورة لون الهودي السادة */}
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 px-1">
              <span className="text-sm font-bold text-white">
                لون الهودي: {selectedPlainColor.name}
              </span>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={selectedPlainColor.image}
              alt={selectedPlainColor.name}
              className="w-full max-h-[75vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* رسالة تذكير إرسال سكرين التحويل على واتساب قبل تأكيد الحجز */}
      {pendingConfirmType && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4"
          onClick={() => setPendingConfirmType(null)}
        >
          <div
            className="bg-[#1E293B] border-2 border-amber-500/60 rounded-2xl w-full max-w-md p-6 shadow-2xl text-right space-y-5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#F59E0B] block">
                  تنبيه هام لتوثيق حجزك
                </span>
                <h3 className="text-lg font-black text-white">
                  تذكير بإرسال سكرين شوت التحويل
                </h3>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed">
              <p>
                يرجى التأكد من إرسال{' '}
                <strong className="text-amber-300">سكرين شوت إيصال التحويل</strong> مع{' '}
                <strong className="text-[#38BDF8]">كود التتبع</strong> (الذي سيظهر لك بعد التأكيد)
                على رقم الواتساب الرسمي حتى يتم اعتماد طلبك:
              </p>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="font-mono font-bold text-emerald-400 text-sm" dir="ltr">
                  {OFFICIAL_PAYMENT_ACCOUNTS.vodafoneCash.number}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyAccount(OFFICIAL_PAYMENT_ACCOUNTS.vodafoneCash.number, 'modal_wa')
                  }
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[#38BDF8] text-xs font-bold cursor-pointer"
                >
                  {copiedAccount === 'modal_wa' ? 'تم النسخ ✓' : 'نسخ الرقم'}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleConfirmPendingOrder}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#38BDF8] to-sky-500 hover:from-sky-400 hover:to-sky-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
              >
                فهمت، تأكيد وإرسال الطلب الآن
              </button>

              <button
                type="button"
                onClick={() => setPendingConfirmType(null)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
              >
                رجوع
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};