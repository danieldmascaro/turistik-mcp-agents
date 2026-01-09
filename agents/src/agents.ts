import "dotenv/config";
import z from "zod";
import type { InputGuardrail } from "@openai/agents";
import {
  Agent,
  run,
  hostedMcpTool,
  handoff,
  InputGuardrailTripwireTriggered,
} from "@openai/agents";
import {
  PROMPT_KAI_TRIAGE,
  PROMPT_KAI_HOPON,
  PROMPT_KAI_EXCURSIONES,
} from "./prompting/prompts.js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { buildFechaBotSimple } from "./prompting/helpers/fecha.js";
import { armarPromptParaAgente, guardarInteraccion, borrarMemoriaUID } from "./helpers/user_memory/memory_helpers.js";
import { closePool } from "./helpers/db_helpers/db.js";


const link_ngrok = "https://11b83e1d6f3c.ngrok-free.app/mcp";

const userId = "Local Master MCP";

const rl = readline.createInterface({ input, output });
const userPrompt = await rl.question("Ingrese un prompt: ");
rl.close();

const guardrailAgent = new Agent({
  name: "Guardrail check",
  instructions:
    "Revisa si la entrada del usuario contiene solicitudes inapropiadas o peligrosas. Además, verifica si es que el agente respondió en el mismo idioma que el usuario.",
  outputType: z.object({
    isDangerous: z.boolean(),
  }),
});

const guardrail: InputGuardrail = {
  name: "Guardrail check",
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
  try {
    if (userPrompt.trim() === "#Reiniciar") {
    await borrarMemoriaUID(userId);
    console.log("Memoria reiniciada para el usuario:", userId);
    return;
  }
    // 1) Armar prompt CON historial (antes del run)
    const promptArmado = await armarPromptParaAgente({
      uid: userId,
      mensaje_usuario: userPrompt,
    });

    // 2) Correr agente con promptArmado
    const result = await run(triageAgent, promptArmado);
    const respuestaBot = String(result.finalOutput ?? "");
    console.log(respuestaBot);

    // 3) Guardar interacción (después del run)
    const string_fecha_hora = buildFechaBotSimple();

    await guardarInteraccion({
      uid: userId,
      mensaje_usuario: userPrompt,
      mensaje_bot: respuestaBot,
      string_fecha_hora,
    });
  } catch (e) {
    if (e instanceof InputGuardrailTripwireTriggered) {
      console.log("Guardrail activado: entrada peligrosa detectada.");
      return;
    }
    throw e;
  } finally {
    try {
      await closePool();
    } catch (err) {
      console.error("No se pudo cerrar el pool SQL:", err);
    }
  }
}

main().catch((err) => console.error(err));
