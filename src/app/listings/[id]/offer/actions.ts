"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function submitOfferAction(prevState: any, formData: FormData) {
  const supabase = await createClient();

  // Temporary mock ID for MVP
  const mockBuyerId = "11111111-1111-1111-1111-111111111111"; 
  const { data: profile } = await supabase.from("profiles").select("id").limit(1).single();
  const buyerId = profile?.id || mockBuyerId;

  const listing_id = formData.get("listing_id") as string;
  const supplier_id = formData.get("supplier_id") as string;
  const quantity = Number(formData.get("quantity"));
  const price_per_unit = Number(formData.get("price_per_unit"));
  const message = formData.get("message") as string;
  const unit = formData.get("unit") as string;
  const delivery_address = formData.get("delivery_address") as string;

  if (!quantity || !price_per_unit || !message || !delivery_address) {
    return { error: "Barcha maydonlarni to'ldirish shart." };
  }

  // 1. Create the pending order
  const { data: order, error: orderError } = await supabase.from("orders").insert({
    buyer_id: buyerId,
    supplier_id,
    listing_id,
    quantity,
    unit,
    price_per_unit,
    delivery_address,
    status: "pending"
  }).select("id").single();

  if (orderError || !order) {
    console.error("Order error:", orderError);
    return { error: "Xatolik yuz berdi." };
  }

  // 2. Insert the initial chat message
  await supabase.from("chat_messages").insert({
    order_id: order.id,
    sender_id: buyerId,
    content: message
  });

  // Redirect to the newly created chat room
  redirect(`/chats/${order.id}`);
}
