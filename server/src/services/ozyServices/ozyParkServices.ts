import axios from "axios";
import { z } from "zod";
import { ozyToken, urlOzyPark } from "./bearerService.js";
import type {
  ContextResponse,
  ServicioInfoResult,
  ServicioItem,
} from "./types.js";

export type TicketTelefericoItem = {
  servicioNombre: string;
  fechaInicio: string;
  fechaFin: string;
  grupoEtario: string;
  precioUnitario: number;
};

export type ZonaOrigenAka = "OASIS" | "TUPAHUE" | "CUMBRE";

const FechaYYYYMMDDSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha invalido (YYYY-MM-DD).");

function buildFechaRangoSchema(daysAhead: number) {
  const today = new Date();
  const options: string[] = [];
  for (let i = 0; i <= daysAhead; i += 1) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    options.push(`${year}-${month}-${day}`);
  }

  return z.enum(options as [string, ...string[]]).describe("Selecciona la fecha para ver disponibilidad");
}

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

export async function fetchTelefericoItems(params: {
  fecha: string;
  servicios: string[];
}): Promise<TicketTelefericoItem[]> {
  const data = await fetchServiciosInfo(params);
  const formatted = data.flatMap((item) => {
    const servicioNombre = (item.data as any)?.servicioNombre ?? "";
    const cabeceraPrecios = (item.data as any)?.cabeceraPrecios ?? [];
    return cabeceraPrecios.flatMap((cabecera: any) => {
      const fechaInicio = params.fecha;
      const fechaFin = params.fecha;
      const precios = cabecera?.precios ?? [];
      return precios.map((precio: any) => {
        const grupoEtarioRaw = precio?.grupoEtario ?? "";
        const grupoEtario =
          grupoEtarioRaw === "3ra Edad" ||
          grupoEtarioRaw === "Niños" ||
          grupoEtarioRaw === "Ninos"
            ? "3ra edad y niños"
            : grupoEtarioRaw;

        return {
          servicioNombre,
          fechaInicio,
          fechaFin,
          grupoEtario,
          precioUnitario: precio?.precioUnitario ?? 0,
        };
      });
    });
  });

  const seen = new Set<string>();
  return formatted.filter((item) => {
    const key = `${item.servicioNombre}||${item.fechaInicio}||${item.fechaFin}||${item.grupoEtario}||${item.precioUnitario}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function buildOzyParkCuposToolSchema() {
  const servicios = await fetchContext();
  const ServicioPairSchema = buildServicioPairSchema(servicios);
  const FechaSchema = buildFechaRangoSchema(30);
  return z.object({
    fecha: FechaSchema,
    servicios: z.array(ServicioPairSchema).min(1).describe("Servicios que puedes consultar. Grupo simple puede ser desde Oasis a Tupahue o visceversa, o de Tupahue a Cumbre o visceversa. Grupo doble se refiere a viajes desde Oasis a Cumbre o visceversa. Si no te explican nada, consulta por VIVE EL PARQUE"),
    zonaOrigenAka: z.enum(["OASIS", "TUPAHUE", "CUMBRE"]).default("OASIS").describe("Selecciona la estación de origen para el viaje a consultar. En la base del cerro, Oasis, luego Tupahue como parada intermedia, y Oasis como destino final en la cima del cerro, junto al santuario de la Virgen."),
  });
}

export async function fetchCuposInfo(params: {
  fecha: string;
  servicios: string[];
  zonaOrigenAka: ZonaOrigenAka;
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
      const zonaParam = encodeURIComponent(params.zonaOrigenAka);
      const path = `/cupos/${centroCosto}/${servicioCodigo}/${fechaParam}/${numeroDias}/${zonaParam}`;

      const { data } = await client.get<unknown>(path);
      const fechas = Array.isArray((data as any)?.fechas) ? (data as any).fechas : [];
      const fechasFiltradas = fechas
        .map((fecha: any) => {
          const cupos = Array.isArray(fecha?.cupos) ? fecha.cupos : [];
          const disponibles = cupos.filter((cupo: any) => cupo?.disponible === true);
          return { ...fecha, cupos: disponibles };
        })
        .filter((fecha: any) => (fecha?.cupos?.length ?? 0) > 0);

      return { ...servicio, data: { ...(data as any), fechas: fechasFiltradas } };
    })
  );
}

export const ozyParkInputSchema = await buildOzyParkToolSchema();
export const ozyParkCuposInputSchema = await buildOzyParkCuposToolSchema();
