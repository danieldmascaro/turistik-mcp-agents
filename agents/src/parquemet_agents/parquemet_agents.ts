import {
  Agent,
  hostedMcpTool,
} from "@openai/agents";
import { guardrail } from "../tour_agents/tour_agents.js";
import { PROMPT_KAI_TRIAGE_PARQUEMET, PROMPT_KAI_TELEFERICO } from "../prompting/parqueMet/parqueMetPrompts.js";

const link_ngrok = "https://352d1c860c0c.ngrok-free.app/mcp";
const model = "gpt-5-mini";


const parqueBusesAgent = new Agent({
  name: "Agente Parque Aventura, buses Hop On, Mini Golf.",
  model: model,
  instructions: "En construcción"
})

const funicularAgent = new Agent({
  name: "Agente de Funicular",
  model: model,
  instructions: "En construcción"
})

const telefericoAgent = new Agent({
  name: "Agente de Teleférico",
  model: model,
  instructions: PROMPT_KAI_TELEFERICO,
  tools: [
    hostedMcpTool({
        serverLabel: "turistik-mcp-server",
        serverUrl: link_ngrok,
        allowedTools: ["TicketsTeleferico", "CuposTeleferico"],
    }),
  ],
});

const funicularAgentTool = funicularAgent.asTool({
  toolName: "Agente del Funicular",
  toolDescription: "Utiliza esta herramienta para obtener información sobre los servicios del Funicular"
})

const parqueBusesAgentTool = parqueBusesAgent.asTool({
  toolName: "Agente Parque Aventura, Minigolf, Buses panorámicos/Hop On",
  toolDescription: "Consulta esta herramienta para obtener información sobre Parque aventura, Minigolf y/o Buses Panorámicos/Hop On-Hop Off"
})

const telefericoAgentTool = telefericoAgent.asTool({
  toolName: 'Agente Teleferico',
  toolDescription: 'Con esta herramienta obtendrás informaciones sobre todo lo referente al teleférico.',
});

export const triageAgentCerro = Agent.create({
  name: "Agente Principal ParqueMet",
  model: model,
  instructions: PROMPT_KAI_TRIAGE_PARQUEMET,
  tools:[telefericoAgentTool, parqueBusesAgentTool, funicularAgentTool],
  inputGuardrails: [guardrail],
});