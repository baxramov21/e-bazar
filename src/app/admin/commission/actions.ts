"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function generateInvoiceAction(ledgerId: string, formData?: FormData) {
  const supabase = await createClient();

  const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { error } = await supabase
    .from("financial_ledger")
    .update({ 
      payment_status: "invoiced",
      invoice_number: invoiceNumber,
      invoiced_at: new Date().toISOString()
    })
    .eq("id", ledgerId);

  if (error) throw new Error("Failed to generate invoice");
  revalidatePath("/admin/commission");
}

export async function markPaidAction(ledgerId: string, formData?: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("financial_ledger")
    .update({ 
      payment_status: "paid",
      paid_at: new Date().toISOString()
    })
    .eq("id", ledgerId);

  if (error) throw new Error("Failed to mark as paid");
  revalidatePath("/admin/commission");
}
