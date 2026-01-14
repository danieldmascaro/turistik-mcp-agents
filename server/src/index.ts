import "dotenv/config";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { URL } from "node:url";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { listarExcursionesWoo, obtenerExcursionWooPorId } from "./services/woo/main.js";
import { type WooListProductsQuery, type ListarExcursionesWooInput, ListarExcursionesWooInputSchema, text } from "./types.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";


// 1. Obtener la ruta del archivo actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Construir la ruta absoluta subiendo 2 niveles (de src a server, luego a raíz)
const pathJS = path.resolve(__dirname, '../../front/teleferico_tours/dist/assets/index.js');
const pathCSS = path.resolve(__dirname, '../../front/teleferico_tours/dist/assets/index.css');

// 3. Leer los archivos
const BUSCAR_TOUR_JS = readFileSync(pathJS, "utf-8");
const BUSCAR_TOUR_CSS = readFileSync(pathCSS, "utf-8");

const HTML_TEMPLATE =
  `<div id="root-carrusel" class="max-h-full max-w-full min-h-full max-h-full"></div>\n` +
  `<script type="module">${BUSCAR_TOUR_JS}</script>\n` +
  `<style>${BUSCAR_TOUR_CSS}</style>\n`;



// Configuración del MCP Server
function createMCPServer() {
  const server = new McpServer({
    name: "Turistik MCP Server",
    version: "0.0.1",
  });
  server.registerResource("html", "ui://widget/carrusel_tours.html", {}, async () => ({
    contents: [
      {
        uri: "ui://widget/carrusel_tours.html",
        mimeType: "text/html",
        text: HTML_TEMPLATE,
        _meta: {
          "openai/widgetDescription": "Utiliza esta herramienta para buscar tours de acuerdo a las preferencias del usuario. Los precios están en CLP, pesos chilenos.",
        },
      },
    ],
  }));
server.registerTool(
  "WooPorId",
  {
    title: "Obtener datos básicos servicio.",
    description: "Obtiene un producto WooCommerce por su ID.",
    inputSchema: z.object({
      id: z
        .number()
        .describe("ID que debes ingresar para obtener los datos de tu producto."),
    }),
  },
  async ({ id }: { id: number }) => {
    try {
      const data = await obtenerExcursionWooPorId(id);
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
          : "Error desconocido llamando obtenerExcursionWooPorId";

      return {
        content: [
          text(
            `Falló obtenerExcursionWooPorId${
              status ? ` (status ${status})` : ""
            }: ${message}`
          ),
        ],
        structuredContent: {
          data: { error: "API_ERROR", status, message, payload: payloadErr },
        },
      };
    }
  }
);

  server.registerTool(
    "ListarExcursionesWoo",
    {
      title: "Listar Excursiones (WooCommerce)",
      description:
        "Lista excursiones (productos Woo) filtrando por nombre y rango de precio. Aquí encontrarás Tours: gastronómicos, a la nieve, por el centro histórico de Santiago, al cerro san cristóbal (funicular y teleférico), al Litoral central, Casa de Neruda, Viñedos.",
      inputSchema: ListarExcursionesWooInputSchema,
      outputSchema: {
        data: z
          .unknown()
          .describe("JSON devuelto por Woo: { data: WooProduct[], pagination: { total, totalPages } }."),
      },
      _meta: {
        "openai/outputTemplate": "ui://widget/carrusel_tours.html",
        "openai/widgetAccesible": true,
        "openai/toolInvocation/invoking": "Cargando Tours...",
        "openai/toolInvocation/invoked": "Tours cargados exitosamente.",
      },
    },
    async ({ consulta }: ListarExcursionesWooInput) => {
      const { nombre, precio_min, precio_max } = consulta;

      // Construimos query SOLO con campos permitidos
      const query: WooListProductsQuery = {};

      if (nombre) query.search = nombre;
      if (precio_min > 0) query.min_price = precio_min;
      if (precio_max > 0) query.max_price = precio_max;
      
      try {
        const data = await listarExcursionesWoo(query);

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
          content: [text(`Falló listarExcursionesWoo${status ? ` (status ${status})` : ""}: ${message}`)],
          structuredContent: { data: { error: "API_ERROR", status, message, payload: payloadErr } },
        };
      }
    }
  );
  server.registerTool(
  "ListarBusHopOnHopOffWoo",
  {
    title: "Listar Bus Hop-On-Hop-Off (WooCommerce)",
    description:
      "Lista excursiones (productos Woo) por precio, forzando busqueda por 'hop' (Bus Hop-On-Hop-Off).",
    inputSchema: ListarExcursionesWooInputSchema,
    outputSchema: {
      data: z.unknown().describe(
        "JSON devuelto por Woo: { data: WooProduct[], pagination: { total, totalPages } }."
      ),
    },
  },
  async ({ consulta }: ListarExcursionesWooInput) => {
    const { precio_min, precio_max } = consulta;

    const query: WooListProductsQuery = { search: "hop" };

    if (precio_min > 0) query.min_price = precio_min;
    if (precio_max > 0) query.max_price = precio_max;
    
    try {
      const data = await listarExcursionesWoo(query);
      return { content: [text(JSON.stringify(data, null, 2))], structuredContent: { data } };
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
        content: [text(`Falló listarExcursionesWoo${status ? ` (status ${status})` : ""}: ${message}`)],
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
    console.log(`SSE connection closed (${sessionId})`);
  };

  transport.onerror = (err) => console.error("⚠️ SSE transport error:", err);

  try {
    await server.connect(transport);
  } catch (err) {
    sessions.delete(sessionId);
    console.error("Failed to start SSE session:", err);
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
    console.error("Failed to process message:", err);
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
  console.log(`Turistik MCP server running at http://localhost:${PORT}`);
  console.log(`SSE stream: GET http://localhost:${PORT}${ssePath}`);
  console.log(`Post:       POST http://localhost:${PORT}${postPath}?sessionId=...`);
});

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
