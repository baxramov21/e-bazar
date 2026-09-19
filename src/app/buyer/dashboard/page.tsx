import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardLineChart, DashboardPieChart } from "@/components/DashboardCharts";
import { Search } from "lucide-react";
import { generateMarketPredictionAction } from "./actions";

export default async function BuyerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = { full_name: "Test Xaridor", role: "buyer", kyb_status: "verified" };
  
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role, kyb_status")
      .eq("id", user.id)
      .single();
    if (data && data.role === "buyer") profile = data;
  }

  // Fetch orders for metrics & charts
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("buyer_id", user?.id || "buyer-placeholder-id"); // In MVP demo, Nazar Usmon will use his actual ID if logged in

  // Fetch RFQs for active count
  const { data: rfqs } = await supabase
    .from("purchase_requests")
    .select("id")
    .eq("buyer_id", user?.id || "buyer-placeholder-id")
    .eq("status", "open");

  const totalGMV = orders?.reduce((sum, order) => sum + Number(order.gmv), 0) || 0;
  const activeRfqs = rfqs?.length || 0;
  const activeOrders = orders?.filter(o => o.status === "pending" || o.status === "in_delivery").length || 0;

  // Process Pie Chart Data (Orders by Status)
  const statusCounts = orders?.reduce((acc: any, order) => {
    const status = order.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  const pieData = statusCounts ? [
    { name: 'Kutilmoqda', value: statusCounts.pending || 0 },
    { name: 'Yetkazilmoqda', value: statusCounts.in_delivery || 0 },
    { name: 'Yetkazilgan', value: statusCounts.delivered || 0 },
    { name: 'Tugallangan', value: statusCounts.completed || 0 },
  ].filter(d => d.value > 0) : [];

  // Process Line Chart Data (Dummy monthly spending)
  const lineData = [
    { name: 'Yanvar', value: totalGMV * 0.1 },
    { name: 'Fevral', value: totalGMV * 0.3 },
    { name: 'Mart', value: totalGMV * 0.5 },
    { name: 'Aprel', value: totalGMV * 0.8 },
    { name: 'May', value: totalGMV * 1.2 },
    { name: 'Iyun', value: totalGMV }
  ];

  return (
    <main style={{ background: "var(--color-bg-base)", minHeight: "100dvh", padding: "40px 24px" }}>
      <div className="page-container">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>
              Xush kelibsiz, {profile.full_name}! 👋
            </h1>
            <p style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
              Xaridor paneli — mahsulot topish va buyurtma berish
            </p>
          </div>
          <span className="badge badge-buyer">Xaridor</span>
        </div>

        {/* KPI Cards placeholder */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Faol so'rovlar", value: activeRfqs.toString(), icon: "📋" },
            { label: "Faol buyurtmalar", value: activeOrders.toString(), icon: "📦" },
            { label: "Umumiy xarajat", value: `${totalGMV.toLocaleString()} UZS`, icon: "💸" },
          ].map((kpi) => (
            <div key={kpi.label} className="metric-card">
              <div style={{ fontSize: "2rem" }}>{kpi.icon}</div>
              <div className="metric-value">{kpi.value}</div>
              <div className="metric-label">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* AI Market Search */}
        <div className="card" style={{ marginBottom: 32, background: "linear-gradient(135deg, rgba(15,23,42,0.8), rgba(30,41,59,0.8))", border: "1px solid var(--color-border)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, background: "var(--color-accent)", opacity: 0.1, filter: "blur(60px)", borderRadius: "50%" }}></div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "var(--color-accent-light)" }}>BozorAI™</span> Tahlili (Market Intelligence)
          </h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 16, fontSize: "0.95rem" }}>
            Mahsulot nomini kiriting va sun'iy intellekt bozor holati, narx tendensiyalari va xarid qilish bo'yicha tavsiya beradi.
          </p>
          <form action={generateMarketPredictionAction} style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--color-text-muted)" }}>
                <Search size={18} />
              </div>
              <input 
                type="text" 
                name="query" 
                placeholder="Masalan: Pomidor bozori qanday bo'ladi? Yoki 'Bug'doy narxi'..." 
                className="input-field" 
                style={{ paddingLeft: 44, width: "100%", height: 50 }}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ height: 50, padding: "0 24px" }}>
              Tahlil qilish
            </button>
          </form>
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 32 }}>
          <DashboardLineChart data={lineData} title="Oylik xarajatlar" />
          <DashboardPieChart data={pieData} title="Buyurtmalar holati" />
        </div>

        {/* Coming soon notice */}
        <div className="empty-state" style={{ marginTop: 16 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <p style={{ fontSize: "15px", fontWeight: 600 }}>Tizim muvaffaqiyatli ishga tushirildi</p>
        </div>

      </div>
    </main>
  );
}
