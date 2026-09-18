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
