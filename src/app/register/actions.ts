"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";

const RegisterSchema = z.object({
  firstName: z.string().min(2, "Ism kamida 2 ta harf bo'lishi kerak").regex(/^[\p{L}\s'-]+$/u, "Faqat harflar ishlatilsin"),
  lastName: z.string().min(2, "Familiya kamida 2 ta harf bo'lishi kerak").regex(/^[\p{L}\s'-]+$/u, "Faqat harflar ishlatilsin"),
  role: z.enum(["buyer", "supplier"], { message: "Rolni tanlang" }),
});

export type RegisterState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    role?: string[];
    general?: string[];
  };
};

export async function registerAction(
  _prev: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const raw = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    role: formData.get("role") as string,
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { firstName, lastName, role } = parsed.data;
  const fullName = `${firstName} ${lastName}`.trim();

  const supabase = await createClient();

  // Create anonymous session
  const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
  if (authError || !authData.user) {
    const errorMsg = authError?.message || "Noma'lum xato";
    return { errors: { general: [`Session yaratishda xato: ${errorMsg}`] } };
  }

  // RE-INSTANTIATE client so it uses the newly created session cookies for the INSERT
  const authSupabase = await createClient();

  // Insert profile
  const { error: profileError } = await authSupabase.from("profiles").insert({
    id: authData.user.id,
    full_name: fullName,
    role,
  });

  if (profileError) {
    return { errors: { general: ["Profil yaratishda xato: " + profileError.message] } };
  }

  // Route by role
  if (role === "supplier") {
    redirect("/supplier/dashboard");
  } else {
    redirect("/buyer/dashboard");
  }
}
