import { getSaludoKai } from "../common/user_prompts.js";
import type { SaludoHandlerParams, SaludoKai } from "../types.js";
import { guardarInteraccion } from "../../helpers/user_memory/memory_helpers.js";

export async function saludoHandler({
  comando,
  uid,
  string_fecha_hora,
}: SaludoHandlerParams): Promise<SaludoKai> {
  const saludo = getSaludoKai(comando);

  await guardarInteraccion({
    uid,
    mensaje_usuario: saludo.ejemplo_usuario,
    mensaje_bot: saludo.ejemplo_bot,
    string_fecha_hora,
  });

  return saludo;
}
