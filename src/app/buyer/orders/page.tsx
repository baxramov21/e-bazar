import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { confirmReceiptAction, completeOrderAction } from "./actions";

export default async function BuyerOrdersPage() {
  const supabase = await createClient();

  const mockBuyerId = "11111111-1111-1111-1111-111111111111"; 
  const { data: profile } = await supabase.from("profiles").select("id").limit(1).single();
  const buyerId = profile?.id || mockBuyerId;

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      supplier:profiles!supplier_id(company_name, full_name),
      listing:listings!listing_id(title)
    `)
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", minHeight: "100dvh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Mening Buyurtmalarim</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
            Sotib olingan va tasdiqlangan mahsulotlar
          </p>
        </div>
        <Link href="/buyer/dashboard" className="btn btn-secondary">Orqaga</Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {orders?.map((order) => (
          <div key={order.id} className="card hover-glow" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  Buyurtma: {order.listing?.title || "Mahsulot"}
                </h3>
                {order.status === "pending" && <span className="badge badge-gray">Yetkazib beruvchi tasdig'i kutilmoqda</span>}
                {order.status === "in_delivery" && <span className="badge" style={{ background: "rgba(59,130,246,0.1)", color: "var(--color-accent-light)" }}>Yo'lda (Yetkazilmoqda)</span>}
                {order.status === "delivered" && <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "var(--color-success)" }}>Yetkazib berildi</span>}
                {order.status === "completed" && <span className="badge" style={{ background: "var(--color-success)", color: "white" }}>Bajarildi</span>}
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                <span>Sotuvchi: {order.supplier?.company_name || order.supplier?.full_name}</span>
                <span>Miqdor: {order.quantity} {order.unit}</span>
                <span>Manzil: {order.delivery_address}</span>
                <span>Jami summa: {Number(order.gmv).toLocaleString()} UZS</span>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {order.status === "in_delivery" && (
                <form action={confirmReceiptAction.bind(null, order.id)}>
                  <button type="submit" className="btn btn-primary">Mahsulotni qabul qildim</button>
                </form>
              )}
              {order.status === "delivered" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--color-warning)" }}>Sotuvchiga to'lov qildingizmi?</span>
                  <form action={completeOrderAction.bind(null, order.id)}>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%", background: "var(--color-success)" }}>Ha, to'lovni tasdiqlayman</button>
                  </form>
                </div>
              )}
              {order.status === "completed" && (
                <Link href={`/buyer/orders/${order.id}/rate`} className="btn btn-secondary">Baho berish</Link>
              )}
            </div>
          </div>
        ))}

        {(!orders || orders.length === 0) && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--color-text-muted)", background: "var(--color-bg-surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-border)" }}>
            Hali buyurtmalar yo'q.
          </div>
        )}
      </div>
    </main>
  );
}
