"use client";

import { useRouter } from "next/navigation";

export default function BackButton({ fallback }: { fallback?: string }) {
  const router = useRouter();

  return (
    <button 
      onClick={() => {
        if (window.history.length > 2) {
          router.back();
        } else if (fallback) {
          router.push(fallback);
        } else {
          router.push("/");
        }
      }} 
      className="btn btn-secondary btn-sm"
      style={{ display: "flex", alignItems: "center", gap: "8px" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      Orqaga
    </button>
  );
}
