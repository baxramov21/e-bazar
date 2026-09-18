"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfileAction, type ProfileState } from "./actions";
import { createClient } from "@/lib/supabase/client";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary"
    >
      {pending ? "Saqlanmoqda..." : "Saqlash"}
    </button>
  );
}

const REGIONS = [
  "Toshkent shahri", "Toshkent viloyati", "Andijon", "Buxoro", "Farg'ona", "Jizzax", 
  "Xorazm", "Namangan", "Navoiy", "Qashqadaryo", "Qoraqalpog'iston", "Samarqand", 
  "Sirdaryo", "Surxondaryo"
];

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<any>({
    full_name: "Test Foydalanuvchi",
    role: "supplier",
    company_name: "Test MChJ",
    region: "Toshkent shahri",
    address: "Amir Temur ko'chasi, 1-uy",
    tin: "123456789"
  });
  const [loading, setLoading] = useState(false);

  const initialState: ProfileState = {};
  const [state, action] = useActionState(updateProfileAction, initialState);

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", maxWidth: 800 }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Profil sozlamalari</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Shaxsiy va kompaniya ma&apos;lumotlarini tahrirlash</p>
        </div>
        <a 
          href={profile.role === "supplier" ? "/supplier/dashboard" : "/buyer/dashboard"} 
          className="btn btn-secondary btn-sm"
        >
          Orqaga
        </a>
      </div>

      <div className="card">
        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {state?.success && (
            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "var(--radius-lg)", padding: "12px 16px", color: "var(--color-success)" }}>
              Ma&apos;lumotlar muvaffaqiyatli saqlandi!
            </div>
          )}

          {state?.errors?.general && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-lg)", padding: "12px 16px", color: "var(--color-danger)" }}>
              {state.errors.general[0]}
            </div>
          )}

          <div>
            <label className="input-label" htmlFor="full_name">To&apos;liq ism</label>
            <input 
              id="full_name" name="full_name" type="text" 
              defaultValue={profile.full_name} 
              className="input" 
            />
            {state?.errors?.full_name && <p style={{ color: "var(--color-danger)", fontSize: "12px", marginTop: 4 }}>{state.errors.full_name[0]}</p>}
          </div>

          <div>
            <label className="input-label" htmlFor="company_name">Kompaniya nomi</label>
            <input 
              id="company_name" name="company_name" type="text" 
              defaultValue={profile.company_name || ""} 
              className="input" 
              placeholder="MChJ / YaTT nomi"
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label className="input-label" htmlFor="region">Hudud</label>
              <select 
                id="region" name="region" 
                defaultValue={profile.region || ""} 
                className="input"
              >
                <option value="">Tanlang...</option>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label className="input-label" htmlFor="address">To&apos;liq manzil</label>
              <input 
                id="address" name="address" type="text" 
                defaultValue={profile.address || ""} 
                className="input" 
              />
            </div>
          </div>

          {profile.role === "supplier" && (
            <div>
              <label className="input-label">STIR / INN (Soliq to&apos;lovchi raqami)</label>
              <input 
                type="text" 
                value={profile.tin || ""} 
                disabled 
                className="input" 
                style={{ opacity: 0.6 }}
              />
              <p style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: 4 }}>
                STIRni o&apos;zgartirish uchun admin bilan bog&apos;laning. Yoki KYB bo&apos;limiga kiring.
              </p>
            </div>
          )}

          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <SubmitButton />
          </div>
        </form>
      </div>

    </main>
  );
}
