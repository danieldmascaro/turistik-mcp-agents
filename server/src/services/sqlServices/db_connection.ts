import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config: sql.config = {
  user: process.env.SQL_USER ?? "tu_usuario",
  password: process.env.SQL_SECRET ?? "tu_password",
  server: process.env.SQL_SERVER ?? "localhost",
  database: process.env.SQL_DATABASE ?? "tu_db",
  options: {
    encrypt: true,
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolPromise: Promise<sql.ConnectionPool> | null = null;

export function getPool(): Promise<sql.ConnectionPool> {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((pool) => {
        console.log("✅ Pool de SQL creado");
        return pool;
      })
      .catch((err) => {
        poolPromise = null;
        console.error("❌ Error creando pool:", err);
        throw err;
      });
  }
  return poolPromise;
}

/* ============================
   TEST TEMPORAL DE CONEXIÓN
   ============================ */

async function testDB() {
  try {
    const pool = await getPool();

    const result = await pool
      .request()
      .query("SELECT 1 AS ok FROM ia.ticket_turismo");

    console.log("✅ Query ejecutada correctamente");
    console.log("Filas:", result.recordset.length);
    console.log("Resultado:", result.recordset[0]);

    process.exit(0);
  } catch (err) {
    console.error("❌ Error ejecutando test DB:", err);
    process.exit(1);
  }
}

testDB().catch((err) => {
  console.error("❌ Error inesperado en test DB:", err);
  process.exit(1);
});
