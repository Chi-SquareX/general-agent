# general-agent architecture

## Core flow

1. User input enters the REPL/entrypoint layer.
2. `QueryEngine` prepares context and calls `query(...)`.
3. `query.ts` streams model output and watches for `tool_use` blocks.
4. Tool calls are executed via `services/tools/toolOrchestration`.
5. Tool results are appended back as `tool_result` messages.
6. The loop continues until no follow-up tool calls are required.

## Key files

- `src/Tool.ts` - shared tool interface and context types
- `src/tools.ts` - tool pool assembly
- `src/tools.config.ts` - central enable/disable configuration
- `src/QueryEngine.ts` - orchestration and lifecycle management
- `src/query.ts` - recursive assistant/tool execution loop
- `src/services/api/claude.ts` - model streaming transport
- `src/services/tools/StreamingToolExecutor.ts` - low-latency parallel tool execution

## Extension points

- Add tool modules under `src/tools/*`
- Register/enable in `src/tools.config.ts`
- Use `GENERAL_AGENT_TOOLS` for runtime overrides

## Feature flags

- `src/features.ts` provides static defaults for optional behavior.
- Unknown flags can be enabled with `GENERAL_AGENT_FEATURE_<NAME>=true`.
