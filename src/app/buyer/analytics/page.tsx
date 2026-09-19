"use client";

import { useState, useTransition } from "react";
import BackButton from "@/components/BackButton";
import { HistoricalPriceChart } from "@/components/DashboardCharts";
import { generatePricePredictionAction } from "./actions";
import { Bot, MapPin, Package } from "lucide-react";

// Mock data generators
const generateMockData = (basePrice: number, volatility: number) => {
  const data = [];
  const months = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"];
  let currentPrice = basePrice;
  
  for (let i = 0; i < 12; i++) {
    // Random walk with trend
    const change = (Math.random() - 0.4) * volatility;
    currentPrice = currentPrice + (currentPrice * change);
    data.push({
      date: months[i],
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
  // Use a predictable initial state to avoid hydration mismatch, then update in useEffect if needed, 
  // but since we want dynamic random charts, we can just let it render client-side.
  const [chartData, setChartData] = useState(() => generateMockData(products[0].basePrice, products[0].volatility));
  
  const [isPending, startTransition] = useTransition();
  const [analysis, setAnalysis] = useState<string | null>(null);

  const handleProductChange = (e: any) => {
    const p = products.find(p => p.id === e.target.value) || products[0];
    setSelectedProduct(p);
    setChartData(generateMockData(p.basePrice, p.volatility));
    setAnalysis(null);
  };

  const handleRegionChange = (e: any) => {
    setSelectedRegion(e.target.value);
    setChartData(generateMockData(selectedProduct.basePrice, selectedProduct.volatility));
    setAnalysis(null);
  };

  const handleGenerateAnalysis = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("product", selectedProduct.name);
      formData.append("region", selectedRegion);
      formData.append("historicalData", JSON.stringify(chartData));
      
      const res = await generatePricePredictionAction(formData);
      if (res?.success) {
        setAnalysis(res.analysis);
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
