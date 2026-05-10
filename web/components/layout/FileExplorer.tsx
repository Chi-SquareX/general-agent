"use client";

import { FolderOpen } from "lucide-react";
import { useChatStore } from "@/lib/store";

export function FileExplorer() {
  const workspaceRoot = useChatStore((s) => s.settings.workspaceRoot);

  return (
    <div className="flex flex-col flex-1 min-h-0 p-3 gap-2">
      <div className="flex items-center gap-2 text-xs font-medium text-surface-400">
        <FolderOpen className="w-4 h-4" aria-hidden />
        Workspace
      </div>
      <p className="text-xs text-surface-500 leading-relaxed">
        The agent runs tools against the directory you set in{" "}
        <span className="text-surface-300">Settings → Workspace root</span>.
      </p>
      <div className="rounded-md border border-surface-800 bg-surface-950/50 px-2 py-2 font-mono text-[11px] text-surface-300 break-all">
        {workspaceRoot?.trim() ? workspaceRoot : "(not set — defaults to server cwd)"}
      </div>
      <p className="text-[11px] text-surface-600 leading-relaxed">
        With Docker Compose, use <code className="text-surface-400">/workspace</code> to target the
        mounted volume.
      </p>
    </div>
  );
}
