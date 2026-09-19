import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DashboardLineChart, DashboardPieChart } from "@/components/DashboardCharts";

export default async function SupplierDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = { full_name: "Test Yetkazib Beruvchi", role: "supplier", kyb_status: "verified" };
  
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role, kyb_status")
      .eq("id", user.id)
      .single();
    if (data && data.role === "supplier") profile = data;
  }

  const isVerified = profile.kyb_status === "verified";

  // Fetch orders for metrics & charts
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("supplier_id", user?.id || "22222222-2222-2222-2222-222222222222");

  // Fetch listings for active count
  const { data: listings } = await supabase
    .from("listings")
    .select("id")
    .eq("supplier_id", user?.id || "22222222-2222-2222-2222-222222222222")
    .eq("is_active", true);

  const totalGMV = orders?.reduce((sum, order) => sum + Number(order.gmv), 0) || 0;
  const activeListings = listings?.length || 0;
  const pendingOrders = orders?.filter(o => o.status === "pending" || o.status === "in_delivery").length || 0;

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

  // Process Line Chart Data (Dummy monthly GMV for MVP visual since we only seeded a few days)
  const lineData = [
    { name: 'Yanvar', value: totalGMV * 0.2 },
    { name: 'Fevral', value: totalGMV * 0.4 },
    { name: 'Mart', value: totalGMV * 0.7 },
    { name: 'Aprel', value: totalGMV * 1.1 },
    { name: 'May', value: totalGMV * 1.5 },
    { name: 'Iyun', value: totalGMV }
  ];

  return (
    <main style={{ background: "var(--color-bg-base)", minHeight: "100dvh", padding: "40px 24px" }}>
      <div className="page-container">

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>
              Xush kelibsiz, {profile.full_name}! 👋
            </h1>
            <p style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
              Yetkazib beruvchi paneli
            </p>
          </div>
          <span className="badge badge-supplier">Yetkazib Beruvchi</span>
        </div>

        {/* KYB Status Banner */}
        {!isVerified && (
          <div style={{
            background: profile.kyb_status === "rejected"
              ? "rgba(239,68,68,0.1)" : "rgba(245,158,11,0.1)",
            border: `1px solid ${profile.kyb_status === "rejected"
              ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)"}`,
            borderRadius: "var(--radius-lg)",
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}>
            <span style={{ fontSize: "1.5rem" }}>
              {profile.kyb_status === "rejected" ? "❌" : "⏳"}
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: "15px", color: profile.kyb_status === "rejected" ? "var(--color-danger)" : "var(--color-warning)" }}>
                {profile.kyb_status === "rejected"
                  ? "Tekshirish rad etildi"
                  : "Tekshiruv kutilmoqda"}
              </div>
              <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: 2 }}>
                {profile.kyb_status === "rejected"
                  ? "Admin bilan bog'laning. Mahsulot joylashtirishingiz bloklab qo'yilgan."
                  : "Admin sizning ma'lumotlaringizni tekshirmoqda. Mahsulot joylashtirish hozircha mavjud emas."}
              </div>
            </div>
            {profile.kyb_status === "pending" && (
              <Link href="/supplier/kyb" className="btn btn-secondary btn-sm" style={{ marginLeft: "auto", flexShrink: 0 }}>
                Ma&apos;lumot qo&apos;shish
              </Link>
            )}
          </div>
        )}

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            { label: "Faol e'lonlar", value: activeListings.toString(), icon: "📦" },
            { label: "Kelayotgan buyurtmalar", value: pendingOrders.toString(), icon: "🤝" },
            { label: "Umumiy GMV", value: `${totalGMV.toLocaleString()} UZS`, icon: "💰" },
          ].map((kpi) => (
            <div key={kpi.label} className="metric-card">
              <div style={{ fontSize: "2rem" }}>{kpi.icon}</div>
              <div className="metric-value">{kpi.value}</div>
              <div className="metric-label">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 32 }}>
          <DashboardLineChart data={lineData} title="Oylik aylanma (GMV)" />
          <DashboardPieChart data={pieData} title="Buyurtmalar holati" />

        </div>

        <div className="empty-state" style={{ marginTop: 16 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
            <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <p style={{ fontSize: "15px", fontWeight: 600 }}>Tizim muvaffaqiyatli ishga tushirildi</p>
        </div>

      </div>
    </main>
  );
}
