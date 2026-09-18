import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100dvh" }}>
      {/* Sidebar */}
      <aside style={{ width: 240, background: "var(--color-bg-surface)", borderRight: "1px solid var(--color-border)", padding: "24px 16px", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 8px", marginBottom: 32 }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Admin Panel</h2>
          <span style={{ fontSize: "0.8rem", color: "var(--color-danger)", fontWeight: 700 }}>Superuser</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link href="/admin" className="btn btn-ghost" style={{ justifyContent: "flex-start", width: "100%" }}>Bosh sahifa</Link>
          <Link href="/admin/kyb" className="btn btn-ghost" style={{ justifyContent: "flex-start", width: "100%" }}>Yetkazib beruvchilar (KYB)</Link>
          <Link href="/admin/orders" className="btn btn-ghost" style={{ justifyContent: "flex-start", width: "100%" }}>Buyurtmalar</Link>
          <Link href="/admin/commission" className="btn btn-ghost" style={{ justifyContent: "flex-start", width: "100%" }}>Moliya va Komissiya</Link>
          <Link href="/admin/analytics" className="btn btn-ghost" style={{ justifyContent: "flex-start", width: "100%" }}>Analitika (Statistika)</Link>
        </nav>
        
        <div style={{ marginTop: "auto" }}>
          <Link href="/" className="btn btn-secondary" style={{ width: "100%", justifyContent: "center" }}>Asosiy saytga qaytish</Link>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ height: 60, borderBottom: "1px solid var(--color-border)", background: "var(--color-bg-base)", display: "flex", alignItems: "center", padding: "0 24px" }}>
          <span style={{ marginLeft: "auto", fontSize: "0.9rem", color: "var(--color-text-muted)" }}>Tizimga kirdi: Admin</span>
        </header>
        <div style={{ flex: 1, background: "var(--color-bg-base)", overflow: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
