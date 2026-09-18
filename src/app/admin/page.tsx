import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const { count: pendingKyb } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("kyb_status", "pending");
  const { count: openOrders } = await supabase.from("orders").select("*", { count: "exact", head: true }).neq("status", "completed");
  
  return (
    <main className="fade-in" style={{ padding: "32px 40px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 24 }}>Admin Boshqaruv Paneli</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>Yangi KYB arizalar</span>
          <span style={{ fontSize: "2rem", fontWeight: 800 }}>{pendingKyb || 0}</span>
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>Jarayondagi buyurtmalar</span>
          <span style={{ fontSize: "2rem", fontWeight: 800 }}>{openOrders || 0}</span>
        </div>
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>Platforma daromadi (Kutilmoqda)</span>
          <span style={{ fontSize: "2rem", fontWeight: 800 }}>0 UZS</span>
        </div>
      </div>
    </main>
  );
}
