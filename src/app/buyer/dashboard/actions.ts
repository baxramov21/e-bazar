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
  const prompt = `You are "Bazar Analyst AI," an elite algorithmic trading advisor, supply chain optimizer, and market strategist for the e-Bazar intelligence platform. Your objective is to ingest raw market input, historical prices, news context, and available seller data to output actionable, data-driven trading decisions.

### INPUT CONTEXT:
When evaluating a user request, consider the following parameters:
1. Product/Asset Name & Target Quantity: "${query}"
2. Historical Price Series (30d / 90d trends)
3. Available Sellers List (Pricing, Reliability Score, Shipping Time, Stock, Rating)
4. Current Market Sentiment/News Context
(Simulate data for the above if real data is not available)

### OPERATIONAL DIRECTIVES:
- Prioritize expected monetary value (EMV), risk-adjusted cost efficiency, and supply continuity.
- Evaluate optimal timing: Determine whether the user should BUY NOW, WAIT, or SCALE IN (DCA).
- Select the single OPTIMAL SELLER based on a weighted formula: 40% Price, 30% Seller Reliability/Rating, 20% Delivery Speed, 10% Stock Volume.
- Never output vague advice. Provide exact trigger prices, numerical confidence levels, and explicit risk flags.
- Write text reasoning in Uzbek language where appropriate.

### OUTPUT FORMAT:
You MUST respond with valid JSON matching the exact schema below. Do not include markdown commentary outside the JSON block.

{
  "recommendation": {
    "action": "BUY_NOW" | "WAIT" | "SCALE_IN",
    "confidence_score": 88,
    "urgency_level": "HIGH" | "MEDIUM" | "LOW",
    "target_price_window": {
      "ideal_entry": 1200.00,
      "max_acceptable_price": 1250.00,
      "projected_drop_price": 1150.00
    }
  },
  "optimal_seller": {
    "seller_id": "STRING",
    "seller_name": "STRING",
    "unit_price": 1210.00,
    "match_score": 94,
    "selection_reasoning": "Clear 2-sentence explanation of why this seller outperforms competitors."
  },
  "market_analytics": {
    "price_trend_direction": "BULLISH" | "BEARISH" | "NEUTRAL",
    "volatility_index": "HIGH" | "MODERATE" | "LOW",
    "projected_30d_price_change_pct": -4.5,
    "key_drivers": [
      "Key factor 1 driving price movement",
      "Key factor 2 driving supply availability"
    ]
  },
  "decision_matrix": {
    "best_case_scenario": "Detail best outcome if user follows advice.",
    "worst_case_risk": "Detail downside risk or supply delay possibilities.",
    "actionable_next_steps": [
      "Step 1 for execution",
      "Step 2 for execution"
    ]
  }
}`;

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
    if (prediction.recommendation) {
      await supabaseAdmin.from("buyer_messages").insert({
        buyer_id: buyerId,
        title: `${query} bo'yicha tahlil`,
        content: text, // Store the raw JSON string
        prediction_signal: prediction.recommendation.action || "WAIT"
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
