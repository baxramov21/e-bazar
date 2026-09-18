"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createRfqAction } from "./actions";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary" style={{ width: "100%" }}>
      {pending ? "Yuborilmoqda..." : "So'rov yaratish"}
    </button>
  );
}

export default function NewRfqPage() {
  const [state, action] = useActionState(createRfqAction, null);

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", maxWidth: 600 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Yangi Xarid So'rovi</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Istalgan mahsulot uchun talabnoma qoldiring</p>
        </div>
        <Link href="/buyer/dashboard" className="btn btn-secondary btn-sm">Bekor qilish</Link>
      </div>

      <div className="card">
        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {state?.error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-md)", padding: "12px", color: "var(--color-danger)" }}>
              {state.error}
            </div>
          )}

          <div>
            <label className="input-label" htmlFor="title">So'rov sarlavhasi</label>
            <input id="title" name="title" type="text" className="input" placeholder="Masalan: 50 tonna oliy navli bug'doy" required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="input-label" htmlFor="category">Kategoriya</label>
              <select id="category" name="category" className="input" required>
                <option value="">Tanlang...</option>
                <option value="Qishloq xo'jaligi">Qishloq xo'jaligi</option>
                <option value="Sabzavotlar">Sabzavotlar</option>
                <option value="Sanoat">Sanoat</option>
                <option value="Qurilish">Qurilish</option>
                <option value="Oziq-ovqat">Oziq-ovqat</option>
              </select>
            </div>
            <div>
              <label className="input-label" htmlFor="destination_region">Yetkazib berish hududi</label>
              <select id="destination_region" name="destination_region" className="input" required>
                <option value="">Tanlang...</option>
                <option value="Toshkent shahri">Toshkent shahri</option>
                <option value="Samarqand">Samarqand</option>
                <option value="Farg'ona">Farg'ona</option>
                <option value="Navoiy">Navoiy</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="input-label" htmlFor="requested_quantity">Miqdor</label>
              <input id="requested_quantity" name="requested_quantity" type="number" min="1" className="input" placeholder="100" required />
            </div>
            <div>
              <label className="input-label" htmlFor="unit">O'lchov birligi</label>
              <select id="unit" name="unit" className="input" required>
                <option value="ton">Tonna (ton)</option>
                <option value="kg">Kilogramm (kg)</option>
                <option value="litre">Litr</option>
                <option value="dona">Dona</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="input-label" htmlFor="budget_per_unit">1 birlik uchun byudjetingiz (UZS)</label>
              <input id="budget_per_unit" name="budget_per_unit" type="number" className="input" placeholder="Masalan: 2000000" />
              <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: 4 }}>Ixtiyoriy</p>
            </div>
            <div>
              <label className="input-label" htmlFor="urgency_level">Shoshilinchlik darajasi</label>
              <select id="urgency_level" name="urgency_level" className="input">
                <option value="normal">Odatiy</option>
                <option value="high">Yuqori</option>
                <option value="urgent">O'ta shoshilinch</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <SubmitButton />
          </div>
        </form>
      </div>
    </main>
  );
}
