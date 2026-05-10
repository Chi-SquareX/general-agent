import type { Tools } from './Tool.js'

/**
 * Core baseline for general-agent.
 *
 * Add new built-in tools by appending their names to `DEFAULT_ENABLED_TOOLS`
 * (or by setting GENERAL_AGENT_TOOLS env var at runtime).
 */
export const DEFAULT_ENABLED_TOOLS = new Set<string>([
	// Agentic core
	'Task',
	'TaskOutput',
	'Bash',
	'Glob',
	'Grep',
	'Read',
	'Edit',
	'Write',
	'WebFetch',
	'WebSearch',
	'TodoWrite',
	// Extended support
	'Agent',
	'TaskStop',
	'MCP',
	'ListMcpResources',
	'ReadMcpResource',
	'Hello',
])

function parseToolListFromEnv(): Set<string> | null {
	const raw = process.env.GENERAL_AGENT_TOOLS?.trim()
	if (!raw) return null
	return new Set(
		raw
			.split(',')
			.map((part) => part.trim())
			.filter(Boolean),
	)
}

export function applyGeneralAgentToolConfig(tools: Tools): Tools {
	const configured = parseToolListFromEnv()
	const allow = configured ?? DEFAULT_ENABLED_TOOLS
	return tools.filter((tool) => allow.has(tool.name))
}
