"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Package, MapPin, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

type Message = {
  role: 'user' | 'model';
  content: string;
  isResults?: boolean;
  results?: any[];
  searchParams?: any;
};

export default function AiSearchPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Assalomu alaykum! Men BozorAI qidiruv yordamchisingizman. Qanday mahsulot qidiryapsiz? (Masalan: Menga Toshkentga 5 tonna pomidor kerak, narxi 10000 so'm atrofida)"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    const newMessages = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'model',
        content: "Kechirasiz, xatolik yuz berdi. Iltimos qaytadan urinib ko'ring."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="page-container fade-in" style={{ padding: "0", height: "100dvh", display: "flex", flexDirection: "column", background: "var(--color-bg-base)" }}>
      
      {/* Header */}
      <div style={{ padding: "24px 32px", borderBottom: "1px solid var(--color-border)", background: "var(--color-bg-surface)" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 12 }}>
          <Bot color="var(--color-accent-light)" size={32} />
          AI Qidiruv (BozorAI)
        </h1>
        <p style={{ color: "var(--color-text-muted)", marginTop: 4, paddingLeft: 44 }}>
          Kerakli mahsulotni oddiy suhbat orqali toping
        </p>
      </div>

      {/* Chat Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", flexDirection: "column", gap: 24 }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{
            display: "flex",
            gap: 16,
            alignItems: "flex-start",
            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
          }}>
            {/* Avatar */}
            <div style={{
              width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
              background: msg.role === 'user' ? "var(--color-accent)" : "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {msg.role === 'user' ? <User size={20} color="white" /> : <Bot size={20} color="white" />}
            </div>

            {/* Bubble */}
            <div style={{
              background: msg.role === 'user' ? "var(--color-accent)" : "var(--color-bg-elevated)",
              color: msg.role === 'user' ? "white" : "var(--color-text-primary)",
              padding: "16px 20px",
              borderRadius: "20px",
              borderTopRightRadius: msg.role === 'user' ? 4 : 20,
              borderTopLeftRadius: msg.role === 'model' ? 4 : 20,
              maxWidth: "80%",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              border: msg.role === 'model' ? "1px solid var(--color-border)" : "none"
            }}>
              <p style={{ fontSize: "1rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                {msg.content}
              </p>

              {/* Rich Results rendering if present */}
              {msg.isResults && msg.results && msg.results.length > 0 && (
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  {msg.results.map((product) => (
                    <div key={product.id} style={{
                      background: "var(--color-bg-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "12px",
                      padding: 16,
                      display: "flex",
                      gap: 16,
                      alignItems: "center"
                    }}>
                      <div style={{ width: 80, height: 80, borderRadius: 8, background: "#f0f0f0", overflow: "hidden" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.images[0]} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontWeight: 700, fontSize: "1.1rem" }}>{product.title}</h4>
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                          <Package size={14} /> {product.available_quantity} {product.unit} mavjud
                        </p>
                        <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                          <MapPin size={14} /> {product.location_region}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--color-accent-light)" }}>
                          {product.price_per_unit.toLocaleString()} {product.currency}
                        </div>
                        <Link href={`/listings/${product.id}`} className="btn btn-primary" style={{ padding: "8px 16px", marginTop: 8, display: "inline-flex" }}>
                          Ko'rish <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Bot size={20} color="white" />
            </div>
            <div style={{
              background: "var(--color-bg-elevated)",
              padding: "16px 20px",
              borderRadius: "20px",
              borderTopLeftRadius: 4,
              border: "1px solid var(--color-border)"
            }}>
              <Loader2 className="spin" size={20} color="var(--color-text-muted)" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ padding: "24px 32px", background: "var(--color-bg-surface)", borderTop: "1px solid var(--color-border)" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: 12, position: "relative" }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="O'zingizga kerakli mahsulotni yozing..."
            className="input-field"
            style={{ flex: 1, height: 60, paddingRight: 60, fontSize: "1rem", borderRadius: "30px", paddingLeft: 24 }}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            style={{
              position: "absolute",
              right: 8,
              top: 8,
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: (isLoading || !input.trim()) ? "var(--color-bg-elevated)" : "var(--color-accent)",
              color: (isLoading || !input.trim()) ? "var(--color-text-muted)" : "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: (isLoading || !input.trim()) ? "not-allowed" : "pointer",
              transition: "all 0.2s"
            }}
          >
            <Send size={20} style={{ marginLeft: -2 }} />
          </button>
        </form>
      </div>

    </main>
  );
}
