"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function confirmReceiptAction(orderId: string, formData?: FormData) {
  const supabase = await createClient();

  // Mark as delivered
  const { error } = await supabase
    .from("orders")
    .update({ status: "delivered", actual_delivery: new Date().toISOString() })
    .eq("id", orderId);

  if (error) {
    console.error("Failed to mark order as delivered:", error);
    throw new Error("Failed to update order status");
  }

  revalidatePath("/buyer/orders");
}

export async function completeOrderAction(orderId: string, formData?: FormData) {
  const supabase = await createClient();

  // Mark as completed (this triggers the DB trigger to create a financial ledger entry)
  const { error } = await supabase
    .from("orders")
    .update({ status: "completed" })
    .eq("id", orderId);

  if (error) {
    console.error("Failed to complete order:", error);
    throw new Error("Failed to update order status");
  }

  revalidatePath("/buyer/orders");
}
