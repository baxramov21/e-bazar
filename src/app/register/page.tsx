"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction, type RegisterState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn btn-primary btn-lg"
      style={{ width: "100%", marginTop: 8 }}
    >
      {pending ? (
        <>
          <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Yuklanmoqda...
        </>
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Platformaga Kirish
        </>
      )}
    </button>
  );
}

const ROLES = [
  {
    value: "buyer",
    label: "Xaridor",
    labelRu: "Покупатель",
    description: "Mahsulot yoki xom ashyo xarid qilaman",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
    color: "var(--color-buyer)",
    colorDim: "rgba(139,92,246,0.15)",
  },
  {
    value: "supplier",
    label: "Yetkazib Beruvchi",
    labelRu: "Поставщик",
    description: "Mahsulot yoki xom ashyo sotaman",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    color: "var(--color-supplier)",
    colorDim: "rgba(6,182,212,0.15)",
  },
];

export default function RegisterPage() {
  const initialState: RegisterState = {};
  const [state, action] = useActionState(registerAction, initialState);

  return (
    <main className="min-h-dvh flex items-center justify-center p-4" style={{ background: "var(--color-bg-base)" }}>
      <div className="slide-up" style={{ width: "100%", maxWidth: 480 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56,
            background: "linear-gradient(135deg, var(--color-accent), #8b5cf6)",
            borderRadius: "var(--radius-lg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "var(--shadow-glow)",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: 8 }}>
            Bozor-Analitika
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            Platformaga kirish uchun ma&apos;lumotlaringizni kiriting
          </p>
        </div>

        {/* Form card */}
        <div className="card-elevated" style={{ padding: 32 }}>
          <form action={action} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* General error */}
            {state?.errors?.general && (
              <div style={{
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "var(--radius-lg)", padding: "12px 16px",
                color: "var(--color-danger)", fontSize: "14px",
              }}>
                {state.errors.general[0]}
              </div>
            )}

            {/* First Name */}
            <div>
              <label className="input-label" htmlFor="firstName">Ism</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Ali"
                autoComplete="given-name"
                className="input"
                style={state?.errors?.firstName ? { borderColor: "var(--color-danger)" } : {}}
              />
              {state?.errors?.firstName && (
                <p style={{ color: "var(--color-danger)", fontSize: "12px", marginTop: 4 }}>
                  {state.errors.firstName[0]}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="input-label" htmlFor="lastName">Familiya</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Karimov"
                autoComplete="family-name"
                className="input"
                style={state?.errors?.lastName ? { borderColor: "var(--color-danger)" } : {}}
              />
              {state?.errors?.lastName && (
                <p style={{ color: "var(--color-danger)", fontSize: "12px", marginTop: 4 }}>
                  {state.errors.lastName[0]}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="input-label">Men kimman?</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {ROLES.map((role) => (
                  <label
                    key={role.value}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center",
                      gap: 10, padding: "18px 12px",
                      border: "2px solid var(--color-border)",
                      borderRadius: "var(--radius-lg)",
                      cursor: "pointer",
                      transition: "all var(--transition)",
                      textAlign: "center",
                    }}
                    className="role-card"
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      style={{ display: "none" }}
                      className="role-radio"
                    />
                    <div style={{ color: role.color }}>
                      {role.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--color-text-primary)" }}>
                        {role.label}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: 2 }}>
                        {role.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {state?.errors?.role && (
                <p style={{ color: "var(--color-danger)", fontSize: "12px", marginTop: 4 }}>
                  {state.errors.role[0]}
                </p>
              )}
            </div>

            <SubmitButton />
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: "12px", color: "var(--color-text-muted)" }}>
          MVP versiyasi — barcha ma&apos;lumotlar vaqtincha saqlanadi
        </p>
      </div>

      {/* Role card hover/selected styles */}
      <style>{`
        .role-card:has(.role-radio:checked) {
          border-color: var(--color-accent) !important;
          background: var(--color-accent-dim);
        }
        .role-card:hover {
          border-color: var(--color-border-strong) !important;
          background: var(--color-bg-hover);
        }
        .spin {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
