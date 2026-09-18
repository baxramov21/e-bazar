"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "So'rovnoma ma'lumotlari tahlil qilinmoqda...",
  "O'zbekiston bo'yicha 2,500+ yetkazib beruvchilar bazasi skaner qilinmoqda...",
  "Yetkazib berish narxi va logistika hisoblanmoqda...",
  "Ishonchlilik reytingi va KYB statuslari baholanmoqda...",
  "Eng maqbul 3 ta taklif tanlab olindi."
];

export default function AITerminal({ onComplete }: { onComplete: () => void }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (currentStepIndex < STEPS.length) {
      const timer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, STEPS[currentStepIndex]]);
        setCurrentStepIndex((prev) => prev + 1);
      }, 1200 + Math.random() * 800); // Random delay between 1.2s and 2s
      return () => clearTimeout(timer);
    } else {
      setIsDone(true);
      const doneTimer = setTimeout(() => {
        onComplete();
      }, 1000);
      return () => clearTimeout(doneTimer);
    }
  }, [currentStepIndex, onComplete]);

  return (
    <div className="card-elevated" style={{ 
      background: "#030712", // Pure black for terminal feel
      border: "1px solid var(--color-border-strong)",
      fontFamily: "monospace",
      padding: "24px",
      minHeight: 280,
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden"
    }}>
      
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }}></div>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }}></div>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981" }}></div>
        </div>
        <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginLeft: "auto", fontWeight: 600 }}>
          BozorAI™ Core
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, color: "var(--color-text-secondary)" }}>
        {completedSteps.map((step, idx) => (
          <div key={idx} className="fade-in" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ color: "var(--color-success)", fontWeight: 800 }}>✓</span>
            <span style={{ color: "var(--color-text-primary)", fontSize: "14px" }}>{step}</span>
          </div>
        ))}

        {!isDone && (
          <div className="fade-in" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ color: "var(--color-accent)", fontWeight: 800 }} className="spin">⟳</span>
            <span style={{ color: "var(--color-text-primary)", fontSize: "14px" }}>
              {STEPS[currentStepIndex]}
            </span>
          </div>
        )}
      </div>

      <style>{`
        .spin {
          display: inline-block;
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
