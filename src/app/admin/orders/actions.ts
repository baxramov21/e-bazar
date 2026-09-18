"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function adminCancelOrderAction(orderId: string, formData?: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId);

  if (error) throw new Error("Failed to cancel order");
  revalidatePath("/admin/orders");
}
