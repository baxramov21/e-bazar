"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function markOrderShippedAction(orderId: string, formData?: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status: "in_delivery" })
    .eq("id", orderId);

  if (error) {
    console.error("Failed to mark order as shipped:", error);
    throw new Error("Failed to update order status");
  }

  revalidatePath("/supplier/orders");
}
