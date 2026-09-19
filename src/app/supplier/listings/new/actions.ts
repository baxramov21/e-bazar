"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createListingAction(prevState: any, formData: FormData) {
  const supabase = await createClient();

  const mockSupplierId = "22222222-2222-2222-2222-222222222222"; 
  const { data: profile } = await supabase.from("profiles").select("id").eq("role", "supplier").limit(1).single();
  const supplierId = profile?.id || mockSupplierId;

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const price_per_unit = Number(formData.get("price_per_unit"));
  const currency = formData.get("currency") as string;
  const available_quantity = Number(formData.get("available_quantity"));
  const moq = Number(formData.get("moq"));
  const unit = formData.get("unit") as string;
  const delivery_days = Number(formData.get("delivery_days"));
  const location_region = formData.get("location_region") as string;

  if (!title || !category || !price_per_unit || !currency || !available_quantity || !moq || !unit || !location_region) {
    return { error: "Iltimos, barcha majburiy maydonlarni to'ldiring." };
  }

  const { error } = await supabase.from("listings").insert({
    supplier_id: supplierId,
    title,
    category,
    price_per_unit,
    currency,
    available_quantity,
    moq,
    unit,
    delivery_days,
    location_region,
    is_active: true
  });

  if (error) {
    console.error("Insert error:", error);
    return { error: "Xatolik yuz berdi. Qaytadan urinib ko'ring." };
  }

  redirect("/supplier/listings");
}
