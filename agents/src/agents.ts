import "dotenv/config";
import { Agent, run, hostedMcpTool } from '@openai/agents';


const triageAgent = new Agent({
  name: 'Agente de tours',
  instructions:
    "Buscas tours utilizando herramientas de tu servidor MCP. Das las respuestas en formato\nNombre del tour: (nombre)\nDescripción: (descripción)\nPrecio: (precio)\nDuración: (duración)\n\nSi no hay tours que coincidan con la consulta, respondes con 'No se encontraron tours que coincidan con la consulta.'",
  handoffs: [],
  tools: [hostedMcpTool({serverLabel: 'turistik-mcp-server', serverUrl: 'https://48ed562dc0cf.ngrok-free.app/mcp'})],
});

async function main() {
  const result = await run(triageAgent, 'Qué tours me recomiendas para ir a la playa?');
  console.log(result);
  console.log('---');
  console.log(result.finalOutput)
}

main().catch((err) => console.error(err));