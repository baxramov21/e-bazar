"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Search, ClipboardList, Settings, PlusCircle, LineChart, Activity, Bot, MessageSquare } from "lucide-react";

export default function BuyerSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/buyer/dashboard" && pathname === "/buyer/dashboard") return true;
    if (path !== "/buyer/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <aside style={{
      width: "260px",
      height: "100dvh",
      background: "#111111", // Dark Theme Retained from rules
      borderRight: "1px solid var(--color-border)",
      position: "sticky",
      top: 0,
      display: "flex",
      flexDirection: "column",
      padding: "24px 16px"
    }}>
      
      {/* Logo */}
      <div style={{ padding: "0 12px", marginBottom: 40 }}>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, background: "linear-gradient(135deg, var(--color-accent-light), #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          e-Bozor
        </h2>
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
          Xaridor paneli
        </span>
      </div>

      {/* Main Action */}
      <div style={{ marginBottom: 24, padding: "0 8px" }}>
        <Link href="/buyer/rfq/new" className="btn btn-primary" style={{ width: "100%", justifyContent: "flex-start", padding: "12px 16px" }}>
          <PlusCircle size={18} />
          Yangi so'rov
        </Link>
      </div>

      {/* Nav Links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <Link href="/buyer/dashboard" className={`nav-item ${isActive("/buyer/dashboard") ? "active" : ""}`}>
          <LayoutDashboard size={18} />
          Asosiy
        </Link>
        <Link href="/buyer/messages" className={`nav-item ${isActive("/buyer/messages") ? "active" : ""}`}>
          <MessageSquare size={18} />
          BozorAI Xabarlari
        </Link>
        <Link href="/buyer/chats" className={`nav-item ${isActive("/buyer/chats") ? "active" : ""}`}>
          <MessageSquare size={18} />
          Suhbatlar
        </Link>
        <Link href="/buyer/rfq" className={`nav-item ${isActive("/buyer/rfq") ? "active" : ""}`}>
          <ClipboardList size={18} />
          So'rovlarim
        </Link>
        <Link href="/buyer/ai-search" className={`nav-item ${isActive("/buyer/ai-search") ? "active" : ""}`}>
          <Bot size={18} />
          AI Qidiruv (BozorAI)
        </Link>
        <Link href="/buyer/analytics" className={`nav-item ${isActive("/buyer/analytics") ? "active" : ""}`}>
          <LineChart size={18} />
          Bozor Analitikasi
        </Link>
        <Link href="/buyer/market" className={`nav-item ${isActive("/buyer/market") ? "active" : ""}`}>
          <Activity size={18} />
          Jonli Savdo
        </Link>
        <Link href="/listings" className="nav-item">
          <Search size={18} />
          Bozorni ko'rish
        </Link>
      </nav>

      {/* Bottom Settings */}
      <div style={{ borderTop: "1px solid var(--color-border-strong)", paddingTop: 16, marginTop: "auto" }}>
        <Link href="/settings/profile" className={`nav-item ${isActive("/settings/profile") ? "active" : ""}`}>
          <Settings size={18} />
          Sozlamalar
        </Link>
      </div>

    </aside>
  );
}
