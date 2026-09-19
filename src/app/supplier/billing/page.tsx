import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function SupplierBillingPage() {
  const supabase = await createClient();

  // Temporary mock ID to bypass auth for MVP
  const mockSupplierId = "22222222-2222-2222-2222-222222222222"; 
  const { data: profile } = await supabase.from("profiles").select("id").eq("role", "supplier").limit(1).single();
  const supplierId = profile?.id || mockSupplierId;

  const { data: ledgerEntries } = await supabase
    .from("financial_ledger")
    .select(`
      *,
      order:orders!order_id(listing_id, listings(title))
    `)
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false });

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", minHeight: "100dvh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Moliya va Hisob-kitoblar</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
            e-Bozor platformasi orqali sotilgan mahsulotlar va komissiya to'lovlari
          </p>
        </div>
        <Link href="/supplier/dashboard" className="btn btn-secondary">Orqaga</Link>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--color-bg-surface)", borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
              <th style={{ padding: "16px 20px" }}>ID / Sana</th>
              <th style={{ padding: "16px 20px" }}>Buyurtma (GMV)</th>
              <th style={{ padding: "16px 20px" }}>Platforma Komissiyasi (2%)</th>
              <th style={{ padding: "16px 20px" }}>Holat</th>
            </tr>
          </thead>
          <tbody>
            {ledgerEntries?.map(entry => (
              <tr key={entry.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ fontWeight: 600 }}>{entry.invoice_number || "Hali shakllanmagan"}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{new Date(entry.created_at).toLocaleDateString()}</div>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  {Number(entry.gmv).toLocaleString()} UZS
                </td>
                <td style={{ padding: "16px 20px", fontWeight: 700, color: "var(--color-accent-light)" }}>
                  {Number(entry.commission_amount).toLocaleString()} UZS
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <span className={`badge ${entry.payment_status === 'paid' ? 'badge-success' : entry.payment_status === 'invoiced' ? 'badge-warning' : 'badge-gray'}`} style={{ textTransform: "capitalize" }}>
                    {entry.payment_status === 'pending' ? "Kutilmoqda" : entry.payment_status === 'invoiced' ? "To'lov kutilmoqda" : "To'landi"}
                  </span>
                </td>
              </tr>
            ))}
            {(!ledgerEntries || ledgerEntries.length === 0) && (
              <tr>
                <td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                  Hali hisob-kitoblar mavjud emas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
