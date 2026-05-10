import type { Message } from "./types";

const getApiUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export interface StreamChunk {
  type: "text" | "tool_use" | "tool_result" | "done" | "error";
  content?: string;
  tool?: {
    id: string;
    name: string;
    input?: Record<string, unknown>;
    result?: string;
    is_error?: boolean;
  };
  error?: string;
}

export async function* streamChat(
  messages: Pick<Message, "role" | "content">[],
  model: string,
  signal?: AbortSignal,
  options?: {
    sessionId?: string;
    workspaceRoot?: string;
    apiKey?: string;
  }
): AsyncGenerator<StreamChunk> {
  const promptMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");
  const prompt =
    typeof promptMessage?.content === "string"
      ? promptMessage.content
      : Array.isArray(promptMessage?.content)
      ? promptMessage.content
          .filter((block) => typeof block === "object" && block?.type === "text")
          .map((block) => ("text" in block ? block.text : ""))
          .join("\n")
      : "";

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(options?.apiKey ? { "x-api-key": options.apiKey } : {}),
    },
    body: JSON.stringify({
      messages,
      prompt,
      model,
      stream: true,
      sessionId: options?.sessionId,
      workspaceRoot: options?.workspaceRoot,
    }),
    signal,
  });

  if (!response.ok) {
    const err = await response.text();
    yield { type: "error", error: err };
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    yield { type: "error", error: "No response body" };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            yield { type: "done" };
            return;
          }
          try {
            const chunk = JSON.parse(data) as StreamChunk;
            yield chunk;
          } catch {
            // skip malformed chunks
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  yield { type: "done" };
}

export async function fetchHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${getApiUrl()}/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}
