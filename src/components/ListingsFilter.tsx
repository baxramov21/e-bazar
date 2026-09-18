"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ListingsFilter({ initialQ = "", initialCategory = "" }) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);

  const categories = [
    "Qishloq xo'jaligi", "Sabzavotlar", "Sanoat", "Oziq-ovqat", "Meva-sabzavot", "Qurilish"
  ];

  // Debounce the text input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (q !== initialQ || category !== initialCategory) {
        submitSearch(q, category);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [q, category, initialQ, initialCategory]);

  const submitSearch = (newQ: string, newCat: string) => {
    const params = new URLSearchParams();
    if (newQ) params.set("q", newQ);
    if (newCat) params.set("category", newCat);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="card" style={{ marginBottom: 32, padding: "20px 24px" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px" }}>
          <input 
            type="text" 
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Mahsulot nomini qidiring (masalan, Sement)..." 
            className="input"
          />
        </div>
        <div style={{ flex: "0 0 250px" }}>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            className="input"
          >
            <option value="">Barcha kategoriyalar</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        
        {(q || category) && (
          <button 
            onClick={() => { setQ(""); setCategory(""); submitSearch("", ""); }}
            className="btn btn-ghost" 
            style={{ flex: "0 0 auto" }}
          >
            Tozalash
          </button>
        )}
      </div>
    </div>
  );
}
