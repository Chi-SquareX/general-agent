"use client";

import { Sparkles } from "lucide-react";
import { useChatStore } from "@/lib/store";

export function QuickActions({ onNavigate }: { onNavigate?: () => void }) {
  const { createConversation, setActiveConversation } = useChatStore();

  return (
    <div className="flex-shrink-0 border-t border-surface-800 p-2">
      <button
        type="button"
        onClick={() => {
          const id = createConversation();
          setActiveConversation(id);
          onNavigate?.();
        }}
        className="w-full flex items-center justify-center gap-2 rounded-md bg-brand-600/90 hover:bg-brand-600 text-white text-xs font-medium py-2 px-3 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" aria-hidden />
        New chat
      </button>
    </div>
  );
}
