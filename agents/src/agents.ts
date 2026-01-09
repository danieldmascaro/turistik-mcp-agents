import "dotenv/config";
import z from "zod";
import type { InputGuardrail } from "@openai/agents";
import { Agent, run, hostedMcpTool, handoff, InputGuardrailTripwireTriggered } from "@openai/agents";
import { PROMPT_KAI_TRIAGE, PROMPT_KAI_HOPON, PROMPT_KAI_EXCURSIONES } from "./prompting/prompts.js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";




const link_ngrok = "https://11b83e1d6f3c.ngrok-free.app/mcp";

const userId = "Local Master";

const guardrailAgent = new Agent({
  name: 'Guardrail check',
  instructions: 'Revisa si la entrada del usuario contiene solicitudes inapropiadas o peligrosas. Además, verifica si es que el agente respondió en el mismo idioma que el usuario.',
  outputType: z.object({
    isDangerous: z.boolean(),
    reasoning: z.string().max(20),
  }),
});

const guardrail: InputGuardrail = {
  name: 'Guardrail check',
  // Set runInParallel to false to block the model until the guardrail completes.
  runInParallel: false,
  execute: async ({ input, context }) => {
    const result = await run(guardrailAgent, input, { context });
    return {
      outputInfo: result.finalOutput,
      tripwireTriggered: result.finalOutput?.isDangerous === true,
    };
  },
};



const hopOnHopOffAgent = new Agent({
  name: "Agente de tours Hop-On Hop-Off",
  instructions: PROMPT_KAI_HOPON,
  model: "gpt-4o-mini",
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
  model: "gpt-4o-mini",
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
  model: "gpt-4o-mini",
  inputGuardrails: [guardrail],
  handoffs: [handoff(hopOnHopOffAgent), handoff(excursionesAgent)],
});

async function main() {
  try{
    const rl = readline.createInterface({ input, output });
  const userPrompt = await rl.question("Ingrese un prompt: ");
  rl.close();

  const result = await run(triageAgent, userPrompt);

  console.log(result.finalOutput);
  } catch (e) {
    if (e instanceof InputGuardrailTripwireTriggered) {
      console.log('Guardrail activado: entrada peligrosa detectada.');
    }
  }
}

main().catch((err) => console.error(err));
