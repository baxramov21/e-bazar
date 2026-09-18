"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

import { runScoringEngine } from "@/lib/scoring";

export async function createRfqAction(prevState: any, formData: FormData) {
  const supabase = await createClient();

  // Temporary mock ID for the MVP since auth is bypassed.
  // In a real app, we would get this from supabase.auth.getUser()
  const mockBuyerId = "11111111-1111-1111-1111-111111111111"; // We need a real ID here.
  
  // Let's get the FIRST profile from the DB to use as the buyer_id
  const { data: profile } = await supabase.from("profiles").select("id").limit(1).single();
  const buyerId = profile?.id || mockBuyerId;

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const requested_quantity = Number(formData.get("requested_quantity"));
  const unit = formData.get("unit") as string;
  const budget_per_unit = Number(formData.get("budget_per_unit"));
  const destination_region = formData.get("destination_region") as string;
  const urgency_level = formData.get("urgency_level") as string;

  if (!title || !category || !requested_quantity || !unit || !destination_region) {
    return { error: "Iltimos, barcha majburiy maydonlarni to'ldiring." };
  }

  const { data, error } = await supabase.from("purchase_requests").insert({
    buyer_id: buyerId,
    title,
    category,
    requested_quantity,
    unit,
    budget_per_unit,
    destination_region,
    urgency_level
  }).select("id").single();

  if (error || !data) {
    console.error("Insert error:", error);
    return { error: "Xatolik yuz berdi. Qaytadan urinib ko'ring." };
  }

  // Run the scoring engine asynchronously in the background
  runScoringEngine(data.id).catch(console.error);

  redirect("/buyer/rfq");
}
