"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useCollaborationContextOptional } from "./CollaborationProvider";

interface AnnotationThreadProps {
  messageId: string;
  onClose: () => void;
}

export function AnnotationThread({ messageId, onClose }: AnnotationThreadProps) {
  const ctx = useCollaborationContextOptional();
  const [draft, setDraft] = useState("");

  if (!ctx) return null;

  const annotations = ctx.annotations[messageId] ?? [];

  return (
    <div className="rounded-lg border border-surface-700 bg-surface-900 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-surface-800">
        <span className="text-xs font-medium text-surface-200">Comments</span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-surface-500 hover:text-surface-200 hover:bg-surface-800"
          aria-label="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <ul className="max-h-48 overflow-y-auto px-2 py-2 space-y-2 text-xs">
        {annotations.map((a) => (
          <li key={a.id} className="rounded border border-surface-800 bg-surface-950/60 p-2">
            <div className="flex justify-between gap-2 text-[10px] text-surface-500 mb-1">
              <span>{a.author.name}</span>
              <button
                type="button"
                className="text-surface-400 hover:text-surface-200"
                onClick={() => ctx.resolveAnnotation(a.id, !a.resolved)}
              >
                {a.resolved ? "Reopen" : "Resolve"}
              </button>
            </div>
            <p className="text-surface-200 whitespace-pre-wrap">{a.text}</p>
          </li>
        ))}
      </ul>
      <div className="p-2 border-t border-surface-800 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a comment…"
          className="flex-1 min-w-0 rounded bg-surface-950 border border-surface-700 px-2 py-1.5 text-xs text-surface-100"
        />
        <button
          type="button"
          className="shrink-0 rounded bg-brand-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-40"
          disabled={!draft.trim()}
          onClick={() => {
            const t = draft.trim();
            if (!t) return;
            ctx.addAnnotation(messageId, t);
            setDraft("");
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
