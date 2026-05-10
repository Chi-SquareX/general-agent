import type { ContentBlockParam } from '@anthropic-ai/sdk/resources/messages.mjs'
import type { SDKMessage } from 'src/entrypoints/agentSdkTypes.js'
import type { StreamChunk } from './types.js'

function asText(value: unknown): string {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function* mapAssistantContent(content: ContentBlockParam[] | string): Generator<StreamChunk> {
  if (typeof content === 'string') {
    if (content.length > 0) {
      yield { type: 'text', content }
    }
    return
  }

  for (const block of content) {
    if (block.type === 'text') {
      if (block.text.length > 0) {
        yield { type: 'text', content: block.text }
      }
      continue
    }
    if (block.type === 'tool_use') {
      yield {
        type: 'tool_use',
        tool: {
          id: block.id,
          name: block.name,
          input:
            block.input && typeof block.input === 'object'
              ? (block.input as Record<string, unknown>)
              : undefined,
        },
      }
    }
  }
}

function* mapUserToolResults(
  content: ContentBlockParam[] | string,
): Generator<StreamChunk> {
  if (!Array.isArray(content)) return

  for (const block of content) {
    if (block.type !== 'tool_result') continue
    const rendered =
      typeof block.content === 'string'
        ? block.content
        : Array.isArray(block.content)
          ? block.content
              .map(item => {
                if (typeof item === 'string') return item
                if (item.type === 'text') return item.text
                return asText(item)
              })
              .join('\n')
          : asText(block.content)

    yield {
      type: 'tool_result',
      tool: {
        id: block.tool_use_id,
        result: rendered,
        is_error: block.is_error,
      },
      content: rendered,
    }
  }
}

export function* sdkMessageToStreamChunks(
  message: SDKMessage,
): Generator<StreamChunk> {
  if (message.type === 'assistant') {
    yield* mapAssistantContent(message.message.content)
    return
  }

  if (message.type === 'user') {
    yield* mapUserToolResults(message.message.content)
    return
  }

  if (message.type === 'result') {
    if (message.is_error) {
      const fallback = message.subtype ?? 'Unknown agent error'
      const errors =
        message.errors && message.errors.length > 0
          ? message.errors.join('\n')
          : fallback
      yield { type: 'error', error: errors }
    } else {
      yield { type: 'done' }
    }
  }
}
