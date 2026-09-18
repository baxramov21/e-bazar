import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { selectOfferAction } from "./actions";

export default async function RfqDetailPage({ params }: { params: any }) {
  const supabase = await createClient();
  const { id } = await params;

  const { data: rfq } = await supabase
    .from("purchase_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!rfq) {
    notFound();
  }

  // Fetch matches if status is matched
  let matches: any[] = [];
  if (rfq.status === "matched") {
    const { data } = await supabase
      .from("match_results")
      .select(`
        *,
        supplier:profiles!supplier_id(company_name, trust_score),
        listing:listings!listing_id(title, price_per_unit, delivery_days)
      `)
      .eq("purchase_request_id", rfq.id)
      .order("score_total", { ascending: false });
    
    if (data) matches = data;
  }

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", maxWidth: 800 }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{rfq.title}</h1>
            <span className="badge badge-gray" style={{ textTransform: "capitalize" }}>{rfq.status}</span>
          </div>
          <p style={{ color: "var(--color-text-muted)" }}>ID: {rfq.id}</p>
        </div>
        <Link href="/buyer/rfq" className="btn btn-secondary btn-sm">Orqaga</Link>
      </div>

      <div className="card" style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16 }}>Talabnoma tafsilotlari</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, color: "var(--color-text-secondary)" }}>
          <div>
            <span style={{ display: "block", fontSize: "0.85rem", marginBottom: 4 }}>Kategoriya</span>
            <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{rfq.category}</span>
          </div>
          <div>
            <span style={{ display: "block", fontSize: "0.85rem", marginBottom: 4 }}>Miqdor</span>
            <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{rfq.requested_quantity} {rfq.unit}</span>
          </div>
          <div>
            <span style={{ display: "block", fontSize: "0.85rem", marginBottom: 4 }}>Yetkazish hududi</span>
            <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{rfq.destination_region}</span>
          </div>
          <div>
            <span style={{ display: "block", fontSize: "0.85rem", marginBottom: 4 }}>Shoshilinchlik</span>
            <span style={{ color: "var(--color-text-primary)", fontWeight: 600, textTransform: "capitalize" }}>{rfq.urgency_level}</span>
          </div>
          {rfq.budget_per_unit && (
            <div>
              <span style={{ display: "block", fontSize: "0.85rem", marginBottom: 4 }}>Byudjet (1 birlik uchun)</span>
              <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{Number(rfq.budget_per_unit).toLocaleString()} UZS</span>
            </div>
          )}
        </div>
      </div>

      {rfq.status === "open" && (
        <div className="empty-state">
          <div className="spinner" style={{ marginBottom: 16 }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 8 }}>Sun'iy intellekt ishlamoqda...</h3>
          <p style={{ color: "var(--color-text-muted)" }}>
            Sizning talabnomangiz bo'yicha eng yaxshi yetkazib beruvchilar qidirilmoqda. Natijalar tez orada paydo bo'ladi.
          </p>
        </div>
      )}

      {rfq.status === "matched" && (
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16 }}>Tavsiya etilgan takliflar</h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {matches.map((match: any, index: number) => (
              <div key={match.id} className="card hover-glow" style={{ position: "relative", overflow: "hidden" }}>
                {index === 0 && (
                  <div style={{ position: "absolute", top: 0, right: 0, background: "var(--color-success)", color: "white", padding: "4px 12px", fontSize: "0.75rem", fontWeight: 700, borderBottomLeftRadius: "var(--radius-md)" }}>
                    Eng yaxshi moslik
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                      {match.supplier?.company_name}
                    </h3>
                    <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginTop: 4 }}>
                      Reyting: {match.supplier?.trust_score}/5 • {match.listing?.delivery_days} kunda yetkaziladi
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-accent-light)" }}>
                      {Number(match.listing?.price_per_unit).toLocaleString()} UZS
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-success)", fontWeight: 600 }}>
                      Moslik: {Math.round(match.score_total * 100)}%
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed var(--color-border)", display: "flex", justifyContent: "flex-end" }}>
                  <form action={selectOfferAction.bind(null, match.id, rfq.id)}>
                    <button type="submit" className="btn btn-primary">Shu taklifni tanlash</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </main>
  );
}
