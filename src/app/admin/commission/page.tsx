import { createClient } from "@/lib/supabase/server";
import { generateInvoiceAction, markPaidAction } from "./actions";

export default async function AdminCommissionPage() {
  const supabase = await createClient();

  const { data: ledgerEntries } = await supabase
    .from("financial_ledger")
    .select(`
      *,
      supplier:profiles!supplier_id(company_name, full_name, phone),
      order:orders!order_id(listing_id, listings(title))
    `)
    .order("created_at", { ascending: false });

  return (
    <main className="fade-in" style={{ padding: "32px 40px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 24 }}>Moliya va Komissiya Ledgeri</h1>
      
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--color-bg-surface)", borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
              <th style={{ padding: "16px 20px" }}>ID / Sana</th>
              <th style={{ padding: "16px 20px" }}>Sotuvchi</th>
              <th style={{ padding: "16px 20px" }}>Buyurtma GMV</th>
              <th style={{ padding: "16px 20px" }}>Komissiya (2%)</th>
              <th style={{ padding: "16px 20px" }}>To'lov Holati</th>
              <th style={{ padding: "16px 20px" }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {ledgerEntries?.map(entry => (
              <tr key={entry.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ fontWeight: 600 }}>{entry.invoice_number || "INV-Yo'q"}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{new Date(entry.created_at).toLocaleDateString()}</div>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ fontWeight: 600 }}>{entry.supplier?.company_name || entry.supplier?.full_name}</div>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  {Number(entry.gmv).toLocaleString()} UZS
                </td>
                <td style={{ padding: "16px 20px", fontWeight: 700, color: "var(--color-accent-light)" }}>
                  {Number(entry.commission_amount).toLocaleString()} UZS
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <span className={`badge ${entry.payment_status === 'paid' ? 'badge-success' : entry.payment_status === 'invoiced' ? 'badge-warning' : 'badge-gray'}`} style={{ textTransform: "capitalize" }}>
                    {entry.payment_status}
                  </span>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {entry.payment_status === "pending" && (
                      <form action={generateInvoiceAction.bind(null, entry.id)}>
                        <button type="submit" className="btn btn-primary btn-sm">Invoys yaratish</button>
                      </form>
                    )}
                    {entry.payment_status === "invoiced" && (
                      <form action={markPaidAction.bind(null, entry.id)}>
                        <button type="submit" className="btn btn-secondary btn-sm" style={{ color: "var(--color-success)", borderColor: "var(--color-success)" }}>To'landi</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {(!ledgerEntries || ledgerEntries.length === 0) && (
              <tr>
                <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                  Moliya yozuvlari topilmadi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
