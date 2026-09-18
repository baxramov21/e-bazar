"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

  // 2. Fetch 3 listings matching the category
  const { data: listings } = await supabase
    .from("listings")
    .select("*, profiles!inner(trust_score)")
    .eq("category", rfq.category)
    .limit(3);

  let listingsData = listings || [];

  if (listingsData.length === 0) {
    // If no exact match, just get any 3 listings for the MVP demo
    const { data: fallbackListings } = await supabase
      .from("listings")
      .select("*, profiles!inner(trust_score)")
      .limit(3);
    
    if (fallbackListings) listingsData = fallbackListings;
  }

  // 3. Generate match results
  if (listingsData.length > 0) {
    const matchResults = listingsData.map((listing: any, index: number) => {
      // Calculate a dummy AI score based on trust_score and price
      let score = 0.95 - (index * 0.05); // e.g. 95%, 90%, 85%
      
      const requestedQty = Number(rfq.requested_quantity) || 1;
      const pricePerUnit = Number(listing.price_per_unit);
      const deliveryCost = Number(listing.delivery_cost_per_ton) * (requestedQty / 1000); // rough calc

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

    await supabase.from("match_results").insert(matchResults);
  }

  // 4. Update RFQ status
  await supabase.from("purchase_requests").update({ status: "matched" }).eq("id", rfq.id);

  revalidatePath(`/buyer/rfq/${rfqId}`);
}
