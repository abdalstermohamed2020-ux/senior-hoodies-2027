import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '25mb' }));

  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey
    ? new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      })
    : null;

  // Strict OCR & receipt verification API endpoint
  app.post('/api/verify-receipt', async (req, res) => {
    try {
      const { imageBase64, mimeType, method, minRequiredAmount, totalPrice } = req.body;

      if (!imageBase64 || !method) {
        return res.status(400).json({
          isValid: false,
          error: 'بيانات الصورة أو وسيلة الدفع غير مكتملة',
        });
      }

      if (!ai) {
        return res.status(200).json({
          bypassed: true,
          message: 'Gemini API key not configured, fallback to client OCR',
        });
      }

      // حساب الحد الأدنى للعربون ديناميكياً (نصف إجمالي المبلغ على الأقل)
      let calculatedMinDeposit = 300;
      if (typeof totalPrice === 'number' && totalPrice > 0) {
        calculatedMinDeposit = totalPrice / 2;
      } else if (typeof minRequiredAmount === 'number' && minRequiredAmount > 0) {
        calculatedMinDeposit = minRequiredAmount;
      }
      const requiredMinDeposit = calculatedMinDeposit;

      // Strip potential data URL prefix
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const isVodafone = method === 'vodafone_cash';

      const prompt = `You are a strict, automated financial fraud prevention auditor for Egyptian payment transaction receipts.
Your task is to inspect this uploaded receipt image with extreme precision and verify whether it matches the official template and requirements for: "${method}".

OFFICIAL TARGET RECIPIENTS & MINIMUM DEPOSIT REQUIRED:
- Mandatory Minimum Transferred Amount: 
${requiredMinDeposit} EGP (Egyptian Pounds) (Must be at least half of the total price).
${
  isVodafone
    ? `
FOR "vodafone_cash" (Vodafone Cash):
Official Target Vodafone Cash Number: "01032964194"
The image MUST be an authentic screenshot of the official Vodafone Cash transaction SMS or Ana Vodafone app screen.
MANDATORY CONDITIONS:
1. Target Destination Account: The transfer MUST be directed to the official number "01032964194" (look for "لرقم 01032964194" or "01032964194").
2. Transferred Amount: Must show a transferred amount of at least ${requiredMinDeposit} EGP.
3. Official Structure: Contains "VF-Cash", "تم تحويل" AND "جنيه لرقم", "مصاريف الخدمة", "تاريخ العملية", and "رقم العملية".

CRITICAL REJECTION CONDITIONS:
- If sent to a phone number OTHER than "01032964194", return isValid: false with rejectionReason: "رقم المحفظة المحول إليها في الإيصال غير مطابق للرقم الرسمي المعتمد (01032964194)".
- If the transferred amount is LESS than 
${requiredMinDeposit} EGP, return isValid: false with rejectionReason: "مبلغ التحويل أقل من العربون المطلوب (يجب دفع نصف المبلغ على الأقل بقيمة ${requiredMinDeposit} ج.م).".
- If this image is a wallpaper, landscape photo, selfie, random chat screenshot, meme, black screen, or receipt of another service (e.g. InstaPay, Fawry), return isValid: false.
`
    : `
FOR "instapay" (InstaPay):
Official Target InstaPay Handle: "abdullsattarmohamed@instapay"
Official Recipient Name: "عبد الستار محمد" (or variations like "عبدالستار" / "abdullsattarmohamed")
The image MUST be an authentic screenshot of the official InstaPay transfer confirmation / success screen.
MANDATORY CONDITIONS:
1. Target Destination Account: The recipient section ("إلى انستاباي" / "إلى") MUST show the transfer was made to "abdullsattarmohamed@instapay" or recipient name "عبد الستار محمد" / "عبدالستار".
2. Transferred Amount: Must show a transferred amount of at least ${requiredMinDeposit} EGP.
3. Official Structure:
   - Success Header: Prominent green circular success checkmark icon with success text ("تمت العملية بنجاح" OR "تم التحويل بنجاح").
   - Transfer Amount: Numeric transfer amount clearly displayed in EGP / جنيه.
   - Sections: Sender section indicating "من" AND recipient section indicating "إلى انستاباي" / "إلى".
   - Supporting Reference: "الرقم المرجعي" (Ref No) or date/time.

CRITICAL REJECTION CONDITIONS:
- If sent to a recipient OTHER than "abdullsattarmohamed@instapay" (or "عبد الستار محمد"), return isValid: false with rejectionReason: "حساب المستلم في الإيصال غير مطابق لمعرف إنستاباي الرسمي المعتمد (abdullsattarmohamed@instapay)".
- If the transferred amount is LESS than 
${requiredMinDeposit} EGP, return isValid: false with rejectionReason: "مبلغ التحويل أقل من العربون المطلوب (يجب دفع نصف المبلغ على الأقل بقيمة ${requiredMinDeposit} ج.م).".
- If this image is a wallpaper, selfie, random chat screenshot, meme, solid/blank screen, or Vodafone Cash SMS, return isValid: false.
`
}

CRITICAL RULES FOR "extractedAmount":
- Accurately parse the main transferred amount (مبلغ التحويل) as a single clean number.
- If extractedAmount is greater than or equal to 
${requiredMinDeposit}, the amount check passes.
- If extractedAmount is less than 
${requiredMinDeposit}, set isValid to false and rejectionReason to: "مبلغ التحويل أقل من العربون المطلوب (يجب دفع نصف المبلغ على الأقل بقيمة ${requiredMinDeposit} ج.م).".

Respond strictly with valid JSON conforming to this schema:
{
  "isValid": boolean,
  "detectedRecipient": string | null,
  "extractedAmount": number | null,
  "extractedRef": string | null,
  "detectedKeywords": string[],
  "missingKeywords": string[],
  "rejectionReason": string,
  "templateMatched": string
}`;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout')), 15000)
      );

      const response: any = await Promise.race([
        ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType: mimeType || 'image/jpeg',
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0,
          },
        }),
        timeoutPromise,
      ]);

      const responseText = response.text?.trim() || '{}';
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch (parseErr) {
        console.warn('Failed to parse Gemini audit JSON, fallback to manual check:', parseErr);
        parsed = {
          isValid: false,
          rejectionReason: 'تعذر التحقق من تفاصيل الإيصال، يرجى رفع سكرين شوت واضحة',
        };
      }

      // 🛡️ تعديل حاسم وقاطع: التدقيق البرمجي الإجباري بصرف النظر عن تقييم الـ AI
      if (typeof parsed.extractedAmount === 'number') {
        if (parsed.extractedAmount < requiredMinDeposit) {
          parsed.isValid = false;
          parsed.rejectionReason = `مبلغ التحويل المستخرج (${parsed.extractedAmount} ج.م) أقل من العربون المطلوب (${requiredMinDeposit} ج.م). يجب دفع نصف المبلغ على الأقل.`;
        }
      } else {
        // إذا لم يستطع استخراج الرقم بوضوح، نعتبرها غير مقبولة حرصاً على الأمان
        parsed.isValid = false;
        parsed.rejectionReason = `تعذر التحقق بوضوح من مبلغ التحويل في الإيصال. يرجى رفع سكرين شوت واضحة يظهر فيها المبلغ بقيمة لا تقل عن ${requiredMinDeposit} ج.م.`;
      }

      return res.json(parsed);
    } catch (err: any) {
      console.warn('Receipt verification notice (falling back to client verification):', err?.message || err);
      return res.status(200).json({
        bypassed: true,
        fallback: true,
        message: 'Proceeding with client-side verification engine',
      });
    }
  });

  // Google Sheets Backend Submission Route with Tab Mapping:
  app.post('/api/submit-order', async (req, res) => {
    try {
      const orderData = req.body;
      const targetSheet = orderData.orderType === 'team' ? 'طلبات التيمات' : 'طلبات الأفراد';
      const customerWhatsApp = String(orderData.whatsApp || orderData.customerWhatsApp || orderData.leaderWhatsApp || '').trim();
      const nameOnHoodie = String(orderData.nameOnHoodie || orderData.name_on_hoodie || orderData.hoodieName || '').trim();

      const strict14Keys = {
        timestamp: String(orderData.timestamp || new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })),
        trackingId: String(orderData.trackingId),
        orderType: orderData.orderType === 'team' ? 'team' : 'individual',
        fullName: String(orderData.fullName).trim(),
        nameOnHoodie,
        whatsApp: customerWhatsApp,
        size: String(orderData.size),
        weight: orderData.weight,
        quantity: Number(orderData.quantity),
        paidAmount: Number(orderData.paidAmount),
        totalPrice: Number(orderData.totalPrice),
        instapayRef: String(orderData.instapayRef || '').trim(),
        vfcashSender: String(orderData.vfcashSender || '').trim(),
        receiptProofUrl: String(orderData.receiptProofUrl || '').trim(),
      };

      const payload: Record<string, any> = {
        ...strict14Keys,
        targetSheet,
        sheetTab: targetSheet,
        sheetName: targetSheet,
        tabName: targetSheet,
        customerPhone: customerWhatsApp,
        row: orderData.row || [
          strict14Keys.timestamp,
          strict14Keys.trackingId,
          strict14Keys.orderType,
          strict14Keys.fullName,
          strict14Keys.nameOnHoodie,
          strict14Keys.whatsApp,
          strict14Keys.size,
          strict14Keys.weight,
          strict14Keys.quantity,
          strict14Keys.paidAmount,
          strict14Keys.totalPrice,
          strict14Keys.instapayRef,
          strict14Keys.vfcashSender,
          strict14Keys.receiptProofUrl,
        ],
      };

      for (const [key, val] of Object.entries(orderData)) {
        if (!(key in payload)) {
          payload[key] = val;
        }
      }

      const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEETS_URL || 
        process.env.VITE_GOOGLE_SHEETS_URL || 
        "https://script.google.com/macros/s/AKfycbzEAc9bL7u0oJDWhoDDMkOTYw4BB2u8VspEso8Nvimqe5KU3wcuS9tbQSNorklCFZWv0A/exec";
      
      try {
        const gasResponse = await fetch(GOOGLE_SHEET_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          redirect: 'follow',
        });
        const gasText = await gasResponse.text();
        console.log(`Order ${payload.trackingId} routed to "${targetSheet}":`, gasText.substring(0, 100));
      } catch (gasErr) {
        console.warn('Google Apps Script dispatch notification:', gasErr);
      }

      return res.json({
        success: true,
        message: 'Order logged and mapped successfully',
        trackingId: payload.trackingId,
        targetSheet,
      });
    } catch (err: any) {
      console.error('Submit order route error:', err);
      return res.status(500).json({
        success: false,
        error: 'Failed to process order dispatch',
      });
    }
  });

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();