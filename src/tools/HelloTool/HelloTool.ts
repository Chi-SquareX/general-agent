import { z } from 'zod/v4'
import { buildTool, type ToolDef } from '../../Tool.js'

const inputSchema = z.object({
	name: z.string().optional().describe('Optional name to greet'),
})

const outputSchema = z.object({
	message: z.string(),
})

export const HelloTool = buildTool({
	name: 'Hello',
	isConcurrencySafe: () => true,
	isReadOnly: () => true,
	maxResultSizeChars: 10_000,
	toAutoClassifierInput: (input) => input.name ?? '',
	inputSchema,
	outputSchema,
	async description(input) {
		return `Generate a quick greeting for ${input.name ?? 'the user'}.`
	},
	async prompt() {
		return 'Use this tool to return a short hello message.'
	},
	async checkPermissions() {
		return { behavior: 'allow', updatedInput: undefined }
	},
	async call(input) {
		const name = input.name?.trim() || 'there'
		return {
			data: {
				message: `Hello, ${name}!`,
			},
		}
	},
	userFacingName() {
		return 'hello'
	},
	mapToolResultToToolResultBlockParam(content, toolUseID) {
		return {
			type: 'tool_result',
			tool_use_id: toolUseID,
			content: content.message,
		}
	},
}) satisfies ToolDef<typeof inputSchema, z.infer<typeof outputSchema>>

