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
let poolInstance: sql.ConnectionPool | null = null;

export function getPool(): Promise<sql.ConnectionPool> {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((pool) => {
        poolInstance = pool;
        console.log("ƒo. Pool de SQL creado");
        return pool;
      })
      .catch((err) => {
        poolPromise = null;
        console.error("ƒ?O Error creando pool:", err);
        throw err;
      });
  }
  return poolPromise;
}

export async function closePool(): Promise<void> {
  if (poolInstance) {
    await poolInstance.close();
    poolInstance = null;
    poolPromise = null;
  }
}

export { sql };
