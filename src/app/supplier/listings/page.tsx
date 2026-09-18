import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import BackButton from "@/components/BackButton";

export default async function SupplierListingsPage() {
  const supabase = await createClient();
  
  // Temporary mock ID to bypass auth for MVP
  // In reality: const { data: { user } } = await supabase.auth.getUser();
  const mockSupplierId = "22222222-2222-2222-2222-222222222222"; 
  const { data: profile } = await supabase.from("profiles").select("id").eq("role", "supplier").limit(1).single();
  const supplierId = profile?.id || mockSupplierId;

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("created_at", { ascending: false });

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", minHeight: "100dvh" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Mening E'lonlarim</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
            Siz joylagan barcha mahsulotlar va ularning holati
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <BackButton fallback="/supplier/dashboard" />
          <button className="btn btn-primary" disabled>
            + Yangi e'lon
          </button>
        </div>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", 
        gap: 24 
      }}>
        {listings?.map((item: any) => (
          <div key={item.id} className="card hover-glow" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            
            {/* Image placeholder if none exists, else show image */}
            <div style={{ 
              height: 200, 
              backgroundColor: "var(--color-bg-elevated)", 
              borderRadius: "var(--radius-md)", 
              border: "1px dashed var(--color-border)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-muted)"
            }}>
              {item.images && item.images.length > 0 ? (
                <img src={item.images[0]} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span>Rasm yo'q</span>
              )}
            </div>

            {/* Category badge & Status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="badge badge-gray">{item.category}</span>
              {item.is_active ? (
                <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "var(--color-success)" }}>Faol</span>
              ) : (
                <span className="badge" style={{ background: "rgba(239,68,68,0.1)", color: "var(--color-danger)" }}>Nofaol</span>
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
                <span>Umumiy qoldiq:</span>
                <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{item.available_quantity} {item.unit}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Eng kam buyurtma:</span>
                <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>{item.moq} {item.unit}</span>
              </div>
            </div>

            <Link href={`/listings/${item.id}`} className="btn btn-secondary" style={{ width: "100%", marginTop: "auto", justifyContent: "center" }}>
              Ko'rish
            </Link>
          </div>
        ))}

        {(!listings || listings.length === 0) && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px 20px", color: "var(--color-text-muted)", background: "var(--color-bg-surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-border)" }}>
            Hali e'lonlar joylamagansiz.
          </div>
        )}
      </div>

    </main>
  );
}
