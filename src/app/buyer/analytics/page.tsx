"use client";

import { useState } from "react";
import BackButton from "@/components/BackButton";
import { HistoricalPriceChart } from "@/components/DashboardCharts";
import { Bot, MapPin, Package, Calendar, Send, User } from "lucide-react";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const timeframes = [
  { id: "daily", name: "Kunlik (30 kun)" },
  { id: "weekly", name: "Haftalik (12 hafta)" },
  { id: "monthly", name: "Oylik (1 yil)" },
  { id: "yearly", name: "Yillik (5 yil)" },
  { id: "yoy", name: "O'tgan yilning shu vaqti" },
];

// Mock data generators
const generateMockData = (basePrice: number, volatility: number, timeframe: string) => {
  const data = [];
  let currentPrice = basePrice;
  let dataPoints = 12;
  let labels: string[] = [];

  if (timeframe === "daily") {
    dataPoints = 30;
    for (let i = 30; i > 0; i--) labels.push(`Kun ${31-i}`);
    volatility = volatility * 0.3; 
  } else if (timeframe === "weekly") {
    dataPoints = 12;
    for (let i = 12; i > 0; i--) labels.push(`Hafta ${13-i}`);
    volatility = volatility * 0.6;
  } else if (timeframe === "yearly") {
    dataPoints = 5;
    const currentYear = new Date().getFullYear();
    for (let i = 4; i >= 0; i--) labels.push(`${currentYear - i}`);
    volatility = volatility * 1.5;
  } else if (timeframe === "yoy") {
    dataPoints = 12;
    labels = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
    currentPrice = basePrice * 0.85; 
  } else {
    dataPoints = 12;
    labels = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
  }
  
  for (let i = 0; i < dataPoints; i++) {
    const change = (Math.random() - 0.4) * volatility;
    currentPrice = currentPrice + (currentPrice * change);
    data.push({
      date: labels[i],
      price: Math.round(currentPrice / 100) * 100
    });
  }
  return data;
};

const products = [
  { id: "bugdoy", name: "Bug'doy", basePrice: 3500, volatility: 0.08 },
  { id: "pomidor", name: "Pomidor", basePrice: 8000, volatility: 0.25 },
  { id: "paxta", name: "Paxta", basePrice: 12000, volatility: 0.10 },
  { id: "uzum", name: "Uzum", basePrice: 15000, volatility: 0.20 },
  { id: "kartoshka", name: "Kartoshka", basePrice: 4000, volatility: 0.15 },
];

const regions = [
  "Toshkent", "Farg'ona", "Andijon", "Namangan", "Samarqand", 
  "Buxoro", "Navoiy", "Qashqadaryo", "Surxondaryo", "Xorazm"
];

export default function AnalyticsPage() {
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframes[2].id);
  
  const [chartData, setChartData] = useState(() => generateMockData(products[0].basePrice, products[0].volatility, timeframes[2].id));
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");

  const handleProductChange = (e: any) => {
    const p = products.find(p => p.id === e.target.value) || products[0];
    setSelectedProduct(p);
    setChartData(generateMockData(p.basePrice, p.volatility, selectedTimeframe));
    setMessages([]);
  };

  const handleRegionChange = (e: any) => {
    setSelectedRegion(e.target.value);
    setChartData(generateMockData(selectedProduct.basePrice, selectedProduct.volatility, selectedTimeframe));
    setMessages([]);
  };

  const handleTimeframeChange = (e: any) => {
    const tf = e.target.value;
    setSelectedTimeframe(tf);
    setChartData(generateMockData(selectedProduct.basePrice, selectedProduct.volatility, tf));
    setMessages([]);
  };

  const sendMessage = async (userText: string) => {
    if (!userText.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: userText }];
    setMessages(newMessages);
    setChatInput("");
    setIsGenerating(true);

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product: selectedProduct.name,
          region: selectedRegion,
          timeframe: timeframes.find(t => t.id === selectedTimeframe)?.name || "Oylik",
          historicalData: JSON.stringify(chartData),
          messages: newMessages
        })
      });

      if (!res.ok) throw new Error("Tarmoq xatosi yuz berdi.");
      if (!res.body) throw new Error("Javob olinmadi");

      setMessages((prev) => [...prev, { role: 'assistant', content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            updated[lastIndex] = { ...updated[lastIndex], content: updated[lastIndex].content + chunk };
            return updated;
          });
        }
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Xatolik yuz berdi: " + err.message }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartAnalysis = () => {
    sendMessage("Iltimos, ushbu ma'lumotlarni tahlil qiling va kelajakdagi o'zgarishlarni prognoz qiling.");
  };

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", minHeight: "100dvh" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 32 }}>
        <div style={{ marginTop: 6 }}>
          <BackButton fallback="/buyer/dashboard" />
        </div>
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Bozor Analitikasi</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
            Mahsulotlar va hududlar kesimida tarixiy narxlar hamda AI tahlili
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="card" style={{ padding: 24, marginBottom: 24, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8 }}>
            <Package size={16} /> Mahsulotni tanlang
          </label>
          <select 
            value={selectedProduct.id} 
            onChange={handleProductChange}
            className="input-field" 
            style={{ width: "100%", background: "var(--color-bg-base)" }}
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8 }}>
            <MapPin size={16} /> Hududni tanlang
          </label>
          <select 
            value={selectedRegion} 
            onChange={handleRegionChange}
            className="input-field" 
            style={{ width: "100%", background: "var(--color-bg-base)" }}
          >
            {regions.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 8 }}>
            <Calendar size={16} /> Vaqt oralig'i
          </label>
          <select 
            value={selectedTimeframe} 
            onChange={handleTimeframeChange}
            className="input-field" 
            style={{ width: "100%", background: "var(--color-bg-base)" }}
          >
            {timeframes.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chart */}
      <div style={{ marginBottom: 24 }}>
        <HistoricalPriceChart 
          data={chartData} 
          title={`${selectedRegion} hududida ${selectedProduct.name} narxlari dinamikasi (Simulyatsiya)`} 
        />
      </div>

      {/* AI Analysis */}
      <div className="card" style={{ padding: 32, background: "linear-gradient(to bottom right, var(--color-bg-surface), rgba(139, 92, 246, 0.05))", border: "1px solid var(--color-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg, var(--color-accent), #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bot size={24} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800 }}>AI Narx Bashorati</h2>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem" }}>Ushbu trendga asoslangan sabablar va ehtimoliy o'zgarishlar</p>
          </div>
        </div>

        {messages.length === 0 && !isGenerating ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <button 
              onClick={handleStartAnalysis} 
              disabled={isGenerating}
              className="btn btn-primary"
              style={{ padding: "12px 24px", fontSize: "1rem" }}
            >
              AI Tahlilni Boshlash
            </button>
          </div>
        ) : (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: 16,
              maxHeight: "500px",
              overflowY: "auto",
              paddingRight: 8
            }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                  flexDirection: msg.role === 'user' ? "row-reverse" : "row"
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: msg.role === 'user' ? "var(--color-bg-hover)" : "linear-gradient(135deg, var(--color-accent), #8b5cf6)"
                  }}>
                    {msg.role === 'user' ? <User size={18} color="white" /> : <Bot size={18} color="white" />}
                  </div>
                  
                  <div style={{
                    background: msg.role === 'user' ? "var(--color-bg-elevated)" : "var(--color-bg-base)",
                    border: msg.role === 'user' ? "none" : "1px solid var(--color-border)",
                    padding: "16px 20px",
                    borderRadius: "var(--radius-md)",
                    borderTopRightRadius: msg.role === 'user' ? 4 : "var(--radius-md)",
                    borderTopLeftRadius: msg.role === 'assistant' ? 4 : "var(--radius-md)",
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                    color: msg.role === 'user' ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                    maxWidth: "85%",
                    whiteSpace: "pre-wrap"
                  }}>
                    {msg.content === "" && isGenerating && idx === messages.length - 1 ? (
                      <span style={{ fontStyle: "italic", color: "var(--color-text-muted)" }}>
                        Aql bilan o'ylamoqda<span className="thinking-dots"></span>
                      </span>
                    ) : (
                      msg.content
                    )}
                    {isGenerating && msg.content !== "" && idx === messages.length - 1 && msg.role === 'assistant' && (
                      <span style={{ 
                        display: "inline-block", 
                        width: "6px", 
                        height: "1em", 
                        background: "var(--color-accent)", 
                        verticalAlign: "middle", 
                        marginLeft: "4px",
                        animation: "blink-cursor 1s step-end infinite" 
                      }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <form 
              onSubmit={(e) => { e.preventDefault(); sendMessage(chatInput); }}
              style={{ display: "flex", gap: 12, marginTop: 8 }}
            >
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="AI ga savol bering..."
                className="input"
                disabled={isGenerating}
                style={{ flex: 1, border: "1px solid var(--color-border-strong)" }}
              />
              <button 
                type="submit" 
                disabled={!chatInput.trim() || isGenerating}
                className="btn btn-primary"
                style={{ padding: "10px 16px" }}
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </div>

    </main>
  );
}
