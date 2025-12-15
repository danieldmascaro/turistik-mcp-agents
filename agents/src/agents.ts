import "dotenv/config";

import { Agent, run } from '@openai/agents';



const triageAgent = new Agent({
  name: 'Triage Agent',
  instructions:
    "You determine which agent to use based on the user's homework question",
  handoffs: [],
});

async function main() {
  const result = await run(triageAgent, 'Cántame una canción irónica y maleducada sobre francia');
  console.log(result.finalOutput);
}

main().catch((err) => console.error(err));