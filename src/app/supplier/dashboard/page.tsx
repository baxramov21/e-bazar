import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

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
            { label: "Faol e'lonlar", value: "0", icon: "📦" },
            { label: "Kelayotgan buyurtmalar", value: "0", icon: "🤝" },
            { label: "Umumiy GMV", value: "0 UZS", icon: "💰" },
          ].map((kpi) => (
            <div key={kpi.label} className="metric-card">
              <div style={{ fontSize: "2rem" }}>{kpi.icon}</div>
              <div className="metric-value">{kpi.value}</div>
              <div className="metric-label">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="card">
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 16 }}>Tezkor amallar</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
            <Link
              href={isVerified ? "/supplier/listings/new" : "#"}
              className={`btn ${isVerified ? "btn-primary" : "btn-secondary"}`}
              style={!isVerified ? { opacity: 0.5, cursor: "not-allowed" } : {}}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              E&apos;lon qo&apos;shish {!isVerified && "(bloklangan)"}
            </Link>
            <Link href="/supplier/listings" className="btn btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              Mahsulotlarim
            </Link>
            <Link href="/supplier/orders" className="btn btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              Buyurtmalar ({ordersCount})
            </Link>
            <Link href="/settings/profile" className="btn btn-ghost" style={{ border: "1px dashed var(--color-border)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Sozlamalar
            </Link>
          </div>
        </div>

        <div className="empty-state" style={{ marginTop: 40 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
            <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
            <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <p style={{ fontSize: "15px", fontWeight: 600 }}>Phase 6–7 da KYB va e&apos;lon tizimi qo&apos;shiladi</p>
        </div>

      </div>
    </main>
  );
}
