import { createClient } from "@/lib/supabase/server";
import { adminCancelOrderAction } from "./actions";

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      buyer:profiles!buyer_id(company_name, full_name, phone),
      supplier:profiles!supplier_id(company_name, full_name, phone),
      listing:listings!listing_id(title)
    `)
    .order("created_at", { ascending: false });

  return (
    <main className="fade-in" style={{ padding: "32px 40px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 24 }}>Buyurtmalar nazorati</h1>
      
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--color-bg-surface)", borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
              <th style={{ padding: "16px 20px" }}>ID / Maxsulot</th>
              <th style={{ padding: "16px 20px" }}>Xaridor</th>
              <th style={{ padding: "16px 20px" }}>Sotuvchi</th>
              <th style={{ padding: "16px 20px" }}>Summa (UZS)</th>
              <th style={{ padding: "16px 20px" }}>Holat</th>
              <th style={{ padding: "16px 20px" }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map(order => (
              <tr key={order.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ fontWeight: 600 }}>{order.listing?.title}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{order.id.slice(0, 8)}...</div>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ fontWeight: 600 }}>{order.buyer?.company_name || order.buyer?.full_name}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{order.buyer?.phone || "Tel yo'q"}</div>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ fontWeight: 600 }}>{order.supplier?.company_name || order.supplier?.full_name}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{order.supplier?.phone || "Tel yo'q"}</div>
                </td>
                <td style={{ padding: "16px 20px", fontWeight: 600 }}>
                  {Number(order.gmv).toLocaleString()}
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <span className="badge badge-gray" style={{ textTransform: "capitalize" }}>{order.status}</span>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  {(order.status === "pending" || order.status === "in_delivery") && (
                    <form action={adminCancelOrderAction.bind(null, order.id)}>
                      <button type="submit" className="btn btn-secondary btn-sm" style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)" }}>Bekor qilish</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                  Buyurtmalar topilmadi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
