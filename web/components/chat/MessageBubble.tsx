"use client";

import { User, Bot, AlertCircle } from "lucide-react";
import { cn, extractTextContent } from "@/lib/utils";
import type { Message } from "@/lib/types";
import { MarkdownContent } from "./MarkdownContent";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isError = message.status === "error";
  const text = extractTextContent(message.content);

  return (
    <article
      className={cn(
        "flex gap-3 animate-fade-in",
        isUser && "flex-row-reverse"
      )}
      aria-label={isUser ? "You" : isError ? "Error from Claude" : "Claude"}
    >
      {/* Avatar — purely decorative, role conveyed by article label */}
      <div
        aria-hidden="true"
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
          isUser
            ? "bg-brand-600 text-white"
            : isError
            ? "bg-red-900 text-red-300"
            : "bg-surface-700 text-surface-300"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" aria-hidden="true" />
        ) : isError ? (
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
        ) : (
          <Bot className="w-4 h-4" aria-hidden="true" />
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          "flex-1 min-w-0 max-w-2xl",
          isUser && "flex justify-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm",
            isUser
              ? "bg-brand-600 text-white rounded-tr-sm"
              : isError
              ? "bg-red-950 border border-red-800 text-red-200 rounded-tl-sm"
              : "bg-surface-800 text-surface-100 rounded-tl-sm"
          )}
        >
          {isUser ? <p className="whitespace-pre-wrap break-words">{text}</p> : null}
          {!isUser && renderAssistantContent(message)}
          {message.status === "streaming" && (
            <span
              aria-hidden="true"
              className="inline-block w-1.5 h-4 bg-current ml-0.5 animate-pulse-soft"
            />
          )}
        </div>
      </div>
    </article>
  );
}

function renderAssistantContent(message: Message) {
  if (typeof message.content === "string") {
    return <MarkdownContent content={message.content} />;
  }

  const blocks = message.content;
  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        if (block.type === "text") {
          return <MarkdownContent key={`text-${index}`} content={block.text} />;
        }

        if (block.type === "tool_use") {
          return (
            <ToolUseCard
              key={`tool-use-${block.id}-${index}`}
              title={block.name}
              body={JSON.stringify(block.input, null, 2)}
            />
          );
        }

        return (
          <ToolUseCard
            key={`tool-result-${block.tool_use_id}-${index}`}
            title={`Result: ${block.tool_use_id}`}
            body={extractTextContent(block.content)}
            isError={block.is_error}
          />
        );
      })}
    </div>
  );
}

function ToolUseCard({
  title,
  body,
  isError = false,
}: {
  title: string;
  body: string;
  isError?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2",
        isError
          ? "border-red-700/60 bg-red-950/30 text-red-200"
          : "border-surface-700 bg-surface-900/50 text-surface-200"
      )}
    >
      <p className="mb-1 text-xs uppercase tracking-wide text-surface-400">{title}</p>
      <pre className="whitespace-pre-wrap break-words font-mono text-xs">{body}</pre>
    </div>
  );
}
