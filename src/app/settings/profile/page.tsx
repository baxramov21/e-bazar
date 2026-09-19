import { createClient } from "@/lib/supabase/server";
import BackButton from "@/components/BackButton";
import { User, ShieldCheck, Star, Briefcase } from "lucide-react";

export default async function UserProfilePage() {
  const supabase = await createClient();
  
  // Temporary mock ID to bypass auth for MVP
  const mockBuyerId = "11111111-1111-1111-1111-111111111111"; 
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", mockBuyerId).single();

  const userProfile = profile || {
    full_name: "Nazar Usmon",
    company_name: "Baraka Savdo MChJ",
    region: "Samarqand",
    address: "Urgut bozori",
    role: "buyer",
    kyb_status: "verified",
    trust_score: 4.8
  };

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", minHeight: "100dvh" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Mening Profilim</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
            Shaxsiy ma'lumotlar va kompaniya rekvizitlari
          </p>
        </div>
        <BackButton fallback="/buyer/dashboard" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24 }}>
        
        {/* Sidebar / Identity */}
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "40px 24px" }}>
          <div style={{ 
            width: 100, height: 100, borderRadius: "50%", 
            background: "linear-gradient(135deg, var(--color-accent), #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 16
          }}>
            <User size={48} color="white" />
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 4 }}>{userProfile.full_name}</h2>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: 16 }}>{userProfile.company_name}</p>
          
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <span className="badge badge-buyer" style={{ textTransform: "capitalize" }}>{userProfile.role}</span>
            {userProfile.kyb_status === "verified" && (
              <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "var(--color-success)", display: "flex", alignItems: "center", gap: 4 }}>
                <ShieldCheck size={14} />
                Tasdiqlangan
              </span>
            )}
          </div>

          <div style={{ width: "100%", padding: 16, background: "var(--color-bg-base)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>Ishonch reytingi (Trust Score)</span>
              <span style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                {userProfile.trust_score}/5.0
              </span>
            </div>
            <div style={{ height: 6, width: "100%", background: "var(--color-border)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(userProfile.trust_score / 5) * 100}%`, background: "var(--color-accent)" }}></div>
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="card">
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
            <Briefcase size={20} color="var(--color-text-muted)" />
            Kompaniya ma'lumotlari
          </h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label className="input-label">To'liq ism-sharif</label>
              <input type="text" className="input-field" defaultValue={userProfile.full_name} disabled />
            </div>
            <div>
              <label className="input-label">Kompaniya nomi</label>
              <input type="text" className="input-field" defaultValue={userProfile.company_name} disabled />
            </div>
            <div>
              <label className="input-label">Hudud</label>
              <input type="text" className="input-field" defaultValue={userProfile.region} disabled />
            </div>
            <div>
              <label className="input-label">Manzil</label>
              <input type="text" className="input-field" defaultValue={userProfile.address} disabled />
            </div>
            <div>
              <label className="input-label">Rol</label>
              <input type="text" className="input-field" defaultValue={userProfile.role === 'buyer' ? 'Xaridor' : 'Yetkazib beruvchi'} disabled />
            </div>
          </div>
          
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--color-border)", display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-primary" disabled>
              Saqlash (Tez kunda)
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}
