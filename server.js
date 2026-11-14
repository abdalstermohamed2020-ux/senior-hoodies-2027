import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
  const isProd = process.env.NODE_ENV === "production";
  app.use(express.json({ limit: "25mb" }));
  const apiKey = process.env.GEMINI_API_KEY;
  const ai = apiKey ? new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  }) : null;
  app.post("/api/verify-receipt", async (req, res) => {
    try {
      const { imageBase64, mimeType, method, minRequiredAmount, totalPrice } = req.body;
      if (!imageBase64 || !method) {
        return res.status(400).json({
          isValid: false,
          error: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0635\u0648\u0631\u0629 \u0623\u0648 \u0648\u0633\u064A\u0644\u0629 \u0627\u0644\u062F\u0641\u0639 \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629"
        });
      }
      if (!ai) {
        return res.status(200).json({
          bypassed: true,
          message: "Gemini API key not configured, fallback to client OCR"
        });
      }
      let calculatedMinDeposit = 300;
      if (typeof totalPrice === "number" && totalPrice > 0) {
        calculatedMinDeposit = totalPrice / 2;
      } else if (typeof minRequiredAmount === "number" && minRequiredAmount > 0) {
        calculatedMinDeposit = minRequiredAmount;
      }
      const requiredMinDeposit = calculatedMinDeposit;
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const isVodafone = method === "vodafone_cash";
      const prompt = `You are a strict, automated financial fraud prevention auditor for Egyptian payment transaction receipts.
Your task is to inspect this uploaded receipt image with extreme precision and verify whether it matches the official template and requirements for: "${method}".

OFFICIAL TARGET RECIPIENTS & MINIMUM DEPOSIT REQUIRED:
- Mandatory Minimum Transferred Amount: 
${requiredMinDeposit} EGP (Egyptian Pounds) (Must be at least half of the total price).
${isVodafone ? `
FOR "vodafone_cash" (Vodafone Cash):
Official Target Vodafone Cash Number: "01032964194"
The image MUST be an authentic screenshot of the official Vodafone Cash transaction SMS or Ana Vodafone app screen.
MANDATORY CONDITIONS:
1. Target Destination Account: The transfer MUST be directed to the official number "01032964194" (look for "\u0644\u0631\u0642\u0645 01032964194" or "01032964194").
2. Transferred Amount: Must show a transferred amount of at least ${requiredMinDeposit} EGP.
3. Official Structure: Contains "VF-Cash", "\u062A\u0645 \u062A\u062D\u0648\u064A\u0644" AND "\u062C\u0646\u064A\u0647 \u0644\u0631\u0642\u0645", "\u0645\u0635\u0627\u0631\u064A\u0641 \u0627\u0644\u062E\u062F\u0645\u0629", "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0639\u0645\u0644\u064A\u0629", and "\u0631\u0642\u0645 \u0627\u0644\u0639\u0645\u0644\u064A\u0629".

CRITICAL REJECTION CONDITIONS:
- If sent to a phone number OTHER than "01032964194", return isValid: false with rejectionReason: "\u0631\u0642\u0645 \u0627\u0644\u0645\u062D\u0641\u0638\u0629 \u0627\u0644\u0645\u062D\u0648\u0644 \u0625\u0644\u064A\u0647\u0627 \u0641\u064A \u0627\u0644\u0625\u064A\u0635\u0627\u0644 \u063A\u064A\u0631 \u0645\u0637\u0627\u0628\u0642 \u0644\u0644\u0631\u0642\u0645 \u0627\u0644\u0631\u0633\u0645\u064A \u0627\u0644\u0645\u0639\u062A\u0645\u062F (01032964194)".
- If the transferred amount is LESS than 
${requiredMinDeposit} EGP, return isValid: false with rejectionReason: "\u0645\u0628\u0644\u063A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0623\u0642\u0644 \u0645\u0646 \u0627\u0644\u0639\u0631\u0628\u0648\u0646 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 (\u064A\u062C\u0628 \u062F\u0641\u0639 \u0646\u0635\u0641 \u0627\u0644\u0645\u0628\u0644\u063A \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0628\u0642\u064A\u0645\u0629 ${requiredMinDeposit} \u062C.\u0645).".
- If this image is a wallpaper, landscape photo, selfie, random chat screenshot, meme, black screen, or receipt of another service (e.g. InstaPay, Fawry), return isValid: false.
` : `
FOR "instapay" (InstaPay):
Official Target InstaPay Handle: "abdullsattarmohamed@instapay"
Official Recipient Name: "\u0639\u0628\u062F \u0627\u0644\u0633\u062A\u0627\u0631 \u0645\u062D\u0645\u062F" (or variations like "\u0639\u0628\u062F\u0627\u0644\u0633\u062A\u0627\u0631" / "abdullsattarmohamed")
The image MUST be an authentic screenshot of the official InstaPay transfer confirmation / success screen.
MANDATORY CONDITIONS:
1. Target Destination Account: The recipient section ("\u0625\u0644\u0649 \u0627\u0646\u0633\u062A\u0627\u0628\u0627\u064A" / "\u0625\u0644\u0649") MUST show the transfer was made to "abdullsattarmohamed@instapay" or recipient name "\u0639\u0628\u062F \u0627\u0644\u0633\u062A\u0627\u0631 \u0645\u062D\u0645\u062F" / "\u0639\u0628\u062F\u0627\u0644\u0633\u062A\u0627\u0631".
2. Transferred Amount: Must show a transferred amount of at least ${requiredMinDeposit} EGP.
3. Official Structure:
   - Success Header: Prominent green circular success checkmark icon with success text ("\u062A\u0645\u062A \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0628\u0646\u062C\u0627\u062D" OR "\u062A\u0645 \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0628\u0646\u062C\u0627\u062D").
   - Transfer Amount: Numeric transfer amount clearly displayed in EGP / \u062C\u0646\u064A\u0647.
   - Sections: Sender section indicating "\u0645\u0646" AND recipient section indicating "\u0625\u0644\u0649 \u0627\u0646\u0633\u062A\u0627\u0628\u0627\u064A" / "\u0625\u0644\u0649".
   - Supporting Reference: "\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0645\u0631\u062C\u0639\u064A" (Ref No) or date/time.

CRITICAL REJECTION CONDITIONS:
- If sent to a recipient OTHER than "abdullsattarmohamed@instapay" (or "\u0639\u0628\u062F \u0627\u0644\u0633\u062A\u0627\u0631 \u0645\u062D\u0645\u062F"), return isValid: false with rejectionReason: "\u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0633\u062A\u0644\u0645 \u0641\u064A \u0627\u0644\u0625\u064A\u0635\u0627\u0644 \u063A\u064A\u0631 \u0645\u0637\u0627\u0628\u0642 \u0644\u0645\u0639\u0631\u0641 \u0625\u0646\u0633\u062A\u0627\u0628\u0627\u064A \u0627\u0644\u0631\u0633\u0645\u064A \u0627\u0644\u0645\u0639\u062A\u0645\u062F (abdullsattarmohamed@instapay)".
- If the transferred amount is LESS than 
${requiredMinDeposit} EGP, return isValid: false with rejectionReason: "\u0645\u0628\u0644\u063A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0623\u0642\u0644 \u0645\u0646 \u0627\u0644\u0639\u0631\u0628\u0648\u0646 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 (\u064A\u062C\u0628 \u062F\u0641\u0639 \u0646\u0635\u0641 \u0627\u0644\u0645\u0628\u0644\u063A \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0628\u0642\u064A\u0645\u0629 ${requiredMinDeposit} \u062C.\u0645).".
- If this image is a wallpaper, selfie, random chat screenshot, meme, solid/blank screen, or Vodafone Cash SMS, return isValid: false.
`}

CRITICAL RULES FOR "extractedAmount":
- Accurately parse the main transferred amount (\u0645\u0628\u0644\u063A \u0627\u0644\u062A\u062D\u0648\u064A\u0644) as a single clean number.
- If extractedAmount is greater than or equal to 
${requiredMinDeposit}, the amount check passes.
- If extractedAmount is less than 
${requiredMinDeposit}, set isValid to false and rejectionReason to: "\u0645\u0628\u0644\u063A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0623\u0642\u0644 \u0645\u0646 \u0627\u0644\u0639\u0631\u0628\u0648\u0646 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 (\u064A\u062C\u0628 \u062F\u0641\u0639 \u0646\u0635\u0641 \u0627\u0644\u0645\u0628\u0644\u063A \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0628\u0642\u064A\u0645\u0629 ${requiredMinDeposit} \u062C.\u0645).".

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
      const timeoutPromise = new Promise(
        (_, reject) => setTimeout(() => reject(new Error("Gemini API timeout")), 15e3)
      );
      const response = await Promise.race([
        ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    data: cleanBase64,
                    mimeType: mimeType || "image/jpeg"
                  }
                },
                {
                  text: prompt
                }
              ]
            }
          ],
          config: {
            responseMimeType: "application/json",
            temperature: 0
          }
        }),
        timeoutPromise
      ]);
      const responseText = response.text?.trim() || "{}";
      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch (parseErr) {
        console.warn("Failed to parse Gemini audit JSON, fallback to manual check:", parseErr);
        parsed = {
          isValid: false,
          rejectionReason: "\u062A\u0639\u0630\u0631 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0625\u064A\u0635\u0627\u0644\u060C \u064A\u0631\u062C\u0649 \u0631\u0641\u0639 \u0633\u0643\u0631\u064A\u0646 \u0634\u0648\u062A \u0648\u0627\u0636\u062D\u0629"
        };
      }
      if (typeof parsed.extractedAmount === "number") {
        if (parsed.extractedAmount < requiredMinDeposit) {
          parsed.isValid = false;
          parsed.rejectionReason = `\u0645\u0628\u0644\u063A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0645\u0633\u062A\u062E\u0631\u062C (${parsed.extractedAmount} \u062C.\u0645) \u0623\u0642\u0644 \u0645\u0646 \u0627\u0644\u0639\u0631\u0628\u0648\u0646 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 (${requiredMinDeposit} \u062C.\u0645). \u064A\u062C\u0628 \u062F\u0641\u0639 \u0646\u0635\u0641 \u0627\u0644\u0645\u0628\u0644\u063A \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.`;
        }
      } else {
        parsed.isValid = false;
        parsed.rejectionReason = `\u062A\u0639\u0630\u0631 \u0627\u0644\u062A\u062D\u0642\u0642 \u0628\u0648\u0636\u0648\u062D \u0645\u0646 \u0645\u0628\u0644\u063A \u0627\u0644\u062A\u062D\u0648\u064A\u0644 \u0641\u064A \u0627\u0644\u0625\u064A\u0635\u0627\u0644. \u064A\u0631\u062C\u0649 \u0631\u0641\u0639 \u0633\u0643\u0631\u064A\u0646 \u0634\u0648\u062A \u0648\u0627\u0636\u062D\u0629 \u064A\u0638\u0647\u0631 \u0641\u064A\u0647\u0627 \u0627\u0644\u0645\u0628\u0644\u063A \u0628\u0642\u064A\u0645\u0629 \u0644\u0627 \u062A\u0642\u0644 \u0639\u0646 ${requiredMinDeposit} \u062C.\u0645.`;
      }
      return res.json(parsed);
    } catch (err) {
      console.warn("Receipt verification notice (falling back to client verification):", err?.message || err);
      return res.status(200).json({
        bypassed: true,
        fallback: true,
        message: "Proceeding with client-side verification engine"
      });
    }
  });
  app.post("/api/submit-order", async (req, res) => {
    try {
      const orderData = req.body;
      const targetSheet = orderData.orderType === "team" ? "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u062A\u064A\u0645\u0627\u062A" : "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0623\u0641\u0631\u0627\u062F";
      const customerWhatsApp = String(orderData.whatsApp || orderData.customerWhatsApp || orderData.leaderWhatsApp || "").trim();
      const nameOnHoodie = String(orderData.nameOnHoodie || orderData.name_on_hoodie || orderData.hoodieName || "").trim();
      const strict14Keys = {
        timestamp: String(orderData.timestamp || (/* @__PURE__ */ new Date()).toLocaleString("ar-EG", { timeZone: "Africa/Cairo" })),
        trackingId: String(orderData.trackingId),
        orderType: orderData.orderType === "team" ? "team" : "individual",
        fullName: String(orderData.fullName).trim(),
        nameOnHoodie,
        whatsApp: customerWhatsApp,
        size: String(orderData.size),
        weight: orderData.weight,
        quantity: Number(orderData.quantity),
        paidAmount: Number(orderData.paidAmount),
        totalPrice: Number(orderData.totalPrice),
        instapayRef: String(orderData.instapayRef || "").trim(),
        vfcashSender: String(orderData.vfcashSender || "").trim(),
        receiptProofUrl: String(orderData.receiptProofUrl || "").trim()
      };
      const payload = {
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
          strict14Keys.receiptProofUrl
        ]
      };
      for (const [key, val] of Object.entries(orderData)) {
        if (!(key in payload)) {
          payload[key] = val;
        }
      }
      const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEETS_URL || process.env.VITE_GOOGLE_SHEETS_URL || "https://script.google.com/macros/s/AKfycbzEAc9bL7u0oJDWhoDDMkOTYw4BB2u8VspEso8Nvimqe5KU3wcuS9tbQSNorklCFZWv0A/exec";
      try {
        const gasResponse = await fetch(GOOGLE_SHEET_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload),
          redirect: "follow"
        });
        const gasText = await gasResponse.text();
        console.log(`Order ${payload.trackingId} routed to "${targetSheet}":`, gasText.substring(0, 100));
      } catch (gasErr) {
        console.warn("Google Apps Script dispatch notification:", gasErr);
      }
      return res.json({
        success: true,
        message: "Order logged and mapped successfully",
        trackingId: payload.trackingId,
        targetSheet
      });
    } catch (err) {
      console.error("Submit order route error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to process order dispatch"
      });
    }
  });
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
