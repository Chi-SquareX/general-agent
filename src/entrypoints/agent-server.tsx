import { startAgentHttpServer } from 'src/server/agent/httpServer.js'
import { init } from './init.js'

async function main(): Promise<void> {
  await init()
  startAgentHttpServer()
}

void main()
