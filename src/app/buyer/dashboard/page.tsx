import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function BuyerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/register");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, kyb_status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "buyer") redirect("/register");

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
            { label: "Faol so'rovlar", value: "0", icon: "📋" },
            { label: "Faol buyurtmalar", value: "0", icon: "📦" },
            { label: "Tugallangan", value: "0", icon: "✅" },
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
            <a href="/buyer/rfq/new" className="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Yangi so'rov yaratish
            </a>
            <a href="/listings" className="btn btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Mahsulotlarni ko&apos;rish
            </a>
            <a href="/buyer/rfq" className="btn btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              So&apos;rovlarim
            </a>
          </div>
        </div>

        {/* Coming soon notice */}
        <div className="empty-state" style={{ marginTop: 40 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <p style={{ fontSize: "15px", fontWeight: 600 }}>Keyingi bosqichlarda to&apos;liq funksionallik qo&apos;shiladi</p>
          <p style={{ fontSize: "13px" }}>Phase 7–11 da so&apos;rovlar, taklif va buyurtma tizimi ishga tushadi</p>
        </div>

      </div>
    </main>
  );
}
