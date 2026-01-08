import "dotenv/config";
import { Agent, run, hostedMcpTool, handoff } from "@openai/agents";
import { PROMPT_KAI_TRIAGE, PROMPT_KAI_HOPON, PROMPT_KAI_EXCURSIONES } from "./prompting/prompts.js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const link_ngrok = "https://7eb50a8b177f.ngrok-free.app/mcp";

const hopOnHopOffAgent = new Agent({
  name: "Agente de tours Hop-On Hop-Off",
  instructions: PROMPT_KAI_HOPON,
  tools: [
    hostedMcpTool({
      serverLabel: "turistik-mcp-server",
      serverUrl: link_ngrok,
      allowedTools: ["ListarBusHopOnHopOffWoo"],
    }),
  ],
});

const excursionesAgent = new Agent({
  name: "Agente de Tours y Excursiones",
  instructions: PROMPT_KAI_EXCURSIONES,
  tools: [
    hostedMcpTool({
      serverLabel: "turistik-mcp-server",
      serverUrl: link_ngrok,
      allowedTools: ["ListarExcursionesWoo"],
    }),
  ],
});

const triageAgent = Agent.create({
  name: "Agente principal",
  instructions: PROMPT_KAI_TRIAGE,
  handoffs: [handoff(hopOnHopOffAgent), handoff(excursionesAgent)],
});

async function main() {
  const rl = readline.createInterface({ input, output });
  const userPrompt = await rl.question("Ingrese un prompt: ");
  rl.close();

  const result = await run(triageAgent, userPrompt);

  console.log(result);
  console.log("---");
  console.log(result.finalOutput);
}

main().catch((err) => console.error(err));
