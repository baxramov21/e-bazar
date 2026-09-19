import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { product, region, historicalData, timeframe } = await req.json();

    if (!product || !region || !historicalData) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const prompt = `Siz O'zbekiston Qishloq xo'jaligi bozorining yetakchi analitik sun'iy intellektisiz.
Foydalanuvchi ${region} hududida ${product} narxlarining o'zgarish tarixini tahlil qilishni so'ramoqda.
Vaqt oralig'i filtri: ${timeframe}
Quyida narxlar dinamikasi (UZS) simulyatsiyasi berilgan:
${historicalData}

Ushbu grafik dinamikasini chuqur tahlil qiling va quyidagilarni taqdim eting:
1. Umumiy tendensiya (Masalan: O'suvchi, Pasayuvchi, Barqaror) va bu xulosa nima uchun chiqarilgani.
2. Ehtimoliy kelajakdagi o'zgarish (Keyingi 1-2 oy ichida narx qanday o'zgarishi mumkin? Taxminiy foizlarda).
3. Ushbu o'zgarishlarning yuzaga kelish sabablari (Simulyatsiya qilingan real omillar: masalan, mavsumiy ob-havo, hosildorlik, logistika va yonilg'i narxlari, eksport/import tariflari).

Javobingizni faqat O'zbek tilida, professional va tushunarli formatda, qisqa abzaslar va ro'yxatlar (bullet points) yordamida yozing. Hech qanday markdown kod bloklarisiz yozing.`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.5-flash',
      contents: prompt,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              controller.enqueue(encoder.encode(chunk.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error("Streaming Prediction error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate prediction" }, { status: 500 });
  }
}
