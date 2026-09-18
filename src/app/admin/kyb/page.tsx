import { createClient } from "@/lib/supabase/server";
import { verifyKybAction } from "./actions";

export default async function AdminKybPage() {
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "supplier")
    .in("kyb_status", ["pending", "rejected"])
    .order("created_at", { ascending: false });

  return (
    <main className="fade-in" style={{ padding: "32px 40px" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 24 }}>Yetkazib beruvchilar (KYB) Queue</h1>
      
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--color-bg-surface)", borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
              <th style={{ padding: "16px 20px" }}>Kompaniya</th>
              <th style={{ padding: "16px 20px" }}>TIN (STIR)</th>
              <th style={{ padding: "16px 20px" }}>Manzil</th>
              <th style={{ padding: "16px 20px" }}>Holat</th>
              <th style={{ padding: "16px 20px" }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map(profile => (
              <tr key={profile.id} style={{ borderBottom: "1px solid var(--color-border)" }}>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ fontWeight: 600 }}>{profile.company_name}</div>
                  <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{profile.full_name}</div>
                </td>
                <td style={{ padding: "16px 20px" }}>{profile.tin || "Kiritilmagan"}</td>
                <td style={{ padding: "16px 20px" }}>{profile.address}, {profile.region}</td>
                <td style={{ padding: "16px 20px" }}>
                  {profile.kyb_status === "pending" ? <span className="badge badge-gray">Kutilmoqda</span> : <span className="badge" style={{ color: "var(--color-danger)", background: "rgba(239,68,68,0.1)" }}>Rad etilgan</span>}
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <form action={verifyKybAction.bind(null, profile.id, "verified")}>
                      <button type="submit" className="btn btn-primary btn-sm">Tasdiqlash</button>
                    </form>
                    {profile.kyb_status === "pending" && (
                      <form action={verifyKybAction.bind(null, profile.id, "rejected")}>
                        <button type="submit" className="btn btn-secondary btn-sm">Rad etish</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {(!profiles || profiles.length === 0) && (
              <tr>
                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "var(--color-text-muted)" }}>
                  Navbatda arizalar yo'q.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
