"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email va parol kiritilishi shart." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check role and redirect
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profile?.role === "supplier") {
    redirect("/supplier/dashboard");
  } else if (profile?.role === "buyer") {
    redirect("/buyer/dashboard");
  } else if (profile?.role === "admin") {
    redirect("/admin/dashboard");
  } else {
    redirect("/");
  }
}
