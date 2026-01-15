import "dotenv/config";
import { requireEnv } from "../requireEnv.js";

// getParquemetToken.ts

type TokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  [k: string]: unknown;
};

export const urlOzyPark = requireEnv("OZY_BASE_URL");

export async function ozyToken(): Promise<string> {
  const body_parquemet = {
    grant_type: requireEnv("GRANT_TYPE"),
    client_id: requireEnv("OZY_CLIENT_ID"),
    client_secret: requireEnv("OZY_CLIENT_SECRET"),
    scope: process.env.OZY_SCOPE ?? "ozy_park_ecommerce_api",
  };

  const body = new URLSearchParams(body_parquemet).toString();

  const res = await fetch(`${urlOzyPark}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Error obteniendo token (${res.status}): ${text}`);
  }

  const data = (await res.json()) as TokenResponse;

  if (!data.access_token) {
    throw new Error("La respuesta no trae access_token");
  }

  // Solo retornamos/imprimimos el token
  console.log(data.access_token);
  return data.access_token;
}

ozyToken().catch((err) => {
  console.error(err);
  process.exit(1);
});
