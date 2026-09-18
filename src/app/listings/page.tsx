import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import BackButton from "@/components/BackButton";

export default async function ListingsPage({ searchParams }: { searchParams: Promise<{ q?: string, category?: string }> }) {
  const supabase = await createClient();
  
  const resolvedParams = await searchParams;
  const q = resolvedParams.q || "";
  const category = resolvedParams.category || "";

  // Base query
  let query = supabase
    .from("listings")
    .select(`
      *,
      supplier:profiles!supplier_id(full_name, company_name, trust_score, kyb_status)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Apply filters if present
  if (q) {
    query = query.ilike("title", `%${q}%`);
  }
  if (category) {
    query = query.eq("category", category);
  }

  const { data: listings, error } = await query;

  if (error) {
    console.error("Error fetching listings:", error);
  }

  const categories = [
    "Qishloq xo'jaligi", "Sabzavotlar", "Sanoat", "Oziq-ovqat", "Meva-sabzavot", "Qurilish"
  ];

  return (
    <main className="page-container" style={{ padding: "40px 24px", minHeight: "100dvh" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Barcha Mahsulotlar</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
            O'zbekiston bo'ylab yetkazib beruvchilarning eng so'nggi takliflari
          </p>
        </div>
        <BackButton fallback="/" />
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ marginBottom: 32, padding: "20px 24px" }}>
        <form style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 300px" }}>
            <input 
              type="text" 
              name="q" 
              defaultValue={q}
              placeholder="Mahsulot nomini qidiring (masalan, Sement)..." 
              className="input"
            />
          </div>
          <div style={{ flex: "0 0 250px" }}>
            <select name="category" defaultValue={category} className="input">
              <option value="">Barcha kategoriyalar</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ flex: "0 0 auto" }}>Izlash</button>
          
          {(q || category) && (
            <Link href="/listings" className="btn btn-ghost" style={{ flex: "0 0 auto" }}>
              Tozalash
            </Link>
          )}
        </form>
      </div>

      {/* Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
        gap: 24 
      }}>
        {listings?.map((item: any) => (
          <div key={item.id} className="card hover-glow" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            
            {/* Category badge & Status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="badge badge-gray">{item.category}</span>
              {item.stock_status === "available" ? (
                <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "var(--color-success)" }}>Mavjud</span>
              ) : (
                <span className="badge" style={{ background: "rgba(245,158,11,0.1)", color: "var(--color-warning)" }}>Oz qolgan</span>
              )}
            </div>

            {/* Title & Price */}
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 8, lineHeight: 1.3 }}>
                {item.title}
              </h3>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-accent-light)" }}>
                {Number(item.price_per_unit).toLocaleString()} {item.currency} 
                <span style={{ fontSize: "0.9rem", color: "var(--color-text-muted)", fontWeight: 500 }}> / {item.unit}</span>
              </div>
            </div>

            {/* Details */}
            <div style={{ 
              background: "var(--color-bg-base)", 
              padding: "12px", 
              borderRadius: "var(--radius-md)",
              fontSize: "0.9rem",
              color: "var(--color-text-secondary)",
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Eng kam buyurtma:</span>
                <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{item.moq} {item.unit}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Hudud:</span>
                <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{item.location_region}</span>
              </div>
            </div>

            {/* Supplier Info */}
            <div style={{ 
              marginTop: "auto", 
              paddingTop: 16, 
              borderTop: "1px dashed var(--color-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  {item.supplier?.company_name || item.supplier?.full_name}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                  {item.supplier?.kyb_status === "verified" && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-accent)" stroke="var(--color-bg-elevated)" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  )}
                  Ishonch reytingi: {item.supplier?.trust_score}/5
                </div>
              </div>
            </div>

            {/* Action button */}
            <Link href={`/listings/${item.id}`} className="btn btn-primary" style={{ width: "100%", marginTop: 8, justifyContent: "center" }}>
              Batafsil
            </Link>
          </div>
        ))}

        {listings?.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: "var(--color-text-muted)" }}>
            Qidiruv bo'yicha mahsulotlar topilmadi.
          </div>
        )}
      </div>
    </main>
  );
}
