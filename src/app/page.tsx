export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center" style={{ background: 'var(--color-bg-base)' }}>
      <div className="page-container text-center fade-in" style={{ maxWidth: '640px' }}>

        {/* Logo mark */}
        <div style={{
          width: 72, height: 72,
          background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
          borderRadius: 'var(--radius-xl)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 32px',
          boxShadow: 'var(--shadow-glow)',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>

        <h1 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.1, marginBottom: 16 }}>
          <span className="gradient-text">Bozor-Analitika</span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
          Uzbekiston uchun AI-asosida{' '}
          <strong style={{ color: 'var(--color-text-primary)' }}>B2B savdo platformasi</strong>
        </p>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', marginBottom: 48 }}>
          Yetkazib beruvchilar va xaridorlarni aqlli tarzda bog&apos;laymiz
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/register" className="btn btn-primary btn-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Platformaga Kirish
          </a>
          <a href="/listings" className="btn btn-secondary btn-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Mahsulotlarni Ko&apos;rish
          </a>
        </div>

        {/* Stats strip */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 48,
          marginTop: 64, paddingTop: 32,
          borderTop: '1px solid var(--color-border)',
        }}>
          {[
            { label: "Yetkazib beruvchilar", value: "150+" },
            { label: "Xaridorlar", value: "50+" },
            { label: "Oylik GMV maqsad", value: "1B UZS" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-accent-light)' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
