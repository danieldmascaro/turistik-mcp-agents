import z from "zod";
import {
  Agent,
  run,
  hostedMcpTool,
  type InputGuardrail
} from "@openai/agents";
import { guardrail } from "../tour_agents/tour_agents.js";

const link_ngrok = "https://7b4eab782e5b.ngrok-free.app/mcp";
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
  inputGuardrails: [guardrail],
    instructions: `
      En construcción.
    `
});