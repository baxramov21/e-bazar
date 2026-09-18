"use client";

import { useActionState } from "react";
import { submitRatingAction } from "./actions";
import Link from "next/link";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary" style={{ width: "100%", marginTop: 16 }}>
      {pending ? "Yuborilmoqda..." : "Baholashni yakunlash"}
    </button>
  );
}

export default function RateSupplierPage({ params }: { params: { id: string } }) {
  const [state, action] = useActionState(submitRatingAction, null);

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", maxWidth: 600 }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Xizmatni baholang</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Sotuvchi va platforma xizmatlari haqida fikringizni qoldiring</p>
        </div>
        <Link href="/buyer/orders" className="btn btn-secondary btn-sm">O'tkazib yuborish</Link>
      </div>

      <div className="card">
        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <input type="hidden" name="orderId" value={params.id} />
          
          <div>
            <label className="input-label" style={{ fontSize: "1.1rem", marginBottom: 12 }}>Sotuvchi qanday xizmat ko'rsatdi?</label>
            <div style={{ display: "flex", gap: 12 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <label key={star} style={{ cursor: "pointer", fontSize: "2rem" }}>
                  <input type="radio" name="score" value={star} style={{ display: "none" }} required />
                  <span style={{ color: "var(--color-border)", filter: "grayscale(100%)", transition: "all 0.2s" }} 
                        onClick={(e) => {
                          const labels = e.currentTarget.parentElement?.parentElement?.querySelectorAll('span');
                          labels?.forEach((l, i) => {
                            if (i < star) {
                              l.style.filter = "none";
                              l.style.color = "#fbbf24";
                            } else {
                              l.style.filter = "grayscale(100%)";
                              l.style.color = "var(--color-border)";
                            }
                          });
                        }}>
                    ⭐
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="comment">Qo'shimcha izoh (ixtiyoriy)</label>
            <textarea id="comment" name="comment" className="input" rows={4} placeholder="Juda tez yetkazib berishdi..." style={{ resize: "none" }}></textarea>
          </div>

          <SubmitButton />
        </form>
      </div>

    </main>
  );
}
