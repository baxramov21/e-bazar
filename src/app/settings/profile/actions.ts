"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const ProfileSchema = z.object({
  full_name: z.string().min(2, "Kamida 2 ta harf").regex(/^[\p{L}\s'-]+$/u, "Faqat harflar"),
  company_name: z.string().optional(),
  region: z.string().optional(),
  address: z.string().optional(),
});

export type ProfileState = {
  success?: boolean;
  errors?: {
    full_name?: string[];
    company_name?: string[];
    region?: string[];
    address?: string[];
    general?: string[];
  };
};

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { errors: { general: ["Sessiya topilmadi. Qaytadan kiring."] } };
  }

  const raw = {
    full_name: formData.get("full_name") as string,
    company_name: formData.get("company_name") as string,
    region: formData.get("region") as string,
    address: formData.get("address") as string,
  };

  const parsed = ProfileSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      company_name: parsed.data.company_name || null,
      region: parsed.data.region || null,
      address: parsed.data.address || null,
    })
    .eq("id", user.id);

  if (error) {
    return { errors: { general: ["Saqlashda xatolik: " + error.message] } };
  }

  revalidatePath("/settings/profile");
  revalidatePath("/supplier/dashboard");
  revalidatePath("/buyer/dashboard");
  
  return { success: true };
}
