"use client";

import AITerminal from "./AITerminal";
import { runAiMatchingAction } from "@/app/buyer/rfq/[id]/actions";
import { useTransition } from "react";

export default function AILoadingWrapper({ rfqId }: { rfqId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleComplete = () => {
    startTransition(() => {
      runAiMatchingAction(rfqId);
    });
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: 16 }}>BozorAI™ Tahlili</h2>
      <div style={{ opacity: isPending ? 0.7 : 1, transition: "opacity 0.3s" }}>
        <AITerminal onComplete={handleComplete} />
      </div>
    </div>
  );
}
