# Adding Tools in general-agent

This repo keeps Claude-style tool contracts and execution flow, but tool
selection is centralized in one place.

## 1) Create a tool file

Create a folder and tool module:

- `src/tools/MyTool/MyTool.ts`

Implement a `Tool` definition that matches `src/Tool.ts`:

- `name`
- `inputSchema` (Zod)
- `prompt(...)`
- `call(...)`
- `description(...)`
- permission methods (`checkPermissions`, `isReadOnly`, etc.)

## 2) Export and register the tool

Update `src/tools.config.ts` and add your tool name to
`DEFAULT_ENABLED_TOOLS`.

If the tool already exists in `src/tools.ts`, this is enough.
If it is a brand new tool module, also import it in `src/tools.ts` and include
it in `getAllBaseTools()`.

## 3) Optional runtime override

You can override enabled tools without code edits:

```bash
GENERAL_AGENT_TOOLS="Bash,Read,Edit,Write,MyTool" bun run agent-server
```

## 4) Example: EchoTool

```ts
import { z } from 'zod/v4'
import { buildTool, type ToolDef } from '../../Tool.js'

const EchoInput = z.object({ text: z.string() })

export const EchoTool = buildTool({
  name: 'Echo',
  inputSchema: EchoInput,
  async prompt() {
    return 'Echo back text exactly.'
  },
  async description(input) {
    return `Echoing ${input.text.length} chars`
  },
  async call(input) {
    return { data: { text: input.text } }
  },
  isEnabled: () => true,
  isReadOnly: () => true,
  isConcurrencySafe: () => true,
  toAutoClassifierInput: input => input.text,
  async checkPermissions() {
    return { behavior: 'allow', updatedInput: undefined }
  },
  mapToolResultToToolResultBlockParam(content, toolUseID) {
    return {
      type: 'tool_result',
      tool_use_id: toolUseID,
      content: [{ type: 'text', text: content.text }],
    }
  },
}) satisfies ToolDef<typeof EchoInput, { text: string }>
```

## 5) Verify

- Run `bun run typecheck`
- Start `bun run agent-server`
- Ask the assistant to call your tool
