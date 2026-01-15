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

export const buildServicioEnums = (servicios: ServicioItem[]) => {
  const servicioCodigoOptions = Array.from(
    new Set(servicios.map((servicio) => servicio.servicioCodigo))
  );
  const centroCostoOptions = Array.from(
    new Set(servicios.map((servicio) => servicio.centroCosto))
  );

  return {
    servicioCodigoEnum: z.enum(servicioCodigoOptions as [string, ...string[]]),
    centroCostoEnum: z.enum(centroCostoOptions as [string, ...string[]]),
  };
};

export async function buildOzyParkToolSchema() {
  const servicios = await fetchContext();
  const { servicioCodigoEnum, centroCostoEnum } = buildServicioEnums(servicios);

  const ServicioItemSchema = z.object({
    centroCosto: centroCostoEnum,
    servicioCodigo: servicioCodigoEnum,
  });

  return z.object({
    fecha: z.string().min(1),
    servicios: z.array(ServicioItemSchema).min(1),
  });
}

export async function fetchServiciosInfo(params: {
  fecha: string;
  servicios: ServicioItem[];
}): Promise<ServicioInfoResult[]> {
  const token = await ozyToken();
  const serviciosValidos = await fetchContext();
  const { servicioCodigoEnum, centroCostoEnum } = buildServicioEnums(serviciosValidos);
  const ServicioItemSchema = z.object({
    centroCosto: centroCostoEnum,
    servicioCodigo: servicioCodigoEnum,
  });

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
    params.servicios.map(async (servicio): Promise<ServicioInfoResult> => {
      ServicioItemSchema.parse(servicio);

      const centroCosto = encodeURIComponent(servicio.centroCosto);
      const servicioCodigo = encodeURIComponent(servicio.servicioCodigo);
      const fechaParam = encodeURIComponent(params.fecha);
      const path = `/informacionServicio/${centroCosto}/${servicioCodigo}/${fechaParam}/${numeroDias}`;

      const { data } = await client.get<unknown>(path);
      return { ...servicio, data };
    })
  );
}
