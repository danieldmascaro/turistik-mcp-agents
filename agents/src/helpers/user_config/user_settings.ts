// get_memory.ts
import { sql, getPool } from "../db_helpers/db.js";
import { buildPromptFromHistory } from "../../prompting/common/user_prompts.js";
import type { Turno } from "../../prompting/types.js";
import type {
  ArmarPromptParaAgenteParams,
  GuardarInteraccionParams,
} from "../types.js";

/**
 * 1) Se llama ANTES del agente:
 * - Si el uid existe: trae últimos 10 y arma prompt con historial + entrada actual
 * - Si no existe: arma prompt de saludo (sin historial)
 */
export async function armarPromptParaAgente(
  params: ArmarPromptParaAgenteParams
): Promise<string> {
  const { uid, mensaje_usuario } = params;

  const pool = await getPool();
  const tx = new sql.Transaction(pool);

  try {
    await tx.begin();

    // ¿Existe usuario?
    const existeRes = await new sql.Request(tx)
      .input("uid", uid)
      .query<{ uid: string }>(`
        SELECT uid
        FROM ia.usuario_web
        WHERE uid = @uid;
      `);

    const existe = existeRes.recordset.length > 0;

    let history: Turno[] | null = null;

    if (existe) {
      const histRes = await new sql.Request(tx)
        .input("uid", uid)
        .query<Turno>(`
          SELECT TOP (10)
            mensaje_usuario,
            mensaje_bot,
            string_fecha_hora
          FROM ia.memoria_persistente
          WHERE uid = @uid
          ORDER BY fecha_envio DESC;
        `);

      history = histRes.recordset.reverse(); // cronológico
    }

    await tx.commit();

    return buildPromptFromHistory({
      entrada: mensaje_usuario,
      history,
    });
  } catch (err) {
    try { await tx.rollback(); } catch {}
    throw err;
  }
}

export async function getAreaNegocio(uid: string): Promise<string | null> {
  if (!uid || typeof uid !== "string" || !uid.trim()) {
    throw new Error("uid inválido");
  }

  const pool = await getPool();
  const request = pool.request();
  request.input("uid", uid);

  const result = await request.query<{ agente: string | null }>(`
    SELECT agente
    FROM ia.usuario_web
    WHERE uid = @uid;
  `) as any;
  if (result.recordset.length === 0) {
    return "Turismo";
  }
  return result.recordset[0].agente || null;
}

export async function setAreaNegocio(uid: string, area_negocio: string): Promise<void> {
  if (!uid || typeof uid !== "string" || !uid.trim()) {
    throw new Error("uid inválido");
  }

  const pool = await getPool();
  const request = pool.request();

  request.input("uid", uid);
  request.input("area_negocio", area_negocio);

  await request.query(`
    UPDATE ia.usuario_web
    SET agente = @area_negocio
    WHERE uid = @uid;
  `);
}



// Borrar memoria persistente asociada a un uid
export async function borrarMemoriaUID(uid: string): Promise<void> {
  if (!uid || typeof uid !== "string" || !uid.trim()) {
    throw new Error("uid inválido");
  }

  const pool = await getPool();
  const request = pool.request();

  request.input("uid", uid);

  await request.query(`
    DELETE FROM ia.memoria_persistente
    WHERE uid = @uid;
  `);
}


// Guardar interacciones
export async function guardarInteraccion(
  params: GuardarInteraccionParams
): Promise<void> {
  const { uid, mensaje_usuario, mensaje_bot, string_fecha_hora } = params;

  const pool = await getPool();
  const tx = new sql.Transaction(pool);

  try {
    await tx.begin();

    // ¿Existe usuario?
    const existeRes = await new sql.Request(tx)
      .input("uid", uid)
      .query<{ uid: string }>(`
        SELECT uid
        FROM ia.usuario_web
        WHERE uid = @uid;
      `);

    const existe = existeRes.recordset.length > 0;

    // Si no existe, créalo
    if (!existe) {
      await new sql.Request(tx)
        .input("uid", uid)
        .query(`
          INSERT INTO ia.usuario_web (uid)
          VALUES (@uid);
        `);
    }

    // Insert memoria_corta
    await new sql.Request(tx)
      .input("uid", uid)
      .input("mensaje_usuario", mensaje_usuario)
      .input("mensaje_bot", mensaje_bot)
      .query(`
        INSERT INTO ia.memoria_corta (uid, mensaje_usuario, mensaje_bot)
        VALUES (@uid, @mensaje_usuario, @mensaje_bot);
      `);

    // Insert memoria_persistente
    await new sql.Request(tx)
      .input("uid", uid)
      .input("mensaje_usuario", mensaje_usuario)
      .input("mensaje_bot", mensaje_bot)
      .input("string_fecha_hora", string_fecha_hora)
      .query(`
        INSERT INTO ia.memoria_persistente (uid, mensaje_usuario, mensaje_bot, string_fecha_hora)
        VALUES (@uid, @mensaje_usuario, @mensaje_bot, @string_fecha_hora);
      `);

    await tx.commit();
  } catch (err) {
    try { await tx.rollback(); } catch {}
    throw err;
  }
}
