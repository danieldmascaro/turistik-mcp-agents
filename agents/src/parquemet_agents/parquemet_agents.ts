import z from "zod";
import {
  Agent,
  hostedMcpTool,
} from "@openai/agents";
import { guardrail } from "../tour_agents/tour_agents.js";

const link_ngrok = "https://18b318d3e9ca.ngrok-free.app/mcp";
const model = "gpt-4o-mini";


const telefericoAgent = new Agent({
  name: "Agente de tours Teleférico",
  model: model,
  instructions: "En construcción",
  tools: [
    hostedMcpTool({
        serverLabel: "turistik-mcp-server",
        serverUrl: link_ngrok,
        allowedTools: ["ListarBusHopOnHopOffWoo"],
    }),
  ],
});

export const triageAgentCerro = Agent.create({
  name: "Triage Agent",
  model: model,
  instructions: "agente en construcción",
  inputGuardrails: [guardrail],
});