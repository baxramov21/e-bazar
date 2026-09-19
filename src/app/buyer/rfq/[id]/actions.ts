"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";

export async function selectOfferAction(matchId: string, rfqId: string, formData?: FormData) {
  const supabase = await createClient();

  // 1. Fetch RFQ and Match details to create the order
  const { data: rfq } = await supabase.from("purchase_requests").select("*").eq("id", rfqId).single();
  const { data: match } = await supabase.from("match_results").select("*").eq("id", matchId).single();

  if (!rfq || !match) {
    throw new Error("Match or RFQ not found");
  }

  // 2. Insert into orders table
  const { error: orderError } = await supabase.from("orders").insert({
    buyer_id: rfq.buyer_id,
    supplier_id: match.supplier_id,
    purchase_request_id: rfqId,
    match_result_id: matchId,
    listing_id: match.listing_id,
    status: "pending", // Phase 11 state machine starts at pending
    quantity: rfq.requested_quantity,
    unit: rfq.unit,
    price_per_unit: match.offered_price_per_unit || 0,
    delivery_cost: match.estimated_total_cost ? (match.estimated_total_cost - (Number(match.offered_price_per_unit) * Number(rfq.requested_quantity))) : 0,
    delivery_address: rfq.destination_region
  });

  if (orderError) {
    console.error("Failed to create order:", orderError);
    throw new Error("Failed to create order");
  }

  // 3. Mark the match as selected
  await supabase.from("match_results").update({ is_selected: true }).eq("id", matchId);

  // 4. Update the RFQ status to ordered
  await supabase.from("purchase_requests").update({ status: "ordered" }).eq("id", rfqId);

  revalidatePath(`/buyer/rfq/${rfqId}`);
}

export async function runAiMatchingAction(rfqId: string) {
  const supabase = await createClient();

  // 1. Fetch RFQ
  const { data: rfq } = await supabase.from("purchase_requests").select("*").eq("id", rfqId).single();
  if (!rfq) throw new Error("RFQ not found");

  // 2. Fetch all listings matching the category
  const { data: listings } = await supabase
    .from("listings")
    .select("*, profiles!inner(company_name, trust_score)")
    .eq("category", rfq.category);

  let listingsData = listings || [];

  if (listingsData.length === 0) {
    const { data: fallbackListings } = await supabase
      .from("listings")
      .select("*, profiles!inner(company_name, trust_score)")
      .limit(10);
    if (fallbackListings) listingsData = fallbackListings;
  }

  // 3. Fetch buyer's trading history (past purchases & ratings)
  const { data: pastOrders } = await supabase
    .from("orders")
    .select("quantity, unit, supplier_id, listings(title), ratings!ratings_order_id_fkey(score)")
    .eq("buyer_id", rfq.buyer_id)
    .eq("status", "completed");

  const historySummaries = pastOrders?.map(order => 
    `Bought ${order.quantity} ${order.unit} of "${(order.listings as any)?.title}" from Supplier (ID: ${order.supplier_id}). Rating given to supplier: ${(order.ratings as any)?.[0]?.score || "None"}/5.`
  ).join("\n- ") || "No historical purchases.";

  // 4. Ask Gemini to evaluate and score
  const prompt = `
    You are an expert B2B procurement AI for "e-Bozor". Evaluate the following supplier listings against the buyer's RFQ.
    
    Buyer RFQ:
    - Title: ${rfq.title}
    - Category: ${rfq.category}
    - Requested Quantity: ${rfq.requested_quantity} ${rfq.unit}
    - Destination: ${rfq.destination_region}
    - Urgency: ${rfq.urgency_level}
    - Description: ${rfq.description || 'N/A'}
    
    Buyer Trading History (Context):
    - ${historySummaries}
    (Use this history to favor suppliers the buyer has bought from before and rated highly, or penalize if rated poorly.)
    
    Supplier Listings:
    ${JSON.stringify(listingsData.map((l: any) => ({
      id: l.id,
      supplier_id: l.supplier_id,
      title: l.title,
      price_per_unit: l.price_per_unit,
      delivery_cost_per_ton: l.delivery_cost_per_ton,
      trust_score: l.profiles?.trust_score,
      company_name: l.profiles?.company_name,
      delivery_days: l.delivery_days
    })), null, 2)}
    
    Select the top 3 best matching listings. For each, calculate a score between 0.0 and 1.0.
    - score_price: how good the price is.
    - score_delivery: how good the delivery terms are.
    - score_trust: the normalized trust score.
    - score_total: the overall weighted score.
    
    Return exactly a JSON array of the top 3 matches with this exact schema:
    [
      {
        "listing_id": "uuid",
        "supplier_id": "uuid",
        "score_total": 0.95,
        "score_price": 0.9,
        "score_delivery": 0.8,
        "score_trust": 0.98,
        "reasoning": "1 sentence explanation"
      }
    ]
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

    const text = response.text || "[]";
    const topMatches = JSON.parse(text);

    if (Array.isArray(topMatches) && topMatches.length > 0) {
      const matchResults = topMatches.map((match: any) => {
        const listing = listingsData.find((l: any) => l.id === match.listing_id);
        const requestedQty = Number(rfq.requested_quantity) || 1;
        const pricePerUnit = Number(listing?.price_per_unit || 0);
        const deliveryCost = Number(listing?.delivery_cost_per_ton || 0) * (requestedQty / 1000);

        return {
          purchase_request_id: rfq.id,
          supplier_id: match.supplier_id,
          listing_id: match.listing_id,
          score_total: match.score_total,
          score_price: match.score_price,
          score_delivery: match.score_delivery,
          score_trust: match.score_trust,
          estimated_total_cost: (pricePerUnit * requestedQty) + deliveryCost,
          offered_price_per_unit: pricePerUnit
        };
      });

      await supabase.from("match_results").insert(matchResults);
    }
  } catch (error) {
    console.error("AI matching failed:", error);
    // Fallback to heuristic if AI fails (e.g. no API key)
    const fallbackResults = listingsData.slice(0, 3).map((listing: any, index: number) => {
      let score = 0.95 - (index * 0.05);
      const requestedQty = Number(rfq.requested_quantity) || 1;
      const pricePerUnit = Number(listing.price_per_unit);
      const deliveryCost = Number(listing.delivery_cost_per_ton) * (requestedQty / 1000);

      return {
        purchase_request_id: rfq.id,
        supplier_id: listing.supplier_id,
        listing_id: listing.id,
        score_total: score,
        score_price: score + 0.02,
        score_delivery: score - 0.01,
        score_trust: (listing.profiles?.trust_score || 4.5) / 5,
        estimated_total_cost: (pricePerUnit * requestedQty) + deliveryCost,
        offered_price_per_unit: pricePerUnit
      };
    });
    await supabase.from("match_results").insert(fallbackResults);
  }

  // 4. Update RFQ status
  await supabase.from("purchase_requests").update({ status: "matched" }).eq("id", rfq.id);

  revalidatePath(`/buyer/rfq/${rfqId}`);
}
