"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function verifyKybAction(profileId: string, status: "verified" | "rejected") {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ kyb_status: status })
    .eq("id", profileId);

  if (error) {
    console.error("Failed to verify KYB:", error);
    throw new Error("Failed to verify KYB");
  }

  revalidatePath("/admin/kyb");
}
