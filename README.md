# general-agent

`general-agent` is a trimmed Claude-style agentic framework extracted from the
local `claude-code` tree.

It keeps the core runtime architecture:

- `src/QueryEngine.ts` for orchestration
- `src/query.ts` for the recursive tool-call loop
- `src/Tool.ts` for tool contracts
- `src/tools/` for built-in tools

It adds a simpler customization layer:

- `src/tools.config.ts` is the single registry filter for built-in tools
- `GENERAL_AGENT_TOOLS` env var can override enabled tools at runtime

## Quick start

1. Copy `.env.example` to `.env`
2. Set `ANTHROPIC_API_KEY`
3. Install dependencies:

```bash
bun install
```

4. Start interactive server:

```bash
bun run agent-server
```

## Tool customization

See `docs/adding-tools.md`.

## Notes

- This repo keeps Anthropic + Bedrock + Vertex SDK compatibility.
- The extraction intentionally disables many optional feature flags by default
  in `src/features.ts` while preserving core loop behavior.
