// Minimal generated SDK core types stub for leaked-source compatibility.
// Runtime consumers in this workspace use internal query flows, not these exports.

export type SDKMessage =
  | {
      type: 'assistant'
      message: { role: 'assistant'; content: unknown }
      uuid: string
      error?: string
    }
  | {
      type: 'user'
      message: { role: 'user'; content: unknown }
      uuid: string
      timestamp?: number
      tool_use_result?: unknown
      isSynthetic?: boolean
      isReplay?: boolean
    }
  | { type: 'system'; subtype?: string; uuid?: string }
  | { type: 'stream_event'; event: unknown; uuid: string }
  | {
      type: 'result'
      is_error: boolean
      subtype?: string
      errors?: string[]
      uuid: string
    }
  | { type: 'tool_progress'; uuid: string; tool_use_id?: string }
  | { type: 'tool_use_summary'; uuid: string; summary: string }

export type SDKUserMessage = Extract<SDKMessage, { type: 'user' }>
export type SDKResultMessage = Extract<SDKMessage, { type: 'result' }>
export type SDKSessionInfo = {
  id: string
  created_at?: number
  updated_at?: number
  title?: string
}
