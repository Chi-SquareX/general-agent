import { realpath, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createAgentSession } from './bootstrapSession.js'
import { sdkMessageToStreamChunks } from './sdkToStreamChunk.js'
import type { ChatRequestBody, StreamChunk } from './types.js'

type SessionRecord = Awaited<ReturnType<typeof createAgentSession>>

const sessions = new Map<string, SessionRecord>()

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
    },
  })
}

function parseApiKey(request: Request): string | undefined {
  const direct = request.headers.get('x-api-key')?.trim()
  if (direct) return direct
  const auth = request.headers.get('authorization')?.trim()
  if (!auth) return undefined
  if (auth.toLowerCase().startsWith('bearer ')) {
    const token = auth.slice(7).trim()
    return token || undefined
  }
  return undefined
}

async function validateWorkspaceRoot(input: string): Promise<string> {
  const candidate = resolve(input)
  const info = await stat(candidate)
  if (!info.isDirectory()) {
    throw new Error(`Workspace root is not a directory: ${candidate}`)
  }
  return await realpath(candidate)
}

function extractPrompt(body: ChatRequestBody): string {
  if (typeof body.prompt === 'string' && body.prompt.trim().length > 0) {
    return body.prompt.trim()
  }

  if (Array.isArray(body.messages)) {
    for (let i = body.messages.length - 1; i >= 0; i--) {
      const msg = body.messages[i]
      if (msg?.role !== 'user') continue
      if (typeof msg.content === 'string' && msg.content.trim().length > 0) {
        return msg.content.trim()
      }
      if (Array.isArray(msg.content)) {
        const text = msg.content
          .filter(
            block =>
              typeof block === 'object' &&
              block !== null &&
              'type' in block &&
              block.type === 'text' &&
              typeof block.text === 'string',
          )
          .map(block => block.text)
          .join('\n')
          .trim()
        if (text.length > 0) return text
      }
    }
  }

  throw new Error('No user prompt found in request body.')
}

function toSseLine(chunk: StreamChunk): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`)
}

function getSessionMapKey(workspaceRoot: string, sessionId: string): string {
  return `${workspaceRoot}::${sessionId}`
}

async function getOrCreateSession(
  workspaceRoot: string,
  sessionId: string,
  resetSession: boolean,
): Promise<SessionRecord> {
  const mapKey = getSessionMapKey(workspaceRoot, sessionId)
  if (resetSession) {
    sessions.delete(mapKey)
  }
  let session = sessions.get(mapKey)
  if (!session) {
    session = await createAgentSession(workspaceRoot)
    sessions.set(mapKey, session)
  }
  return session
}

export function startAgentHttpServer(): void {
  const port = Number.parseInt(process.env.PORT ?? '3001', 10)
  const host = process.env.HOST ?? '127.0.0.1'

  Bun.serve({
    port,
    hostname: host,
    idleTimeout: 60,
    routes: {
      '/health': () =>
        jsonResponse({
          status: 'ok',
          sessions: sessions.size,
        }),
    },
    async fetch(request) {
      const { pathname } = new URL(request.url)

      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'POST,GET,OPTIONS',
            'access-control-allow-headers':
              'content-type,authorization,x-api-key',
          },
        })
      }

      if (pathname !== '/api/chat' || request.method !== 'POST') {
        return jsonResponse({ error: 'Not found' }, 404)
      }

      let body: ChatRequestBody
      try {
        body = (await request.json()) as ChatRequestBody
      } catch {
        return jsonResponse({ error: 'Invalid JSON body' }, 400)
      }

      let workspaceRoot: string
      try {
        workspaceRoot = await validateWorkspaceRoot(
          body.workspaceRoot ?? process.cwd(),
        )
      } catch (error) {
        return jsonResponse(
          {
            error:
              error instanceof Error ? error.message : 'Invalid workspace root',
          },
          400,
        )
      }

      let prompt: string
      try {
        prompt = extractPrompt(body)
      } catch (error) {
        return jsonResponse(
          { error: error instanceof Error ? error.message : 'Invalid prompt' },
          400,
        )
      }

      const sessionId =
        body.sessionId && body.sessionId.trim().length > 0
          ? body.sessionId.trim()
          : crypto.randomUUID()

      const stream = new ReadableStream({
        start: async controller => {
          try {
            const session = await getOrCreateSession(
              workspaceRoot,
              sessionId,
              body.resetSession === true,
            )

            const apiKey = parseApiKey(request)
            session.setApiKey(apiKey)

            for await (const sdkMessage of session.engine.submitMessage(prompt)) {
              for (const chunk of sdkMessageToStreamChunks(sdkMessage)) {
                controller.enqueue(toSseLine(chunk))
              }
            }

            controller.enqueue(toSseLine({ type: 'done' }))
            controller.close()
          } catch (error) {
            const message =
              error instanceof Error ? error.message : 'Agent request failed'
            controller.enqueue(toSseLine({ type: 'error', error: message }))
            controller.enqueue(toSseLine({ type: 'done' }))
            controller.close()
          }
        },
      })

      return new Response(stream, {
        headers: {
          'content-type': 'text/event-stream; charset=utf-8',
          'cache-control': 'no-cache, no-transform',
          connection: 'keep-alive',
          'access-control-allow-origin': '*',
        },
      })
    },
  })

  // biome-ignore lint/suspicious/noConsole: startup visibility
  console.log(`Claude web agent listening on http://${host}:${port}`)
}
