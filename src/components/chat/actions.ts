"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export async function sendChatMessageAction(prevState: any, formData: FormData) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const order_id = formData.get("order_id") as string;
  const content = formData.get("content") as string;
  const role = formData.get("role") as string;

  if (!order_id || !content || !role) {
    return { error: "Xabar bo'sh bo'lishi mumkin emas." };
  }

  // Get the sender ID based on the role MVP logic
  const { data: profile } = await supabase.from("profiles").select("id").eq("role", role).limit(1).single();
  const fallbackIds: any = {
    buyer: "11111111-1111-1111-1111-111111111111",
    supplier: "22222222-2222-2222-2222-222222222222"
  };
  const sender_id = profile?.id || fallbackIds[role];

  const { error } = await supabase.from("chat_messages").insert({
    order_id,
    sender_id,
    content
  });

  if (error) {
    console.error("Chat message insert error:", error);
    return { error: "Xatolik yuz berdi." };
  }

  revalidatePath(`/${role}/chats/${order_id}`);
  return { success: true };
}

export async function acceptOfferAction(formData: FormData) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  const order_id = formData.get("order_id") as string;
  const accept_terms = formData.get("accept_terms") as string;

  if (!order_id || accept_terms !== "on") {
    console.error("Kelishuv shartlariga rozi bo'lishingiz shart.");
    return;
  }

  const { error } = await supabase.from("orders").update({ status: "confirmed" }).eq("id", order_id);

  if (error) {
    console.error("Accept offer error:", error);
    return;
  }

  // Also add a system message saying the offer was accepted
  await supabase.from("chat_messages").insert({
    order_id,
    sender_id: "22222222-2222-2222-2222-222222222222", // Use the mock supplier ID for MVP
    content: "✅ Sotuvchi taklifingizni va kelishuv shartlarini qabul qildi!"
  });

  revalidatePath(`/supplier/chats/${order_id}`);
  revalidatePath(`/buyer/chats/${order_id}`);
}
