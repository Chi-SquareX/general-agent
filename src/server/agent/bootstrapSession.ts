import { resolve } from 'node:path'
import { QueryEngine } from 'src/QueryEngine.js'
import { getCommands } from 'src/commands.js'
import type { CanUseToolFn } from 'src/hooks/useCanUseTool.js'
import { type AppState, getDefaultAppState } from 'src/state/AppStateStore.js'
import { type Tool, type Tools } from 'src/Tool.js'
import { getTools } from 'src/tools.js'
import {
  createFileStateCacheWithSizeLimit,
  READ_FILE_STATE_CACHE_SIZE,
  type FileStateCache,
} from 'src/utils/fileStateCache.js'

type AgentSession = {
  engine: QueryEngine
  cwd: string
  readFileCache: FileStateCache
  setApiKey: (apiKey: string | undefined) => void
}

function mergeTools(baseTools: Tools, customTools: Tools): Tools {
  if (customTools.length === 0) return baseTools
  const byName = new Map<string, Tool>()
  for (const tool of [...baseTools, ...customTools]) {
    byName.set(tool.name, tool)
  }
  return [...byName.values()]
}

async function loadCustomTools(): Promise<Tools> {
  const customToolsPath = process.env.CLAUDE_CODE_WEB_CUSTOM_TOOLS
  if (!customToolsPath) return []

  const modulePath = resolve(customToolsPath)
  const loaded = (await import(modulePath)) as { default?: unknown; tools?: unknown }
  const tools = loaded.default ?? loaded.tools
  if (!Array.isArray(tools)) {
    throw new Error(
      `Expected custom tools module at ${modulePath} to export an array as default or "tools".`,
    )
  }
  return tools as Tools
}

export async function createAgentSession(cwd: string): Promise<AgentSession> {
  let appState: AppState = getDefaultAppState()
  const setAppState = (updater: (prev: AppState) => AppState): void => {
    appState = updater(appState)
  }
  const getAppState = (): AppState => appState

  const baseTools = getTools(appState.toolPermissionContext)
  const customTools = await loadCustomTools()
  const tools = mergeTools(baseTools, customTools)
  const commands = await getCommands(cwd)
  const readFileCache = createFileStateCacheWithSizeLimit(READ_FILE_STATE_CACHE_SIZE)

  const canUseTool: CanUseToolFn = async (_tool, input) => ({
    behavior: 'allow',
    updatedInput: input,
  })

  const engine = new QueryEngine({
    cwd,
    tools,
    commands,
    mcpClients: [],
    agents: [],
    canUseTool,
    getAppState,
    setAppState,
    readFileCache,
  })

  return {
    engine,
    cwd,
    readFileCache,
    setApiKey: apiKey => {
      if (apiKey?.trim()) {
        process.env.ANTHROPIC_API_KEY = apiKey.trim()
      }
    },
  }
}
