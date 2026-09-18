"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function selectOfferAction(matchId: string, rfqId: string) {
  const supabase = await createClient();

  // 1. Mark the match as selected
  const { error: matchError } = await supabase
    .from("match_results")
    .update({ is_selected: true })
    .eq("id", matchId);

  if (matchError) {
    console.error("Failed to select match:", matchError);
    return { error: "Failed to select offer" };
  }

  // 2. Update the RFQ status to ordered
  const { error: rfqError } = await supabase
    .from("purchase_requests")
    .update({ status: "ordered" })
    .eq("id", rfqId);

  if (rfqError) {
    console.error("Failed to update RFQ status:", rfqError);
  }

  revalidatePath(`/buyer/rfq/${rfqId}`);
}
