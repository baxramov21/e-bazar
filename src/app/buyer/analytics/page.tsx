"use client";

import { useState, useTransition } from "react";
import BackButton from "@/components/BackButton";
import { HistoricalPriceChart } from "@/components/DashboardCharts";
import { generatePricePredictionAction } from "./actions";
import { Bot, MapPin, Package, Calendar } from "lucide-react";

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
  
  const [isPending, startTransition] = useTransition();
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleProductChange = (e: any) => {
    const p = products.find(p => p.id === e.target.value) || products[0];
    setSelectedProduct(p);
    setChartData(generateMockData(p.basePrice, p.volatility, selectedTimeframe));
    setAnalysis(null);
  };

  const handleRegionChange = (e: any) => {
    setSelectedRegion(e.target.value);
    setChartData(generateMockData(selectedProduct.basePrice, selectedProduct.volatility, selectedTimeframe));
    setAnalysis(null);
  };

  const handleTimeframeChange = (e: any) => {
    const tf = e.target.value;
    setSelectedTimeframe(tf);
    setChartData(generateMockData(selectedProduct.basePrice, selectedProduct.volatility, tf));
    setAnalysis(null);
  };

  const handleGenerateAnalysis = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("product", selectedProduct.name);
      formData.append("region", selectedRegion);
      formData.append("timeframe", timeframes.find(t => t.id === selectedTimeframe)?.name || "Oylik");
      formData.append("historicalData", JSON.stringify(chartData));
      
      const res = await generatePricePredictionAction(formData);
      if (res?.success) {
        setAnalysis(res.analysis || null);
      } else {
        setAnalysis("Tahlil yaratishda xatolik yuz berdi: " + res?.error);
      }
    });
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

        {!analysis ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <button 
              onClick={handleGenerateAnalysis} 
              disabled={isPending}
              className="btn btn-primary"
              style={{ padding: "12px 24px", fontSize: "1rem" }}
            >
              {isPending ? "Tahlil qilinmoqda..." : "AI Tahlilni Boshlash"}
            </button>
          </div>
        ) : (
          <div className="fade-in" style={{ padding: 24, background: "var(--color-bg-base)", borderRadius: "var(--radius-md)", border: "1px dashed var(--color-accent)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "1rem", lineHeight: 1.6, color: "var(--color-text-secondary)", whiteSpace: "pre-wrap" }}>
              {analysis}
            </div>
            
            <button onClick={() => setAnalysis(null)} className="btn btn-secondary btn-sm" style={{ marginTop: 20 }}>
              Yangi tahlil
            </button>
          </div>
        )}
      </div>

    </main>
  );
}
