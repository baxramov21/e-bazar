import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col" style={{ background: 'var(--color-bg-base)' }}>
      
      {/* Navigation */}
      <nav style={{ 
        padding: "24px 40px", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        borderBottom: "1px solid var(--color-border)",
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(12px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "0.02em" }}>e-Bozor</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <Link href="/buyer/dashboard" className="btn btn-ghost">Xaridor (Dev)</Link>
          <Link href="/supplier/dashboard" className="btn btn-primary">Yetkazib Beruvchi (Dev)</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 fade-in">
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(59,130,246,0.1)",
          border: "1px solid rgba(59,130,246,0.2)",
          padding: "6px 16px",
          borderRadius: "var(--radius-full)",
          color: "var(--color-accent-light)",
          fontSize: "13px",
          fontWeight: 600,
          marginBottom: 32
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-accent)", boxShadow: "0 0 8px var(--color-accent)" }} />
          B2B Savdoda Sun'iy Intellekt Davri
        </div>
        
        <h1 style={{ 
          fontSize: 'clamp(3rem, 5vw, 4.5rem)', 
          fontWeight: 800, 
          lineHeight: 1.1, 
          marginBottom: 24,
          maxWidth: 900,
          letterSpacing: "-0.02em"
        }}>
          Bozorni <span className="gradient-text">raqamlashtiring</span>, <br />
          savdoni tezlashtiring.
        </h1>

        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--color-text-secondary)', 
          marginBottom: 48,
          maxWidth: 600,
          lineHeight: 1.6
        }}>
          O'zbekistonning birinchi AI-asosidagi ulgurji savdo platformasi. 
          Ishonchli xaridorlar va tasdiqlangan yetkazib beruvchilarni soniyalar ichida toping.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/buyer/dashboard" className="btn btn-primary btn-lg" style={{ padding: "16px 32px", fontSize: "1.1rem" }}>
            Xaridor Sifatida Kirish
          </Link>
          <Link href="/supplier/dashboard" className="btn btn-secondary btn-lg" style={{ padding: "16px 32px", fontSize: "1.1rem" }}>
            Yetkazib Beruvchi Sifatida Kirish
          </Link>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 64,
          marginTop: 80, paddingTop: 40,
          borderTop: '1px solid var(--color-border)',
          width: '100%', maxWidth: 800
        }}>
          {[
            { label: "Kompaniyalar", value: "2,500+" },
            { label: "Muvaffaqiyatli Bitimlar", value: "15,000+" },
            { label: "Oylik Aylanma", value: "10B+ UZS" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
