import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function BuyerRfqPage() {
  const supabase = await createClient();

  // Temporary mock ID to bypass auth for MVP
  // In reality: const { data: { user } } = await supabase.auth.getUser();
  const mockBuyerId = "11111111-1111-1111-1111-111111111111"; 
  const { data: profile } = await supabase.from("profiles").select("id").limit(1).single();
  const buyerId = profile?.id || mockBuyerId;

  const { data: rfqs } = await supabase
    .from("purchase_requests")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", minHeight: "100dvh" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Xarid So'rovlarim (RFQ)</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
            Siz qoldirgan barcha talabnomalar va ularning holati
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/buyer/dashboard" className="btn btn-secondary">Orqaga</Link>
          <Link href="/buyer/rfq/new" className="btn btn-primary">
            + Yangi so'rov
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {rfqs?.map((rfq) => (
          <div key={rfq.id} className="card hover-glow" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{rfq.title}</h3>
                {rfq.status === "open" && <span className="badge badge-gray">Ochiq</span>}
                {rfq.status === "matched" && <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "var(--color-success)" }}>Mos keldi!</span>}
                {rfq.status === "ordered" && <span className="badge" style={{ background: "rgba(59,130,246,0.1)", color: "var(--color-accent-light)" }}>Buyurtma qilindi</span>}
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", display: "flex", gap: 16 }}>
                <span>Miqdor: {rfq.requested_quantity} {rfq.unit}</span>
                <span>Byudjet: {rfq.budget_per_unit ? `${Number(rfq.budget_per_unit).toLocaleString()} UZS` : "Kelishuv asosida"}</span>
                <span>Hudud: {rfq.destination_region}</span>
              </div>
            </div>
            
            {rfq.status === "matched" ? (
              <Link href={`/buyer/rfq/${rfq.id}`} className="btn btn-secondary btn-sm">
                Takliflarni ko'rish
              </Link>
            ) : (
              <button className="btn btn-secondary btn-sm" disabled>
                Kutilmoqda...
              </button>
            )}
          </div>
        ))}

        {(!rfqs || rfqs.length === 0) && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--color-text-muted)", background: "var(--color-bg-surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-border)" }}>
            Hali xarid so'rovlari qoldirmagansiz.
          </div>
        )}
      </div>

    </main>
  );
}
