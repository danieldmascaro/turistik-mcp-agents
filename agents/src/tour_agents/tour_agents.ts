import z from "zod";
import { registroLogs } from "../prompting/helpers/registro_logs.js";
import {
  Agent,
  run,
  hostedMcpTool,
  type InputGuardrail
} from "@openai/agents";
import { GuardrailOutputSchema } from "../prompting/types.js";
import {
  PROMPT_KAI_TRIAGE,
  PROMPT_KAI_HOPON,
  PROMPT_KAI_EXCURSIONES,
} from "../prompting/turismo/turismoPrompts.js";
import { GUARDRAIL_PROMPT } from "../prompting/common/system_prompt.js";
import { setAreaNegocio } from "../helpers/user_config/user_settings.js";

const link_ngrok = "https://7b4eab782e5b.ngrok-free.app/mcp";
const model = "gpt-4o-mini";


const guardrailAgent = new Agent({
  name: "Guardrail check",
  model: "gpt-4o-mini",
  instructions:
    GUARDRAIL_PROMPT,
  outputType: GuardrailOutputSchema
});



export const guardrail: InputGuardrail = {
  name: "Guardrail check",
  runInParallel: false,
  execute: async ({ input, context }) => {

    const contexto = (context as any)?.context ?? {};

    const result = await run(guardrailAgent, input, { context: contexto });

    const userId = contexto.userId ?? "unknown";
    const userPrompt = contexto.userPrompt ?? (typeof input === "string" ? input : JSON.stringify(input));
    await setAreaNegocio(
      userId,
      result.finalOutput?.area_de_negocio || ""
    );
    await registroLogs("Guardrail", userPrompt, userId);

    return {
      outputInfo: result.finalOutput,
      tripwireTriggered: result.finalOutput?.isDangerous === true || result.finalOutput?.outOfContext === true,
    };
  },
};

const hopOnHopOffAgent = new Agent({
  name: "Agente de tours Hop-On Hop-Off",
  instructions: PROMPT_KAI_HOPON,
  model: model,
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
  model: model,
  tools: [
    hostedMcpTool({
      serverLabel: "turistik-mcp-server",
      serverUrl: link_ngrok,
      allowedTools: ["ListarExcursionesWoo"],
    }),
  ],
});

// Agentes como Tools

const hopOnHopOffAgentAsTool = hopOnHopOffAgent.asTool({
  toolName: 'Agente Hop On Hop Off',
  toolDescription: 'En esta tool obtendrás informaciones sobre los buses Hop-On Hop-Off, incluyendo precios, horarios, descripción y disponibilidad.',
});

const toursExcursionesAgentAsTool = excursionesAgent.asTool({
  toolName: 'Agente Excursiones',
  toolDescription: 'En esta tool obtendrás informaciones sobre las excursiones, incluyendo precios, horarios, descripción y disponibilidad.',
});

// Agente Triage

export const triageAgentTurismo = Agent.create({
  name: "Agente principal",
  instructions: PROMPT_KAI_TRIAGE,
  model: model,
  inputGuardrails: [guardrail],
  tools: [
    hopOnHopOffAgentAsTool,
    toursExcursionesAgentAsTool,
  ],
});