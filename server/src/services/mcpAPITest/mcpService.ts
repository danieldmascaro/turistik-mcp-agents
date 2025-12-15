import { requireEnv } from "../requireEnv.js";
import { ApiError, ApiErrorPayload, ConsultaTours } from "./types.js";

async function readJsonOrText(res: Response): Promise<ApiErrorPayload> {
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      // fallback a texto
    }
  }
  try {
    return await res.text();
  } catch {
    return "";
  }
}


export async function listarTours(consulta: ConsultaTours): Promise<unknown> {
  const url_mcp_api = requireEnv("MCP_API_URL");

  const payload: Record<string, unknown> = {};

  if (typeof consulta.nombre === "string" && consulta.nombre.trim() !== "") {
    payload.nombre = consulta.nombre.trim();
  }

  if (typeof consulta.precio_min === "number" && consulta.precio_min !== 0) {
    payload.precio_min = consulta.precio_min;
  }

  if (typeof consulta.precio_max === "number" && consulta.precio_max !== 0) {
    payload.precio_max = consulta.precio_max;
  }

  if (Array.isArray(consulta.palabras_clave) && consulta.palabras_clave.length > 0) {
    payload.palabras_clave = consulta.palabras_clave;
  }

  const res = await fetch(url_mcp_api, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    const raw = await res.text().catch(() => "");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  const payloadErr = await readJsonOrText(res);
  const msg =
    payloadErr && typeof payloadErr === "object"
      ? ((payloadErr as any).message ?? (payloadErr as any).error)
      : undefined;

  const base = `Error listarTours (${res.status})`;
  const message = msg ? `${base}: ${msg}` : base;

  switch (res.status) {
    case 400:
      throw new ApiError(`${message} - Bad Request`, res.status, payloadErr);
    case 401:
      throw new ApiError(`${message} - Unauthorized`, res.status, payloadErr);
    case 403:
      throw new ApiError(`${message} - Forbidden`, res.status, payloadErr);
    case 404:
      throw new ApiError(`${message} - Not Found`, res.status, payloadErr);
    case 409:
      throw new ApiError(`${message} - Conflict`, res.status, payloadErr);
    case 422:
      throw new ApiError(`${message} - Unprocessable Entity`, res.status, payloadErr);
    case 429:
      throw new ApiError(`${message} - Too Many Requests`, res.status, payloadErr);
    default:
      if (res.status >= 500) {
        throw new ApiError(`${message} - Server Error`, res.status, payloadErr);
      }
      throw new ApiError(message, res.status, payloadErr);
  }
}
