import { z } from 'zod/v4'
import { buildTool } from '../../Tool.js'

const inputSchema = z.object({}).passthrough()

export const TungstenTool = buildTool({
  name: 'Tungsten',
  async description() {
    return 'Unavailable in this build.'
  },
  inputSchema,
  async prompt() {
    return `Tungsten tool is unavailable in this build.`
  },
  async call() {
    return {
      content: [{ type: 'text', text: 'Tungsten tool is unavailable.' }],
      isError: true,
    }
  },
  isEnabled: () => false,
  isReadOnly: () => true,
})
