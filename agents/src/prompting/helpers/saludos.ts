import { getSaludoKai } from "../common/user_prompts.js";
import type { SaludoHandlerParams, SaludoKai } from "../types.js";
import { guardarInteraccion } from "../../helpers/user_config/user_settings.js";
import { setAreaNegocio } from "../../helpers/user_config/user_settings.js";

export async function saludoHandler({
  comando,
  uid,
  string_fecha_hora,
}: SaludoHandlerParams): Promise<SaludoKai> {
  const saludo = getSaludoKai(comando);
  await setAreaNegocio(
      uid,
      saludo.categoria);
  await guardarInteraccion({
    uid,
    mensaje_usuario: saludo.ejemplo_usuario,
    mensaje_bot: saludo.ejemplo_bot,
    string_fecha_hora,
  });

  return saludo;
}
