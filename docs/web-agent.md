# Local Web Agent

This repo now includes a local web agent backend that embeds the in-repo `QueryEngine` and tool registry.

## What it does

- Runs a Bun HTTP server with:
  - `POST /api/chat` (SSE stream)
  - `GET /health`
- Uses the existing Claude Code tool loop via `QueryEngine`.
- Supports session-aware chat by `sessionId`.
- Supports a configurable `workspaceRoot` per request.

## Start commands

Run the backend (from the **repository root**, where `package.json` lives):

```bash
cd claude-code
bun install
bun run agent-server
```

Run the web UI (from **`claude-code/web`** — this is where `npm run dev` is defined):

```bash
cd claude-code/web
npm install
npm run dev
```

Note: the script name is `npm run dev` (space), not `npm run-dev`.

## Docker Compose

From the repository root (`claude-code/`), with Docker and Compose v2 installed:

```bash
export ANTHROPIC_API_KEY=sk-ant-api03-...
docker compose up --build
```

- **agent-backend** — Bun, `QueryEngine` + tools, ports **3001** (`/api/chat`, `/health`).
- **web** — Next.js dev server, port **3000**, proxies `/api/chat` to the agent service.

Mount a project directory for tools to use (default bind: `./workspace` → `/workspace` in the agent container). In the UI **Settings → Workspace root**, set `/workspace` when using that mount.

Optional: `HOST_WORKSPACE=/absolute/path/to/project` to override the host path, and `AGENT_PORT` / `WEB_PORT` for port overrides.

## Configuration

- **`ANTHROPIC_API_KEY`**: required for model calls. Easiest: create **`claude-code/.env`** (next to `docker-compose.yml`) with:
  ```bash
  ANTHROPIC_API_KEY=sk-ant-api03-...
  ```
  Docker Compose reads this file automatically for variable substitution into `agent-backend`. Bun also loads `.env` when you run `bun run agent-server` from the repo root.
- Copy **`.env.example`** to **`.env`** if you do not already have one (`.env` is gitignored).

- `PORT`: backend port (default `3001`).
- `HOST`: backend host (default `127.0.0.1`).
- `CLAUDE_CODE_WEB_CUSTOM_TOOLS`: optional absolute path to a module exporting custom tools (`default` or `tools` array).

The web UI also allows:

- API base URL
- API key (forwarded as `x-api-key`)
- workspace root path

## Security notes

- This server is intended for local development.
- Do not expose it publicly with full tools enabled.
- File and shell tools can modify local files and execute commands.
- Keep `workspaceRoot` scoped to trusted directories.
