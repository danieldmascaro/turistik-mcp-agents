import {
  Agent,
  hostedMcpTool,
} from "@openai/agents";
import { guardrail } from "../tour_agents/tour_agents.js";

const link_ngrok = "https://18b318d3e9ca.ngrok-free.app/mcp";
const model = "gpt-4o-mini";


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
  instructions: "En construcción",
  tools: [
    hostedMcpTool({
        serverLabel: "turistik-mcp-server",
        serverUrl: link_ngrok,
        allowedTools: ["TicketsTeleferico", "CuposTeleferico"],
    }),
  ],
});

const funicularAgentTool = funicularAgent.asTool({})

const parqueBusesAgentTool = parqueBusesAgent.asTool({
  toolName: "Agente Parque Aventura, Minigolf, Buses panorámicos/Hop On",
  toolDescription: "Consulta esta herramienta para obtener información sobre Parque aventura, Minigolf y/o Buses Panorámicos/Hop On-Hop Off"
})

const telefericoAgentTool = telefericoAgent.asTool({
  toolName: 'Agente Teleferico',
  toolDescription: 'Con esta herramienta obtendrás informaciones sobre todo lo referente al teleférico.',
});

export const triageAgentCerro = Agent.create({
  name: "Triage Agent",
  model: model,
  instructions: "agente en construcción",
  tools:[telefericoAgentTool],
  inputGuardrails: [guardrail],
});