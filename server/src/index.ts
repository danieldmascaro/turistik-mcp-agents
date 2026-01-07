import "dotenv/config";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { listarExcursionesWoo } from "./services/woo/main.js";
import {
  ListarExcursionesWooInputSchema,
  type ListarExcursionesWooInput,
} from "./services/woo/types.js";

const text = (t: string) => ({ type: "text", text: t } as const);



function createMCPServer() {
  const server = new McpServer({
    name: "Turistik MCP Server",
    version: "0.0.1",
  });

  server.registerTool(
    "ListarExcursionesWoo",
    {
      title: "Listar Excursiones (WooCommerce)",
      description:
        "Lista excursiones (productos Woo) filtrando únicamente por nombre, rango de precio y categoría (ID o slug).",
      inputSchema: ListarExcursionesWooInputSchema,
      outputSchema: {
        data: z.unknown().describe("JSON devuelto por Woo: { data: WooProduct[], pagination: { total, totalPages } }."),
      },
    },
    async ({ consulta }: z.infer<typeof ListarExcursionesWooInputSchema>) => {
      // Validación de schema (por si llega algo raro desde el runtime)
      const parsed = ListarExcursionesWooInputSchema.safeParse({ consulta });
      if (!parsed.success) {
        return {
          content: [text("❌ Input inválido:\n" + parsed.error.toString())],
          structuredContent: { data: { error: "VALIDATION_ERROR", issues: parsed.error.issues } },
        };
      }

      const { nombre, precio_min, precio_max, categoria } = parsed.data.consulta;

      // Validación lógica: min <= max
      if (precio_min > precio_max) {
        return {
          content: [text("❌ Input inválido: precio_min no puede ser mayor que precio_max")],
          structuredContent: { data: { error: "VALIDATION_ERROR", message: "precio_min > precio_max" } },
        };
      }

      // Construimos query SOLO con campos permitidos
      const query: {
        search?: string;
        min_price?: number;
        max_price?: number;
        category?: number | string | Array<number | string>;
      } = {};

      const nameTrimmed = nombre.trim();
      if (nameTrimmed) query.search = nameTrimmed;
      if (typeof precio_min === "number" && precio_min > 0) query.min_price = precio_min;
      if (typeof precio_max === "number" && precio_max > 0 && precio_max < 999999) query.max_price = precio_max;
      if (typeof categoria === "number") {
        query.category = categoria;
      } else if (typeof categoria === "string" && categoria.trim() !== "") {
        query.category = categoria.trim();
      }

      try {
        const data = await listarExcursionesWoo(query as any);

        return {
          content: [text(JSON.stringify(data, null, 2))],
          structuredContent: { data },
        };
      } catch (err: any) {
        const status =
          typeof err?.status === "number"
            ? err.status
            : typeof err?.response?.status === "number"
              ? err.response.status
              : undefined;

        const payloadErr = err?.payload ?? err?.response?.data ?? undefined;

        const message =
          typeof err?.message === "string"
            ? err.message
            : "Error desconocido llamando listarExcursionesWoo";

        return {
          content: [text(`❌ Falló listarExcursionesWoo${status ? ` (status ${status})` : ""}: ${message}`)],
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
