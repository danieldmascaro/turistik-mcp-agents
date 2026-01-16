import axios from "axios";
import { z } from "zod";
import { ozyToken, urlOzyPark } from "./bearerService.js";
import type {
  ContextResponse,
  ServicioInfoResult,
  ServicioItem,
} from "./types.js";


export async function fetchContext(): Promise<ServicioItem[]> {
  const token = await ozyToken();
  const context = axios.create({
    baseURL: `${urlOzyPark}/api/v1/contexto`,
    timeout: 15000,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const { data } = await context.get<ContextResponse>("");
  const servicios = Array.isArray(data?.servicios) ? data.servicios : [];
  return servicios.map((servicio): ServicioItem => ({
    servicioCodigo: servicio.servicioCodigo ?? "",
    centroCosto: servicio.centroCosto ?? "",
  }));
}

export const buildServicioPairSchema = (servicios: ServicioItem[]) => {
  const pairOptions = servicios.map(
    (servicio) => `${servicio.centroCosto}||${servicio.servicioCodigo}`
  );

  if (pairOptions.length === 0) {
    return z.never();
  }

  return z.enum(pairOptions as [string, ...string[]]);
};

function parseServicioPair(pair: string): ServicioItem {
  const [centroCosto, servicioCodigo] = pair.split("||");
  if (!centroCosto || !servicioCodigo) {
    throw new Error("Formato de servicio invalido.");
  }
  return { centroCosto, servicioCodigo };
}

export async function buildOzyParkToolSchema() {
  const servicios = await fetchContext();
  const ServicioPairSchema = buildServicioPairSchema(servicios);

  return z.object({
    servicios: z.array(ServicioPairSchema).min(1),
  });
}

export async function fetchServiciosInfo(params: {
  fecha: string;
  servicios: string[];
}): Promise<ServicioInfoResult[]> {
  const token = await ozyToken();
  const serviciosValidos = await fetchContext();
  const ServicioPairSchema = buildServicioPairSchema(serviciosValidos);

  const client = axios.create({
    baseURL: `${urlOzyPark}/api/v1`,
    timeout: 15000,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  const numeroDias = 1;
  return Promise.all(
    params.servicios.map(async (pair): Promise<ServicioInfoResult> => {
      ServicioPairSchema.parse(pair);
      const servicio = parseServicioPair(pair);

      const centroCosto = encodeURIComponent(servicio.centroCosto);
      const servicioCodigo = encodeURIComponent(servicio.servicioCodigo);
      const fechaParam = encodeURIComponent(params.fecha);
      const path = `/informacionServicio/${centroCosto}/${servicioCodigo}/${fechaParam}/${numeroDias}`;

      const { data } = await client.get<unknown>(path);
      return { ...servicio, data };
    })
  );
}

export const ozyParkInputSchema = await buildOzyParkToolSchema();
