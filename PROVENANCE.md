## general-agent provenance

This repository is bootstrapped from `claude-code` and then trimmed to keep the
core agentic pipeline plus an easier tool registration workflow.

### Core files intentionally preserved

- `src/Tool.ts` - canonical tool contract used by every tool implementation.
- `src/query.ts` - central agent loop (stream model output, execute tools, recurse).
- `src/QueryEngine.ts` - top-level query orchestration and session wiring.
- `src/tools/` (selected) - built-in tool implementations and shared helpers.
- `src/services/api/`, `src/services/tools/`, `src/services/mcp/` - runtime stack for model calls, tool execution, and MCP integration.
- `src/replLauncher.tsx`, `src/screens/`, `src/components/` - interactive terminal REPL.

### Trim goals

- Remove non-core subsystems (bridge/voice/vim/coordinator/plugins/skills/remote/web extras).
- Keep same Anthropic key-driven runtime and latency-sensitive behavior (streaming tool execution and compact/retry pipeline).
- Introduce `src/tools.config.ts` as the single place to customize built-in tools.

### Notes

- This file documents intent and the extraction boundary for maintainers.
- Additional pruning happens in follow-up phases while preserving runtime stability.
