import { createClient } from "@/lib/supabase/server";

export async function runScoringEngine(purchaseRequestId: string) {
  const supabase = await createClient();

  // 1. Fetch the RFQ
  const { data: rfq, error: rfqError } = await supabase
    .from("purchase_requests")
    .select("*")
    .eq("id", purchaseRequestId)
    .single();

  if (rfqError || !rfq) {
    console.error("Failed to fetch RFQ for scoring:", rfqError);
    return;
  }

  // 2. Fetch eligible listings
  // 80% tolerance on quantity
  const minQty = Number(rfq.requested_quantity) * 0.8;
  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select(`
      *,
      supplier:profiles!supplier_id(company_name, trust_score, kyb_status)
    `)
    .eq("category", rfq.category)
    .eq("is_active", true)
    .gte("available_quantity", minQty);

  if (listingsError || !listings || listings.length === 0) {
    console.log("No eligible listings found for RFQ", purchaseRequestId);
    return;
  }

  // Calculate min/max for normalization
  let minCost = Infinity;
  let maxCost = -Infinity;
  
  listings.forEach(l => {
    // simplified total cost = price_per_unit * requested_qty + (delivery_cost_per_ton * requested_qty)
    const cost = (Number(l.price_per_unit) * Number(rfq.requested_quantity)) + (Number(l.delivery_cost_per_ton) * Number(rfq.requested_quantity));
    if (cost < minCost) minCost = cost;
    if (cost > maxCost) maxCost = cost;
  });

  if (minCost === maxCost) {
    maxCost = minCost + 1; // prevent division by zero
  }

  // 3. Score each listing
  const scoredMatches = listings.map(listing => {
    // 3.1 Cost Score (35%)
    const cost = (Number(listing.price_per_unit) * Number(rfq.requested_quantity)) + (Number(listing.delivery_cost_per_ton) * Number(rfq.requested_quantity));
    const cost_score = (maxCost - cost) / (maxCost - minCost);

    // 3.2 Quantity Score (25%)
    const qty_ratio = Number(listing.available_quantity) / Number(rfq.requested_quantity);
    const qty_score = Math.min(qty_ratio, 1.0);

    // 3.3 Delivery Compatibility (15%)
    const region_match = listing.delivery_regions?.includes(rfq.destination_region) || listing.delivery_regions?.includes("Barcha viloyatlar") ? 1 : 0;
    const delivery_score = (region_match * 0.6) + 0.4; // Simplified: 0.4 buffer

    // 3.4 Trust Score (15%)
    const trust_score_val = Number(listing.supplier?.trust_score || 0);
    const trust_score = trust_score_val / 5.0;

    // 3.5 Freshness Score (10%)
    const updated = new Date(listing.price_updated_at).getTime();
    const staleness_hours = (Date.now() - updated) / (1000 * 60 * 60);
    const freshness_score = Math.max(0, 1 - (staleness_hours / 168)); // 1 week

    const score_total = (cost_score * 0.35) + (qty_score * 0.25) + (delivery_score * 0.15) + (trust_score * 0.15) + (freshness_score * 0.10);

    return {
      purchase_request_id: rfq.id,
      listing_id: listing.id,
      supplier_id: listing.supplier_id,
      score_total: Number(score_total.toFixed(4)),
      score_cost: Number(cost_score.toFixed(4)),
      score_quantity: Number(qty_score.toFixed(4)),
      score_delivery: Number(delivery_score.toFixed(4)),
      score_trust: Number(trust_score.toFixed(4)),
      score_freshness: Number(freshness_score.toFixed(4)),
      offered_price_per_unit: listing.price_per_unit,
      offered_quantity: listing.available_quantity,
      estimated_delivery_days: listing.delivery_days,
      estimated_total_cost: cost,
      recommendation_uz: `${listing.supplier?.company_name} tavsiya etiladi: eng yaxshi narxlardan biri, reyting ${trust_score_val}/5.`,
      recommendation_ru: `Рекомендуем ${listing.supplier?.company_name}: одна из лучших цен, рейтинг ${trust_score_val}/5.`,
    };
  });

  // 4. Rank and limit to top 10
  scoredMatches.sort((a, b) => b.score_total - a.score_total);
  const topMatches = scoredMatches.slice(0, 10).map((m, idx) => ({ ...m, rank: idx + 1 }));

  // 5. Insert into match_results
  const { error: insertError } = await supabase.from("match_results").insert(topMatches);

  if (insertError) {
    console.error("Failed to insert match results:", insertError);
    return;
  }

  // 6. Update RFQ status to 'matched'
  await supabase
    .from("purchase_requests")
    .update({ status: "matched" })
    .eq("id", rfq.id);
}
