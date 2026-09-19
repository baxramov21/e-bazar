"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { sendChatMessageAction, acceptOfferAction } from "./actions";
import { Send } from "lucide-react";
import Link from "next/link";
import BackButton from "@/components/BackButton";

function SubmitButton({ color }: { color: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn" style={{ background: color, color: "white", padding: "0 16px" }}>
      <Send size={18} />
    </button>
  );
}

export default function ChatUI({ 
  order, 
  messages, 
  currentUserId, 
  role 
}: { 
  order: any; 
  messages: any[]; 
  currentUserId: string; 
  role: "buyer" | "supplier";
}) {
  const [state, action] = useActionState(sendChatMessageAction, null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [messages, state]);

  const partnerName = role === "buyer" 
    ? (order.supplier?.company_name || order.supplier?.full_name)
    : (order.buyer?.company_name || order.buyer?.full_name);

  const themeColor = role === "buyer" ? "var(--color-accent)" : "var(--color-supplier)";

  return (
    <main className="fade-in" style={{ display: "flex", flexDirection: "column", height: "100dvh", width: "100%", background: "var(--color-bg-base)" }}>
      
      {/* Header */}
      <div style={{ padding: "20px 24px", background: "var(--color-bg-surface)", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 16 }}>
        <BackButton fallback={`/${role}/chats`} />
        <div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>{partnerName}</h2>
          <div style={{ fontSize: "0.9rem", color: "var(--color-text-muted)" }}>
            Taklif: {order.quantity} {order.unit} x {order.price_per_unit.toLocaleString()} UZS
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          {order.status === "pending" && <span className="badge badge-warning">Kutilmoqda</span>}
          {order.status === "confirmed" && <span className="badge badge-success">Kelishilgan</span>}
        </div>
      </div>

      {/* Messages Area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ display: "inline-block", background: "var(--color-bg-elevated)", padding: "8px 16px", borderRadius: "100px", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
            Suhbat boshlandi: {new Date(order.created_at).toLocaleString()}
          </div>
        </div>

        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
              <div style={{ 
                maxWidth: "70%", 
                padding: "12px 16px", 
                borderRadius: "var(--radius-lg)",
                background: isMine ? themeColor : "var(--color-bg-surface)",
                color: isMine ? "white" : "var(--color-text-primary)",
                border: isMine ? "none" : "1px solid var(--color-border)",
                borderBottomRightRadius: isMine ? 4 : "var(--radius-lg)",
                borderBottomLeftRadius: !isMine ? 4 : "var(--radius-lg)",
              }}>
                <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{msg.content}</div>
                <div style={{ fontSize: "0.75rem", marginTop: 8, opacity: 0.7, textAlign: "right" }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Accept Offer Action Box for Supplier */}
      {role === "supplier" && order.status === "pending" && (
        <div style={{ padding: "20px 24px", background: "var(--color-bg-elevated)", borderTop: "1px solid var(--color-border)" }}>
          <form action={acceptOfferAction} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="hidden" name="order_id" value={order.id} />
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>O'zaro Kelishuv Shartlari (Oferta)</h3>
            <div style={{ 
              background: "var(--color-bg-surface)", 
              padding: "16px", 
              borderRadius: "var(--radius-md)", 
              fontSize: "0.85rem", 
              color: "var(--color-text-secondary)",
              maxHeight: 120,
              overflowY: "auto",
              lineHeight: 1.6,
              border: "1px solid var(--color-border)"
            }}>
              Ushbu shartnoma elektron tarzda tuzilgan bo'lib, tomonlar o'rtasida yuridik kuchga ega. Xaridor ko'rsatilgan miqdordagi mahsulotni kelishilgan narxda sotib olish majburiyatini, Sotuvchi esa mahsulotni o'z vaqtida va belgilangan sifatda yetkazib berish majburiyatini oladi. Tomonlar O'zbekiston Respublikasi qonunchiligiga muvofiq javobgar hisoblanadilar. Taklifni qabul qilish orqali siz ushbu shartlarni qabul qilasiz.
            </div>
            
            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <input type="checkbox" name="accept_terms" required style={{ width: 18, height: 18, accentColor: "var(--color-supplier)" }} />
              <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>Men kelishuv shartlari bilan tanishdim va rozi bo'laman</span>
            </label>

            <button type="submit" className="btn btn-primary" style={{ background: "var(--color-supplier)", marginTop: 8, height: 44 }}>
              Shartlarga rozi bo'lish va Taklifni Qabul Qilish
            </button>
          </form>
        </div>
      )}

      {/* Input Area */}
      <div style={{ padding: "20px 24px", background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-border)" }}>
        <form 
          ref={formRef}
          action={action} 
          style={{ display: "flex", gap: 12 }}
        >
          <input type="hidden" name="order_id" value={order.id} />
          <input type="hidden" name="role" value={role} />
          
          <input 
            name="content"
            type="text" 
            placeholder="Xabar yozing..." 
            className="input" 
            style={{ flex: 1, borderRadius: "100px", paddingLeft: 20 }}
            autoComplete="off"
            required
          />
          <SubmitButton color={themeColor} />
        </form>
      </div>

    </main>
  );
}
