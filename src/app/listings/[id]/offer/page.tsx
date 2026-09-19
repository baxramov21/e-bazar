"use client";

import { useActionState, use } from "react";
import { useFormStatus } from "react-dom";
import { submitOfferAction } from "./actions";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn btn-primary" style={{ width: "100%", height: 48, fontSize: "1.05rem" }}>
      {pending ? "Yuborilmoqda..." : "Taklifni yuborish va Chatni boshlash"}
    </button>
  );
}

export default function MakeOfferPage({ params }: { params: any }) {
  const [state, action] = useActionState(submitOfferAction, null);
  const unwrappedParams: any = use(params);
  const id = unwrappedParams.id;
  
  const [listing, setListing] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("listings").select("*, supplier:profiles!supplier_id(company_name, full_name)").eq("id", id).single();
      setListing(data);
    }
    load();
  }, [id]);

  if (!listing) {
    return <div style={{ padding: 40, textAlign: "center" }}>Yuklanmoqda...</div>;
  }

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", maxWidth: 600 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>Sotuvchiga Taklif Yuborish</h1>
          <p style={{ color: "var(--color-text-muted)" }}>{listing.title} bo'yicha muzokarani boshlang</p>
        </div>
        <Link href={`/listings/${id}`} className="btn btn-secondary btn-sm">Bekor qilish</Link>
      </div>

      <div className="card">
        <form action={action} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <input type="hidden" name="listing_id" value={listing.id} />
          <input type="hidden" name="supplier_id" value={listing.supplier_id} />
          <input type="hidden" name="unit" value={listing.unit} />
          
          {state?.error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-md)", padding: "12px", color: "var(--color-danger)" }}>
              {state.error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label className="input-label" htmlFor="quantity">Sotib olinadigan miqdor ({listing.unit})</label>
              <input id="quantity" name="quantity" type="number" min={listing.moq} defaultValue={listing.moq} className="input" required />
            </div>
            <div>
              <label className="input-label" htmlFor="price_per_unit">Taklif qilinayotgan narx (1 birlik uchun)</label>
              <input id="price_per_unit" name="price_per_unit" type="number" min="1" defaultValue={listing.price_per_unit} className="input" required />
            </div>
          </div>

          <div>
            <label className="input-label" htmlFor="delivery_address">Yetkazib berish manzili</label>
            <input id="delivery_address" name="delivery_address" type="text" className="input" placeholder="Masalan: Toshkent shahar, Yunusobod tumani" required />
          </div>

          <div>
            <label className="input-label" htmlFor="message">Ilk Xabaringiz</label>
            <textarea 
              id="message" 
              name="message" 
              className="input" 
              placeholder="Assalomu alaykum, ushbu mahsulot bo'yicha kelishmoqchi edim..." 
              required 
              style={{ minHeight: 120, resize: "vertical" }}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <SubmitButton />
          </div>
        </form>
      </div>
    </main>
  );
}
