"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function generateMarketPredictionAction(formData: FormData) {
  const query = formData.get("query") as string;
  if (!query) return;

  const supabase = await createClient();
  
  // 1. Get current buyer ID
  const mockBuyerId = "11111111-1111-1111-1111-111111111111"; 
  const { data: profile } = await supabase.from("profiles").select("id").limit(1).single();
  const buyerId = profile?.id || mockBuyerId;

  // 2. Fetch recent market listings to give AI context
  const { data: recentListings } = await supabase
    .from("listings")
    .select("title, price_per_unit, unit")
    .limit(20);

  // 3. Ask Gemini to act as a trading analyst
  const prompt = `
    You are an expert B2B agricultural trading AI for "Bozor-Analitika" in Uzbekistan.
    The buyer is asking for market intelligence regarding: "${query}".
    
    Current market sample data (UZS):
    ${JSON.stringify(recentListings, null, 2)}
    
    Provide a highly detailed "Trading Market Style" report. Include:
    1. Historical context and simulated recent news affecting this product in Uzbekistan (e.g. weather, export bans, fuel prices).
    2. A definitive "prediction_signal" which MUST be exactly one of: "BUY_NOW", "HOLD", or "BUY_LATER".
    3. Volume recommendation: Should they buy more now to stockpile, or buy less?
    
    Return exactly a JSON object with this schema:
    {
      "title": "Short title of the report (e.g. Pomidor Bozori Tahlili)",
      "content": "Detailed 2-3 paragraph analysis in Uzbek language",
      "prediction_signal": "BUY_NOW" | "HOLD" | "BUY_LATER"
    }
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    const prediction = JSON.parse(text);

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Save to buyer_messages table
    if (prediction.title && prediction.content) {
      await supabaseAdmin.from("buyer_messages").insert({
        buyer_id: buyerId,
        title: prediction.title,
        content: prediction.content,
        prediction_signal: prediction.prediction_signal || "HOLD"
      });
    }
  } catch (error: any) {
    console.error("Market Prediction AI failed:", error?.message || error);
    
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fallback if AI fails (e.g. missing API key)
    await supabaseAdmin.from("buyer_messages").insert({
      buyer_id: buyerId,
      title: `${query} bo'yicha tahlil`,
      content: `API xatosi yuz berdi: ${error?.message || 'Nomaʼlum xato'}. Iltimos keyinroq urinib ko'ring yoki .env faylida GEMINI_API_KEY kalitni tekshiring.`,
      prediction_signal: "HOLD"
    });
  }

  // 5. Redirect to messages tab to see the result
  revalidatePath("/buyer/messages");
  redirect("/buyer/messages");
}
