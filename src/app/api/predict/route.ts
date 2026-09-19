import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { product, region, historicalData, timeframe, messages } = await req.json();

    if (!product || !region || !historicalData || !messages) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const systemInstruction = `Siz O'zbekiston Qishloq xo'jaligi bozorining yetakchi analitik sun'iy intellektisiz.
Sizning vazifangiz bozor tahlilchisi sifatida foydalanuvchilar bilan suhbatlashish. Siz yangiliklardan xabardor bo'lishingiz, bozordagi vaziyatni tushunishingiz va tarixiy narxlar hamda ularning o'zgarishini tahlil qilishingiz kerak.
Hozirda foydalanuvchi ${region} hududida ${product} narxlari bo'yicha ma'lumot so'ramoqda.
Vaqt oralig'i filtri: ${timeframe}.
Quyida oxirgi davr uchun narxlar dinamikasi (UZS) simulyatsiyasi berilgan:
${historicalData}

Foydalanuvchining savollariga javob bering, narxlarni tahlil qiling va kelajakdagi o'zgarishlar haqida prognoz bering. Javobingizni faqat O'zbek tilida, professional va tushunarli formatda, qisqa abzaslar va ro'yxatlar (bullet points) yordamida yozing.`;

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const formattedContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3.5-flash',
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
      }
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
