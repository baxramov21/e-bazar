"use server";

import { GoogleGenAI } from "@google/genai";

export async function generatePricePredictionAction(formData: FormData) {
  const product = formData.get("product") as string;
  const region = formData.get("region") as string;
  const historicalDataStr = formData.get("historicalData") as string;
  const timeframe = formData.get("timeframe") as string || "Oylik";
  
  if (!product || !region || !historicalDataStr) return { error: "Missing data" };

  const prompt = `Siz O'zbekiston Qishloq xo'jaligi bozorining yetakchi analitik sun'iy intellektisiz.
Foydalanuvchi ${region} hududida ${product} narxlarining o'zgarish tarixini tahlil qilishni so'ramoqda.
Vaqt oralig'i filtri: ${timeframe}
Quyida narxlar dinamikasi (UZS) simulyatsiyasi berilgan:
${historicalDataStr}

Ushbu grafik dinamikasini chuqur tahlil qiling va quyidagilarni taqdim eting:
1. Umumiy tendensiya (Masalan: O'suvchi, Pasayuvchi, Barqaror) va bu xulosa nima uchun chiqarilgani.
2. Ehtimoliy kelajakdagi o'zgarish (Keyingi 1-2 oy ichida narx qanday o'zgarishi mumkin? Taxminiy foizlarda).
3. Ushbu o'zgarishlarning yuzaga kelish sabablari (Simulyatsiya qilingan real omillar: masalan, mavsumiy ob-havo, hosildorlik, logistika va yonilg'i narxlari, eksport/import tariflari).

Javobingizni faqat O'zbek tilida, professional va tushunarli formatda, qisqa abzaslar va ro'yxatlar (bullet points) yordamida yozing. Hech qanday markdown kod bloklarisiz yozing.`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });
    return { success: true, analysis: response.text };
  } catch (error: any) {
    console.error("Prediction error:", error);
    return { error: error.message || "Failed to generate prediction" };
  }
}
