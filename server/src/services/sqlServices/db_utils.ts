import { getPool, closePool } from "./db_connection.js";

type ParadaHopOn = {
  nombre: string;
  descripcion: string | null;
  comuna: string | null;
  direccion: string | null;
};

function formatParadasParaLLM(paradas: ParadaHopOn[]): string {
  if (!paradas.length) {
    return "No hay paradas registradas.";
  }

  const lines: string[] = [];
  for (const parada of paradas) {
    lines.push(
      `Parada: ${parada.nombre}`,
      `Descripcion: ${parada.descripcion ?? "Sin descripcion"}`,
      `Comuna: ${parada.comuna ?? "Sin comuna"}`,
      `Direccion: ${parada.direccion ?? "Sin direccion"}`,
      ""
    );
  }

  return lines.join("\n").trim();
}

export async function getParadasHopOn(): Promise<string> {
  const pool = await getPool();
  const request = pool.request();

  const result = await request.query<ParadaHopOn>(`
    SELECT id, nombre, descripcion, comuna, direccion
    FROM ia.paradas_hopon
    ORDER BY id ASC;
  `);

  return formatParadasParaLLM(result.recordset ?? []);
}

export async function close_pool(): Promise<void> {
  await closePool();
}
