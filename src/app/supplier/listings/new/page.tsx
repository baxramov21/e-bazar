"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createListingAction } from "./actions";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary" style={{ width: "100%", background: "var(--color-supplier)" }}>
      {pending ? "Yaratilmoqda..." : "E'lon yaratish"}
    </button>
  );
}

export default function NewListingPage() {
  const [state, action] = useActionState(createListingAction, null);

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", maxWidth: 600 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Yangi E'lon</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Sotish uchun yangi mahsulot qo'shing</p>
        </div>
        <Link href="/supplier/listings" className="btn btn-secondary btn-sm">Bekor qilish</Link>
      </div>

      <div className="card">
        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {state?.error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-md)", padding: "12px", color: "var(--color-danger)" }}>
              {state.error}
            </div>
          )}

          <div>
            <label className="input-label" htmlFor="title">Mahsulot nomi</label>
            <input id="title" name="title" type="text" className="input" placeholder="Masalan: 10 tonna pomidor" required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
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
              <label className="input-label" htmlFor="location_region">Hudud (Yuklash)</label>
              <select id="location_region" name="location_region" className="input" required>
                <option value="">Tanlang...</option>
                <option value="Toshkent shahri">Toshkent shahri</option>
                <option value="Toshkent viloyati">Toshkent viloyati</option>
                <option value="Samarqand">Samarqand</option>
                <option value="Farg'ona">Farg'ona</option>
                <option value="Navoiy">Navoiy</option>
              </select>
            </div>
            <div>
              <label className="input-label" htmlFor="delivery_days">Yetkazib berish (kun)</label>
              <input id="delivery_days" name="delivery_days" type="number" min="1" className="input" placeholder="Masalan: 2" required />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="input-label" htmlFor="price_per_unit">Narxi (1 birlik uchun)</label>
              <input id="price_per_unit" name="price_per_unit" type="number" min="1" className="input" placeholder="Masalan: 15000" required />
            </div>
            <div>
              <label className="input-label" htmlFor="currency">Valyuta</label>
              <select id="currency" name="currency" className="input" required>
                <option value="UZS">UZS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div>
              <label className="input-label" htmlFor="available_quantity">Umumiy miqdor</label>
              <input id="available_quantity" name="available_quantity" type="number" min="1" className="input" placeholder="10" required />
            </div>
            <div>
              <label className="input-label" htmlFor="moq">Minimal buyurtma</label>
              <input id="moq" name="moq" type="number" min="1" className="input" placeholder="1" required />
            </div>
            <div>
              <label className="input-label" htmlFor="unit">O'lchov</label>
              <select id="unit" name="unit" className="input" required>
                <option value="ton">Tonna (ton)</option>
                <option value="kg">Kilogramm (kg)</option>
                <option value="litre">Litr</option>
                <option value="dona">Dona</option>
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
