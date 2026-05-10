"use client";

import { MessageSquare, Plus } from "lucide-react";
import { useChatStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ChatHistory({ onNavigate }: { onNavigate?: () => void }) {
  const {
    conversations,
    activeConversationId,
    createConversation,
    setActiveConversation,
    deleteConversation,
  } = useChatStore();

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-800">
        <span className="text-xs font-medium text-surface-400">Conversations</span>
        <button
          type="button"
          onClick={() => {
            const id = createConversation();
            setActiveConversation(id);
            onNavigate?.();
          }}
          className="p-1.5 rounded-md text-surface-400 hover:text-surface-100 hover:bg-surface-800"
          title="New conversation"
          aria-label="New conversation"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {conversations.length === 0 ? (
          <p className="px-3 py-4 text-xs text-surface-500 leading-relaxed">
            No chats yet. Start from the main panel or tap + to create one.
          </p>
        ) : (
          <ul className="space-y-0.5 px-1">
            {conversations.map((c) => (
              <li key={c.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveConversation(c.id);
                    onNavigate?.();
                  }}
                  className={cn(
                    "flex-1 flex items-center gap-2 min-w-0 px-2 py-2 rounded-md text-left text-xs",
                    activeConversationId === c.id
                      ? "bg-surface-800 text-surface-100"
                      : "text-surface-400 hover:bg-surface-800/60 hover:text-surface-200"
                  )}
                >
                  <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" aria-hidden />
                  <span className="truncate">{c.title}</span>
                </button>
                <button
                  type="button"
                  onClick={() => deleteConversation(c.id)}
                  className="opacity-0 group-hover:opacity-100 px-1.5 py-1 text-[10px] text-surface-500 hover:text-red-400"
                  aria-label={`Delete ${c.title}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
