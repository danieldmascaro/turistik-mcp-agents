import "dotenv/config";
import { createServer, IncomingMessage, Server, ServerResponse } from "node:http";
import { URL } from "node:url";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
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
          content: [text(JSON.stringify(data, null, 2))],
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

type SessionRecord = { server: McpServer; transport: SSEServerTransport };
const sessions = new Map<string, SessionRecord>();
const ssePath = "/mcp";
const postPath = "/mcp/message";

// SSE
async function handleSseRequest(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const server = createMCPServer();
  const transport = new SSEServerTransport(postPath, res);
  const sessionId = transport.sessionId;

  sessions.set(sessionId, { server, transport });

  transport.onclose = async () => {
    sessions.delete(sessionId);
    console.log(`🔌 SSE connection closed (${sessionId})`);
  };

  transport.onerror = (err) => console.error("⚠️ SSE transport error:", err);

  try {
    await server.connect(transport);
  } catch (err) {
    sessions.delete(sessionId);
    console.error("❌ Failed to start SSE session:", err);
    if (!res.headersSent) res.writeHead(500).end("Failed to establish SSE connection");
  }
}

// POST message
async function handlePostMessage(req: IncomingMessage, res: ServerResponse, url: URL) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "content-type");

  const sessionId = url.searchParams.get("sessionId");
  if (!sessionId) return res.writeHead(400).end("Missing sessionId");

  const session = sessions.get(sessionId);
  if (!session) return res.writeHead(404).end("Unknown session");

  try {
    await session.transport.handlePostMessage(req, res);
  } catch (err) {
    console.error("❌ Failed to process message:", err);
    if (!res.headersSent) res.writeHead(500).end("Failed to process message");
  }
}

// Servidor HTTP principal
const PORT = Number(process.env.PORT ?? 8000);
const httpServer = createServer(async (req, res) => {
  if (!req.url) return res.writeHead(400).end("Missing URL");
  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "OPTIONS" && (url.pathname === ssePath || url.pathname === postPath)) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === ssePath) {
    await handleSseRequest(res);
    return;
  }

  if (req.method === "POST" && url.pathname === postPath) {
    await handlePostMessage(req, res, url);
    return;
  }

  res.writeHead(404).end("Not Found");
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Turistik MCP server running at http://localhost:${PORT}`);
  console.log(`📡 SSE stream: GET http://localhost:${PORT}${ssePath}`);
  console.log(`📨 Post:       POST http://localhost:${PORT}${postPath}?sessionId=...`);
});


main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
