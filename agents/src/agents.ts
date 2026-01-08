import "dotenv/config";
import { Agent, run, hostedMcpTool, handoff } from '@openai/agents';
import { PROMPT_KAI_TRIAGE, PROMPT_KAI_HOPON } from "./prompting/prompts.js";

const link_ngrok = 'https://3cf0bf1a5557.ngrok-free.app/mcp';

const hopOnHopOffAgent = new Agent({
  name: 'Agente de tours Hop-On Hop-Off',
  instructions:
    PROMPT_KAI_HOPON,
  tools: [hostedMcpTool({serverLabel: 'turistik-mcp-server', serverUrl: link_ngrok, allowedTools: ['ListarExcursionesWoo']})]
});
const excursionesAgent = new Agent({
  name: 'Agente de Tours y Excursiones',
  instructions:
    PROMPT_KAI_TRIAGE,
  tools: [hostedMcpTool({serverLabel: 'turistik-mcp-server', serverUrl: link_ngrok, allowedTools: ['ListarExcursionesWoo']})]
});

const triageAgent = Agent.create({
  name: 'Agente principal',
  instructions:
    PROMPT_KAI_TRIAGE,
  handoffs: [handoff(hopOnHopOffAgent), handoff(excursionesAgent)],
});

async function main() {
  const result = await run(triageAgent, 'quiero viajar en los buses hop on.');
  console.log(result);
  console.log('---');
  console.log(result.finalOutput)
}

main().catch((err) => console.error(err));