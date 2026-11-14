import { PaymentDetails } from '../types';

// ==========================================
// 1. أسعار المنتجات والعربون المعتمد
// ==========================================
export const INDIVIDUAL_PRICE_EGP = 675;
export const TEAM_PRICE_EGP = 640;
export const PLAIN_HOODIE_PRICE_EGP = 580;

export const MIN_TEAM_MEMBERS = 5;

export const OFFICIAL_PAYMENT_ACCOUNTS = {
  vodafoneCash: {
    number: '01032964194',
    name: 'عبدالستار محمد',
  },
  instaPay: {
    address: 'abdullsattarmohamed@instapay',
    name: 'عبدالستار محمد',
  },
};

// ==========================================
// 2. دوال توليد أكواد التتبع التسلسلية
// ==========================================
export function generateIndividualTrackingId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `BIS-${randomNum}`;
}

export function generateTeamTrackingId(): string {
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `BIS-TEAM-${randomNum}`;
}

export function generatePlainHoodieTrackingId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `PLAIN-${randomNum}`;
}

// ==========================================
// 3. دوال حساب الأسعار والعربون الإلزامي (50%)
// ==========================================
export function calculateIndividualPrice(quantity: number) {
  const totalPrice = quantity * INDIVIDUAL_PRICE_EGP;
  const minDepositRequired = Math.ceil(totalPrice * 0.5);
  return {
    totalPrice,
    minDepositRequired,
    pricePerItem: INDIVIDUAL_PRICE_EGP,
  };
}

export function calculateTeamPrice(memberCount: number) {
  const count = Math.max(memberCount, MIN_TEAM_MEMBERS);
  const totalPrice = count * TEAM_PRICE_EGP;
  const minDepositRequired = Math.ceil(totalPrice * 0.5);
  return {
    totalPrice,
    minDepositRequired,
    pricePerItem: TEAM_PRICE_EGP,
    discountAmount: (INDIVIDUAL_PRICE_EGP - TEAM_PRICE_EGP) * count,
  };
}

export function calculatePlainHoodiePrice(quantity: number) {
  const totalPrice = quantity * PLAIN_HOODIE_PRICE_EGP;
  const minDepositRequired = Math.ceil(totalPrice * 0.5);
  return {
    totalPrice,
    minDepositRequired,
    pricePerItem: PLAIN_HOODIE_PRICE_EGP,
  };
}

// ==========================================
// 4. التحقق من رقم الهاتف وسداد العربون
// ==========================================
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^01[0125]\d{8}$/.test(cleaned);
}

export function validateAdvancePayment(
  payment: PaymentDetails,
  totalPrice: number
): { isValid: boolean; error?: string } {
  const minRequired = Math.ceil(totalPrice * 0.5);

  if (!payment.amountPaid || payment.amountPaid < minRequired) {
    return {
      isValid: false,
      error: `عربون الحجز الإلزامي هو 50% على الأقل (أي ${minRequired} جنيه مصري).`,
    };
  }

  if (payment.amountPaid > totalPrice) {
    return {
      isValid: false,
      error: `مبلغ العربون المدفوع لا يمكن أن يتجاوز إجمالي سعر الطلب (${totalPrice} ج.م).`,
    };
  }

  if (payment.method === 'vodafone_cash') {
    if (!payment.senderAccountOrPhone || !validatePhone(payment.senderAccountOrPhone)) {
      return {
        isValid: false,
        error: 'يرجى كتابة رقم فودافون كاش الصحيح الذي تم التحويل منه (11 رقم).',
      };
    }
  }

  if (payment.method === 'instapay') {
    if (!payment.transactionRef || payment.transactionRef.trim().length < 6) {
      return {
        isValid: false,
        error: 'يرجى إدخال الرقم المرجعي للتحويل (Ref No) الخاص بـ إنستاباي بدقة.',
      };
    }
  }

  return { isValid: true };
}

// ==========================================
// 5. إدارة التخزين المحلي للطلبات
// ==========================================
export function getSavedOrders(): any[] {
  try {
    const saved = localStorage.getItem('bis_saved_orders');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
}

export function saveOrderLocally(order: any) {
  try {
    const orders = getSavedOrders();
    orders.unshift(order);
    localStorage.setItem('bis_saved_orders', JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving order locally:', e);
  }
}

// ==========================================
// 6. دالة إرسال الطلب لـ Google Sheet (محمية ضد الضغط وضعف النت)
// ==========================================
export async function sendOrderToGoogleSheet(orderData: any, paymentDetails?: PaymentDetails) {
  const SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbx5EB9UJIPS7I2jXfvpa4GBX7-NAyPQ_cfHCAdpvdOCHN2FoKkDgtQucpJJwPdCSWujbw/exec';

  const MAX_RETRIES = 3;
  const TIMEOUT_MS = 15000; // 15 ثانية لكل محاولة

  const payload = {
    orderType: orderData.orderType, // 'individual' | 'team' | 'plain_hoodie'
    trackingId: orderData.trackingId,
    timestamp: orderData.timestamp || new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' }),
    fullName: orderData.fullName,
    nameOnHoodie: orderData.nameOnHoodie || 'سادة بدون طباعة',
    whatsApp: orderData.whatsApp || orderData.customerWhatsApp,
    size: orderData.size,
    weight: orderData.weight,
    quantity: orderData.quantity,
    paidAmount: orderData.paidAmount,
    totalPrice: orderData.totalPrice,
    instapayRef: orderData.instapayRef || 'غير متاح',
    vfcashSender: orderData.vfcashSender || 'غير متاح',
    receiptProofUrl: orderData.receiptProofUrl || 'تم التحقق يدوياً',
    paymentMethod: paymentDetails?.method || orderData.paymentMethod || '',
    row: orderData.row,
  };

  // حفظ نسخة احتياطية مؤقتة في جهاز الطالب قبل بدء الإرسال
  try {
    if (payload.trackingId) {
      localStorage.setItem(
        `bis_backup_${payload.trackingId}`,
        JSON.stringify({ payload, synced: false, savedAt: Date.now() })
      );
    }
  } catch {
    // تجاهل في حالة التصفح الخفي
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        keepalive: true,
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // تأكيد مزامنة النسخة الاحتياطية بعد نجاح الإرسال
      try {
        if (payload.trackingId) {
          localStorage.setItem(
            `bis_backup_${payload.trackingId}`,
            JSON.stringify({ payload, synced: true, syncedAt: Date.now() })
          );
        }
      } catch {
        // تجاهل
      }

      return { success: true };
    } catch (error) {
      clearTimeout(timeoutId);

      if (attempt === MAX_RETRIES) {
        console.error('فشل إرسال البيانات لجوجل شيت بعد 3 محاولات:', error);
        throw new Error('تعذر الاتصال بالسيرفر، يرجى التأكد من اتصال الإنترنت والمحاولة مرة أخرى.');
      }

      // انتظار تدريجي (1.5 ثانية ثم 3 ثواني) قبل إعادة المحاولة
      await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
    }
  }

  return { success: false };
}