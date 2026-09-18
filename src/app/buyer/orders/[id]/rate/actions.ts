"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function submitRatingAction(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const orderId = formData.get("orderId") as string;
  const score = Number(formData.get("score"));
  const comment = formData.get("comment") as string;

  if (!orderId || !score) {
    return { error: "Iltimos, baho bering" };
  }

  // 1. Fetch order details to get rater/ratee
  const { data: order } = await supabase.from("orders").select("buyer_id, supplier_id").eq("id", orderId).single();
  if (!order) return { error: "Order not found" };

  // 2. Insert rating
  const { error } = await supabase.from("ratings").insert({
    order_id: orderId,
    rater_id: order.buyer_id,
    ratee_id: order.supplier_id,
    role: "buyer_rates_supplier",
    score,
    comment
  });

  if (error) {
    if (error.code === '23505') {
      return { error: "Siz allaqachon ushbu buyurtmani baholagansiz!" };
    }
    console.error("Failed to submit rating:", error);
    return { error: "Baholashda xatolik yuz berdi" };
  }

  // 3. Update the trust_score of the supplier (simple moving average for MVP)
  // In a real app, this would be a Cron Job.
  const { data: profile } = await supabase.from("profiles").select("trust_score").eq("id", order.supplier_id).single();
  const currentScore = Number(profile?.trust_score || 5.0);
  const newScore = ((currentScore * 4) + score) / 5; // Simplified weighted average
  
  await supabase.from("profiles").update({ trust_score: newScore.toFixed(2) }).eq("id", order.supplier_id);

  redirect("/buyer/orders");
}
