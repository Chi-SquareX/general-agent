const STATIC_FEATURES = {
	// Core runtime behavior retained for agent loop quality/latency.
	REACTIVE_COMPACT: false,
	CACHED_MICROCOMPACT: false,
	CONTEXT_COLLAPSE: false,
	TOKEN_BUDGET: false,
	// Optional subsystems explicitly disabled in general-agent extract.
	PROACTIVE: false,
	KAIROS: false,
	KAIROS_PUSH_NOTIFICATION: false,
	KAIROS_GITHUB_WEBHOOKS: false,
	AGENT_TRIGGERS: false,
	AGENT_TRIGGERS_REMOTE: false,
	MONITOR_TOOL: false,
	WORKFLOW_SCRIPTS: false,
	WEB_BROWSER_TOOL: false,
	UDS_INBOX: false,
	COORDINATOR_MODE: false,
	HISTORY_SNIP: false,
	BG_SESSIONS: false,
	CHICAGO_MCP: false,
	OVERFLOW_TEST_TOOL: false,
} as const

type FeatureKey = keyof typeof STATIC_FEATURES

export function feature(name: string): boolean {
	if (name in STATIC_FEATURES) {
		return STATIC_FEATURES[name as FeatureKey]
	}

	// Allow opt-in unknown flags without code changes.
	return process.env[`GENERAL_AGENT_FEATURE_${name}`] === 'true'
}
