"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";
import Link from "next/link";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await loginAction(formData);
  }, null);

  return (
    <main className="min-h-dvh flex items-center justify-center p-4 fade-in" style={{ background: "var(--color-bg-base)" }}>
      <div className="card" style={{ width: "100%", maxWidth: 420, padding: "40px 32px" }}>
        
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ 
            width: 48, height: 48, 
            background: "linear-gradient(135deg, var(--color-accent), #8b5cf6)", 
            borderRadius: "var(--radius-lg)", 
            margin: "0 auto 16px",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Tizimga kirish</h1>
          <p style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
            Bozor-Analitika platformasiga xush kelibsiz
          </p>
        </div>

        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          
          {state?.error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", padding: 12, borderRadius: "var(--radius-md)", color: "var(--color-danger)", fontSize: "14px", textAlign: "center" }}>
              {state.error}
            </div>
          )}

          <div>
            <label className="input-label" htmlFor="email">Email manzil</label>
            <input id="email" name="email" type="email" required className="input" placeholder="admin@example.com" />
          </div>

          <div>
            <label className="input-label" htmlFor="password">Parol</label>
            <input id="password" name="password" type="password" required className="input" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={isPending} className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: 8 }}>
            {isPending ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : "Kirish"}
          </button>

        </form>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: "14px", color: "var(--color-text-muted)" }}>
          Akkauntingiz yo'qmi?{" "}
          <Link href="/register" style={{ color: "var(--color-accent-light)", fontWeight: 600, textDecoration: "none" }}>
            Ro'yxatdan o'tish
          </Link>
        </div>

      </div>
    </main>
  );
}
