"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { sendChatMessageAction } from "./actions";
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

      {/* Input Area */}
      <div style={{ padding: "20px 24px", background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-border)" }}>
        <form 
          ref={formRef}
          action={(formData) => {
            action(formData);
            formRef.current?.reset();
          }} 
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
