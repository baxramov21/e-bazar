"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Search, ClipboardList, Settings, PlusCircle, CreditCard, MessageSquare } from "lucide-react";

export default function SupplierSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/supplier/dashboard" && pathname === "/supplier/dashboard") return true;
    if (path !== "/supplier/dashboard" && pathname.startsWith(path)) return true;
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
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, background: "linear-gradient(135deg, var(--color-supplier), #0ea5e9)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Bozor-Analitika
        </h2>
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
          Yetkazib beruvchi
        </span>
      </div>

      {/* Main Action */}
      <div style={{ marginBottom: 24, padding: "0 8px" }}>
        <Link href="/supplier/listings/new" className="btn btn-primary" style={{ width: "100%", justifyContent: "flex-start", padding: "12px 16px", background: "var(--color-supplier)" }}>
          <PlusCircle size={18} />
          E'lon qo'shish
        </Link>
      </div>

      {/* Nav Links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <Link href="/supplier/dashboard" className={`nav-item ${isActive("/supplier/dashboard") ? "active" : ""}`}>
          <LayoutDashboard size={18} />
          Asosiy
        </Link>
        <Link href="/supplier/orders" className={`nav-item ${isActive("/supplier/orders") ? "active" : ""}`}>
          <ClipboardList size={18} />
          Buyurtmalar
        </Link>
        <Link href="/supplier/chats" className={`nav-item ${isActive("/supplier/chats") ? "active" : ""}`}>
          <MessageSquare size={18} />
          Suhbatlar
        </Link>
        <Link href="/supplier/listings" className={`nav-item ${isActive("/supplier/listings") ? "active" : ""}`}>
          <Package size={18} />
          Mahsulotlarim
        </Link>
        <Link href="/supplier/billing" className={`nav-item ${isActive("/supplier/billing") ? "active" : ""}`}>
          <CreditCard size={18} />
          Moliyaviy holat
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
