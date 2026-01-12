import { getPool } from "../../helpers/db_helpers/db.js";

export async function registroLogs(categoria: string, contenido: string, uid: string): Promise<void> {
  try {
    const pool = await getPool();
    const insertQuery = `
      INSERT INTO ia.kai2_logs (categoria, contenido, uid) VALUES (@categoria, @contenido, @uid)
    `;
    await pool.request().input("categoria", categoria).input("contenido", contenido).input("uid", uid).query(insertQuery);
  } catch (err) {
    console.error("Error insertando registro de log:", err);
  }
}