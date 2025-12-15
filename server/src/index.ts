import "dotenv/config";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { CategoriaSchema, ConsultaToursSchema, type ConsultaTours } from "./services/mcpAPITest/types.js";
import { listarTours } from "./services/mcpAPITest/mcpService.js";

const text = (t: string) => ({ type: "text", text: t } as const);

function createMCPServer() {
  const server = new McpServer({
    name: "Turistik MCP Server",
    version: "0.0.1",
  });

  server.registerTool(
    "ListarTours",
    {
      title: "Listar Tours",
      description:
        "Herramienta para solicitar tours, según el contexto de la conversación. Normalmente filtrarás por categoría, a menos que se especifique el nombre de un ticket",
      inputSchema: {
        // Wrapper para que el Inspector muestre campos y puedas probar fácil
        consulta: z.object({
          nombre: z.string().describe("Nombre del tour.").default(""),
          precio_min: z.number().describe("Precio mínimo.").default(0),
          precio_max: z.number().describe("Precio máximo.").default(999999),
          palabras_clave: z
            .array(CategoriaSchema)
            .describe("Categorías para filtrar.")
            .default([]),
        }),
      },
      outputSchema: {
        data: z.unknown().describe("JSON devuelto por la API."),
      },
    },
    async ({ consulta }) => {

      const payload: ConsultaTours = {};

      if (consulta.nombre.trim() !== "") payload.nombre = consulta.nombre.trim();
      if (consulta.precio_min !== 0) payload.precio_min = consulta.precio_min;
      if (consulta.precio_max !== 0) payload.precio_max = consulta.precio_max;
      if (consulta.palabras_clave.length > 0) payload.palabras_clave = consulta.palabras_clave;

      // Validación runtime con tu schema (opcional, pero consistente)
      const parsed = ConsultaToursSchema.safeParse(payload);
      if (!parsed.success) {
        return {
          content: [text("❌ Input inválido:\n" + parsed.error.toString())],
          structuredContent: { data: { error: "VALIDATION_ERROR", issues: parsed.error.issues } },
        };
      }

      try {
        const data = await listarTours(parsed.data);

        return {
          content: [text("✅ Tours cargados.")],
          structuredContent: { data },
        };
      } catch (err: any) {
        const status = typeof err?.status === "number" ? err.status : undefined;
        const payloadErr = err?.payload ?? undefined;
        const message =
          typeof err?.message === "string"
            ? err.message
            : "Error desconocido llamando listarTours";

        return {
          content: [text(`❌ Falló listarTours${status ? ` (status ${status})` : ""}: ${message}`)],
          structuredContent: { data: { error: "API_ERROR", status, message, payload: payloadErr } },
        };
      }
    }
  );

  return server;
}

const server = createMCPServer();

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
