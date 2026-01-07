import "dotenv/config";
import { Agent, run, hostedMcpTool } from '@openai/agents';


const triageAgent = new Agent({
  name: 'Agente de tours',
  instructions:
    "Buscas tours utilizando herramientas de tu servidor MCP. Das las respuestas en formato\nNombre del tour: (nombre)\nDescripción: (descripción)\nPrecio: (precio)\nDuración: (duración si es que aplica)\n\nDas respuestas directas y buscas la información de manera proactiva para promocionar rápidamente los productos con la menor cantidad de interacciones posibles. Si no hay tours que coincidan con la consulta, respondes con 'No se encontraron tours que coincidan con la consulta.'",
  handoffs: [],
  tools: [hostedMcpTool({serverLabel: 'turistik-mcp-server', serverUrl: 'https://dcb16de15efc.ngrok-free.app/mcp'})],
});

async function main() {
  const result = await run(triageAgent, 'busca tours a la ciudad de santiago de chile, que valgan menos de 30mil pesos.');
  console.log(result);
  console.log('---');
  console.log(result.finalOutput)
}

main().catch((err) => console.error(err));