import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BuyerChatsPage() {
  const supabase = await createClient();

  // Temporary mock ID for MVP
  const mockBuyerId = "11111111-1111-1111-1111-111111111111"; 
  const { data: profile } = await supabase.from("profiles").select("id").limit(1).single();
  const buyerId = profile?.id || mockBuyerId;

  // Fetch orders (acting as chats/offers)
  const { data: chats } = await supabase
    .from("orders")
    .select(`
      id, created_at, status, quantity, price_per_unit, unit,
      listing:listings(title, images),
      supplier:profiles!supplier_id(company_name, full_name)
    `)
    .eq("buyer_id", buyerId)
    .order("updated_at", { ascending: false });

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <MessageSquare size={28} color="var(--color-accent)" />
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Mening Suhbatlarim</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {chats?.map((chat: any) => (
          <Link key={chat.id} href={`/buyer/chats/${chat.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div className="card hover-glow" style={{ padding: "20px", display: "flex", alignItems: "center", gap: 20 }}>
              
              <div style={{ width: 60, height: 60, borderRadius: "var(--radius-md)", background: "var(--color-bg-elevated)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {chat.listing?.images?.[0] ? (
                  <img src={chat.listing.images[0]} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                ) : (
                  <MessageSquare size={24} color="var(--color-text-muted)" />
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
                    {chat.supplier?.company_name || chat.supplier?.full_name}
                  </h3>
                  <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                    {new Date(chat.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontSize: "0.95rem", color: "var(--color-text-primary)", fontWeight: 500, marginBottom: 4 }}>
                  {chat.listing?.title}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                  Taklif: {chat.quantity} {chat.unit} x {chat.price_per_unit.toLocaleString()} UZS
                </div>
              </div>

              <div>
                {chat.status === "pending" && <span className="badge badge-warning">Kutilmoqda</span>}
                {chat.status === "confirmed" && <span className="badge badge-success">Kelishilgan</span>}
                {chat.status === "cancelled" && <span className="badge badge-gray">Bekor qilingan</span>}
              </div>

            </div>
          </Link>
        ))}

        {(!chats || chats.length === 0) && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--color-text-muted)" }}>
            Hozircha suhbatlar yo'q.
          </div>
        )}
      </div>
    </main>
  );
}
