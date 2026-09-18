import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ListingDetailPage({ params }: { params: any }) {
  const supabase = await createClient();
  const { id } = await params;
  
  const { data: listing, error } = await supabase
    .from("listings")
    .select(`
      *,
      supplier:profiles!supplier_id(full_name, company_name, trust_score, kyb_status, address, region)
    `)
    .eq("id", id)
    .single();

  if (error || !listing) {
    notFound();
  }

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", minHeight: "100dvh" }}>
      
      {/* Breadcrumb / Back */}
      <div style={{ marginBottom: 24 }}>
        <Link href="/listings" style={{ color: "var(--color-text-muted)", textDecoration: "none", fontSize: "0.95rem" }}>
          ← Barcha mahsulotlarga qaytish
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
        
        {/* Main Product Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          <div className="card" style={{ padding: 40, background: "var(--color-bg-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)" }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <span className="badge badge-gray">{listing.category}</span>
              {listing.subcategory && <span className="badge badge-gray">{listing.subcategory}</span>}
              {listing.stock_status === "available" ? (
                <span className="badge badge-success">Sotuvda mavjud</span>
              ) : (
                <span className="badge badge-warning">Oz qolgan</span>
              )}
            </div>

            <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
              {listing.title}
            </h1>

            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--color-accent-light)", marginBottom: 32 }}>
              {Number(listing.price_per_unit).toLocaleString()} {listing.currency} 
              <span style={{ fontSize: "1.2rem", color: "var(--color-text-muted)", fontWeight: 500 }}> / {listing.unit}</span>
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 12 }}>Mahsulot haqida</h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "1.05rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {listing.description || "Qo'shimcha ma'lumot kiritilmagan."}
            </p>
          </div>

          <div className="card" style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)" }}>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 20 }}>Texnik va Logistika ma'lumotlari</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 40px" }}>
              <div>
                <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: 4 }}>Eng kam buyurtma (MOQ)</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{listing.moq} {listing.unit}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: 4 }}>Umumiy qoldiq</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{listing.available_quantity} {listing.unit}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: 4 }}>Yuklash hududi</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{listing.location_region}</div>
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: 4 }}>Yetkazib berish vaqti</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>{listing.delivery_days} kun ichida</div>
              </div>
            </div>
            
            {listing.delivery_regions && listing.delivery_regions.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: 8 }}>Yetkazib berish mumkin bo'lgan hududlar</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {listing.delivery_regions.map((region: string) => (
                    <span key={region} className="badge badge-gray">{region}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Sidebar / CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 40 }}>
          
          <div className="card" style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-xl)" }}>
            <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--color-border)" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: 8 }}>
                {listing.supplier?.company_name || listing.supplier?.full_name}
              </div>
              <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", marginBottom: 12 }}>
                {listing.supplier?.region}, {listing.supplier?.address}
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(251,191,36,0.1)", color: "#fbbf24", padding: "4px 8px", borderRadius: "100px", fontSize: "0.85rem", fontWeight: 600 }}>
                  ⭐ {listing.supplier?.trust_score}/5
                </div>
                {listing.supplier?.kyb_status === "verified" && (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(16,185,129,0.1)", color: "var(--color-success)", padding: "4px 8px", borderRadius: "100px", fontSize: "0.85rem", fontWeight: 600 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    Tasdiqlangan
                  </div>
                )}
              </div>
            </div>

            <Link href={`/buyer/rfq/new?category=${encodeURIComponent(listing.category)}&title=${encodeURIComponent(listing.title)}`} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", height: 48, fontSize: "1.05rem" }}>
              Shu mahsulot bo'yicha Xarid So'rovi yaratish
            </Link>
            
            <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", height: 48, marginTop: 12 }}>
              Sotuvchi bilan bog'lanish (Tez kunda)
            </button>
          </div>

        </div>

      </div>
    </main>
  );
}
