import type { MessageParam } from '@anthropic-ai/sdk/resources/messages.mjs'

export type StreamChunk =
  | { type: 'text'; content: string }
  | {
      type: 'tool_use'
      tool: { id: string; name: string; input?: Record<string, unknown> }
    }
  | {
      type: 'tool_result'
      tool: {
        id: string
        name?: string
        result?: string
        is_error?: boolean
      }
      content?: string
    }
  | { type: 'done' }
  | { type: 'error'; error: string }

export type ChatRequestBody = {
  prompt?: string
  messages?: MessageParam[]
  model?: string
  sessionId?: string
  workspaceRoot?: string
  resetSession?: boolean
}
