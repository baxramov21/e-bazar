import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import { markOrderShippedAction } from "./actions";

export default async function SupplierOrdersPage() {
  const supabase = await createClient();

  // Temporary mock ID to bypass auth for MVP
  const mockSupplierId = "22222222-2222-2222-2222-222222222222"; 
  const { data: profile } = await supabase.from("profiles").select("id").eq("role", "supplier").limit(1).single();
  const supplierId = profile?.id || mockSupplierId;

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      buyer:profiles!buyer_id(full_name, company_name),
      listing:listings!listing_id(title)
    `)
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false });

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", minHeight: "100dvh" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
        <div>
          <BackButton fallback="/supplier/dashboard" />
        </div>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Kelayotgan Buyurtmalar</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
            Mijozlardan tushgan xarid buyurtmalari
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {orders?.map((order) => (
          <div key={order.id} className="card hover-glow" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                  Buyurtma: {order.listing?.title || "Mahsulot"}
                </h3>
                {order.status === "pending" && <span className="badge badge-gray">Kutilmoqda</span>}
                {order.status === "in_delivery" && <span className="badge" style={{ background: "rgba(59,130,246,0.1)", color: "var(--color-accent-light)" }}>Yetkazilmoqda</span>}
                {order.status === "delivered" && <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "var(--color-success)" }}>Yetkazib berildi</span>}
                {order.status === "completed" && <span className="badge" style={{ background: "var(--color-success)", color: "white" }}>Bajarildi</span>}
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 24px" }}>
                <span>Mijoz: {order.buyer?.company_name || order.buyer?.full_name}</span>
                <span>Miqdor: {order.quantity} {order.unit}</span>
                <span>Manzil: {order.delivery_address}</span>
                <span>Jami summa: {Number(order.gmv).toLocaleString()} UZS</span>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {order.status === "pending" && (
                <form action={markOrderShippedAction.bind(null, order.id)}>
                  <button type="submit" className="btn btn-primary">Jo'natildi deb belgilash</button>
                </form>
              )}
              {order.status === "in_delivery" && (
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>Mijoz tasdiqlashi kutilmoqda</span>
              )}
              {order.status === "delivered" && (
                <span style={{ fontSize: "0.85rem", color: "var(--color-success)" }}>To'lov kutilmoqda</span>
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
