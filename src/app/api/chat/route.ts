import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // Construct conversation for Gemini
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: "Siz BozorAI - qishloq xo'jaligi va oziq-ovqat mahsulotlarini ulgurji xarid qilish bo'yicha aqlli yordamchisiz. Xaridor bilan O'zbek tilida do'stona va qisqa muloqot qilasiz. Sizning vazifangiz xaridordan 5 ta muhim ma'lumotni yig'ishdir: 1) Mahsulot nomi, 2) Miqdori (kg/tonna), 3) Yetkazib berish manzili (viloyat/shahar), 4) Qachonga kerakligi (muddat), 5) Xaridor xohlagan maqsadli narxi (UZS). Barcha 5 ta ma'lumotni bilmaguningizcha, yetishmayotgan ma'lumotlarni o'zingiz so'rab oling. Barcha 5 ta ma'lumot aniq bo'lsa, 'search_market' funksiyasini chaqiring. Eslatma: Hech qachon HTML, Markdown yoki uzun matnlar qaytarmang, iloji boricha qisqa (1-2 gap) va aniq gapiring.",
        tools: [{
          functionDeclarations: [{
            name: "search_market",
            description: "Barcha 5 ta mezon (mahsulot, miqdor, manzil, muddat, narx) yig'ilgandan keyin bozordan mos takliflarni qidirish uchun chaqiriladi.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                product_name: { type: Type.STRING, description: "Qidirilayotgan mahsulot nomi (masalan: Pomidor, Kartoshka, Bug'doy)" },
                quantity: { type: Type.NUMBER, description: "Miqdori (faqat raqam)" },
                location: { type: Type.STRING, description: "Manzil (viloyat yoki shahar)" },
                delivery_date: { type: Type.STRING, description: "Yetkazib berish muddati" },
                target_price: { type: Type.NUMBER, description: "Xaridor xohlagan maqsadli narx" }
              },
              required: ["product_name", "quantity", "location", "delivery_date", "target_price"]
            }
          }]
        }],
        temperature: 0.3,
      }
    });

    const call = response.functionCalls?.[0];
    
    if (call && call.name === 'search_market') {
      const args = call.args;
      
      // We take the first word of the product name for a broader search (e.g., "Kartoshka (Oq)" -> "Kartoshka")
      const searchTerm = (args.product_name as string).split(' ')[0];
      
      const { data: results, error } = await supabase
        .from('listings')
        .select('id, title, price_per_unit, currency, available_quantity, unit, location_region, supplier_id, images, supplier:profiles(company_name, trust_score)')
        .ilike('title', `%${searchTerm}%`)
        .order('price_per_unit', { ascending: true }) // Find cheapest matches
        .limit(4);

      if (error) {
        console.error("Supabase Error:", error);
      }

      return NextResponse.json({
        role: 'model',
        content: `Sizning so'rovingiz bo'yicha bozordagi eng yaxshi takliflarni topdim. Quyida ${args.quantity} ${args.product_name} uchun ${args.location} manziliga yetkazib berish imkoniyati bo'lgan sotuvchilar ro'yxati:`,
        isResults: true,
        results: results || [],
        searchParams: args
      });
    }

    return NextResponse.json({
      role: 'model',
      content: response.text || "Kechirasiz, men sizni tushunmadim.",
      isResults: false
    });

  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
