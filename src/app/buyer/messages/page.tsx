import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { Search, TrendingUp, AlertCircle, Clock, ShieldCheck, Zap, Activity } from "lucide-react";

export default async function BuyerMessagesPage() {
  const supabase = await createClient();

  // Temporary mock ID to bypass auth for MVP
  const mockBuyerId = "11111111-1111-1111-1111-111111111111"; 
  const { data: profile } = await supabase.from("profiles").select("id").limit(1).single();
  const buyerId = profile?.id || mockBuyerId;

  const { data: messages } = await supabase
    .from("buyer_messages")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", minHeight: "100dvh" }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 32 }}>
        <div style={{ marginTop: 6 }}>
          <BackButton fallback="/buyer/dashboard" />
        </div>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Xabarlar (BozorAI)</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
            Sizning kunlik bozor bashoratlari va tahlillaringiz
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {messages?.map((msg) => {
          let parsedData: any = null;
          try {
            if (msg.content.trim().startsWith('{')) {
              parsedData = JSON.parse(msg.content);
            }
          } catch(e) {}

          return (
          <div key={msg.id} className="card hover-glow" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ 
                  width: 40, height: 40, borderRadius: "50%", 
                  background: "linear-gradient(135deg, var(--color-accent), #8b5cf6)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <TrendingUp size={20} color="white" />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>{msg.title}</h3>
                  <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                    {new Date(msg.created_at).toLocaleString('uz-UZ')}
                  </span>
                </div>
              </div>
              
              {/* Signal Badge */}
              {msg.prediction_signal === "BUY_NOW" && <span className="badge" style={{ background: "rgba(16,185,129,0.1)", color: "var(--color-success)" }}>SOTIB OLING</span>}
              {msg.prediction_signal === "HOLD" && <span className="badge" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>KUTING</span>}
              {msg.prediction_signal === "WAIT" && <span className="badge" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>KUTING</span>}
              {msg.prediction_signal === "BUY_LATER" && <span className="badge" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>KEYINROQ OLING</span>}
              {msg.prediction_signal === "SCALE_IN" && <span className="badge" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>QISMLAB OLING</span>}
            </div>
            
            {parsedData && parsedData.recommendation ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                  <div style={{ background: "var(--color-bg-elevated)", padding: 16, borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: 4 }}>Tavsiya qilingan narx zonasi</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-accent-light)" }}>
                      {parsedData.recommendation.target_price_window?.ideal_entry?.toLocaleString()} - {parsedData.recommendation.target_price_window?.max_acceptable_price?.toLocaleString()} UZS
                    </div>
                  </div>
                  <div style={{ background: "var(--color-bg-elevated)", padding: 16, borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: 4 }}>Ishonch darajasi</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                      {parsedData.recommendation.confidence_score}%
                    </div>
                  </div>
                  <div style={{ background: "var(--color-bg-elevated)", padding: 16, borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginBottom: 4 }}>Bozor tendensiyasi</div>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>
                      {parsedData.market_analytics?.price_trend_direction}
                    </div>
                  </div>
                </div>

                <div style={{ background: "rgba(139, 92, 246, 0.05)", padding: 16, borderRadius: "var(--radius-md)", border: "1px dashed var(--color-accent)" }}>
                  <h4 style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "1rem", fontWeight: 700, marginBottom: 8, color: "var(--color-accent-light)" }}>
                    <ShieldCheck size={18} /> Eng Yaxshi Yetkazib Beruvchi
                  </h4>
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>{parsedData.optimal_seller?.seller_name} ({parsedData.optimal_seller?.unit_price?.toLocaleString()} UZS)</p>
                  <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>{parsedData.optimal_seller?.selection_reasoning}</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 8 }}>
                  <div>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 8, color: "var(--color-success)" }}>🟢 Eng yaxshi ssenariy</h4>
                    <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>{parsedData.decision_matrix?.best_case_scenario}</p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 8, color: "var(--color-danger)" }}>🔴 Xavf-xatarlar</h4>
                    <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>{parsedData.decision_matrix?.worst_case_risk}</p>
                  </div>
                </div>

                {parsedData.decision_matrix?.actionable_next_steps && (
                  <div style={{ marginTop: 8 }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 8 }}>Qadamlar:</h4>
                    <ul style={{ paddingLeft: 20, fontSize: "0.9rem", color: "var(--color-text-secondary)", display: "flex", flexDirection: "column", gap: 4 }}>
                      {parsedData.decision_matrix.actionable_next_steps.map((step: string, i: number) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
              </div>
            ) : (
              <div style={{ color: "var(--color-text-secondary)", lineHeight: 1.6, whiteSpace: "pre-wrap", fontSize: "0.95rem" }}>
                {msg.content}
              </div>
            )}
          </div>
          )
        })}

        {(!messages || messages.length === 0) && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--color-text-muted)", background: "var(--color-bg-surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--color-border)" }}>
            <AlertCircle size={48} style={{ margin: "0 auto", marginBottom: 16, opacity: 0.5 }} />
            Hali xabarlar va bozor tahlillari yo'q.<br/>
            Bosh sahifadan mahsulot qidirib tahlil so'rang!
          </div>
        )}
      </div>
    </main>
  );
}
