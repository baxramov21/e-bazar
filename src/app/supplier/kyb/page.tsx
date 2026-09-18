"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function KYBSumbissionPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [tin, setTin] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(data);
        if (data?.tin) setTin(data.tin);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tin || tin.length < 9) {
      setError("STIR/INN noto'g'ri (kamida 9 ta raqam)");
      return;
    }
    if (!file && !profile?.kyb_verified_at && profile?.kyb_status !== "pending") {
      setError("Guvohnoma nusxasini yuklash majburiy");
      return;
    }

    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
      // 1. Upload file if provided
      if (file && user) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/kyb-doc-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("kyb-docs")
          .upload(filePath, file);
          
        if (uploadError) throw new Error("Fayl yuklashda xatolik: " + uploadError.message);
      }

      // 2. Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          tin: tin,
          kyb_status: "pending"
        })
        .eq("id", user!.id);

      if (updateError) throw new Error("Profilni yangilashda xatolik: " + updateError.message);

      // 3. Create notification for admin
      await supabase.from("notifications").insert({
        user_id: user!.id,
        type: "kyb_submission",
        title: "Yangi KYB arizasi",
        body: `${profile?.company_name || profile?.full_name} tomonidan KYB arizasi tushdi.`,
      });

      setSuccess(true);
      
      // Auto redirect after 2s
      setTimeout(() => {
        window.location.href = "/supplier/dashboard";
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="page-container p-8"><div className="skeleton" style={{ height: 400 }} /></div>;
  if (!profile || profile.role !== "supplier") return null;

  return (
    <main className="page-container fade-in" style={{ padding: "40px 24px", maxWidth: 640 }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>KYB Verifikatsiyasi</h1>
          <p style={{ color: "var(--color-text-muted)" }}>Biznesingizni tasdiqlang</p>
        </div>
        <Link href="/supplier/dashboard" className="btn btn-secondary btn-sm">Orqaga</Link>
      </div>

      <div className="card">
        {success ? (
          <div className="empty-state">
            <div style={{ fontSize: "3rem" }}>✅</div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-success)" }}>
              Arizangiz qabul qilindi!
            </h2>
            <p style={{ color: "var(--color-text-muted)" }}>
              Adminstrator tez orada hujjatingizni tekshirib chiqadi. Sizni bosh sahifaga qaytaramiz...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "var(--radius-lg)", padding: "16px", fontSize: "14px" }}>
              <strong>Nima uchun KYB kerak?</strong> Platformada mahsulot e'lon qilish uchun korxonangiz haqiqiy ekanligini tasdiqlashingiz lozim. Bu xaridorlar ishonchini oshiradi.
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-lg)", padding: "12px 16px", color: "var(--color-danger)" }}>
                {error}
              </div>
            )}

            <div>
              <label className="input-label" htmlFor="tin">STIR / INN (9 xonali raqam)</label>
              <input 
                id="tin" type="text" 
                value={tin} onChange={(e) => setTin(e.target.value.replace(/[^0-9]/g, '').slice(0, 9))}
                className="input" 
                placeholder="123456789"
                required
              />
            </div>

            <div>
              <label className="input-label" htmlFor="document">Davlat ro&apos;yxatidan o&apos;tganlik guvohnomasi (PDF yoki rasm)</label>
              <div style={{ 
                border: "2px dashed var(--color-border-strong)", 
                borderRadius: "var(--radius-lg)", 
                padding: "32px 16px", 
                textAlign: "center",
                background: "var(--color-bg-elevated)",
                cursor: "pointer",
                transition: "border-color var(--transition)"
              }}
              onClick={() => document.getElementById('document')?.click()}
              >
                <input 
                  id="document" type="file" 
                  accept=".pdf,image/*" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ display: "none" }} 
                />
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>📄</div>
                <div style={{ fontWeight: 600 }}>
                  {file ? file.name : "Faylni tanlash uchun bosing"}
                </div>
                {!file && <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: 4 }}>Max hajm: 5MB</div>}
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <button 
                type="submit" 
                disabled={submitting} 
                className="btn btn-primary btn-lg" 
                style={{ width: "100%" }}
              >
                {submitting ? "Yuborilmoqda..." : "Arizani Yuborish"}
              </button>
            </div>
          </form>
        )}
      </div>

    </main>
  );
}
