import { getSaludoKai } from "../common/user_prompts.js";
import type { AreaNegocio, SaludoHandlerParams, SaludoKai } from "../types.js";
import { guardarInteraccion } from "../../helpers/user_config/user_settings.js";
import { setAreaNegocio } from "../../helpers/user_config/user_settings.js";

export async function saludoHandler({
  comando,
  uid,
  string_fecha_hora,
  areaNegocio
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
    areaNegocio,
  });

  return saludo;
}


export async function comandoSaludoHandler(comando: string, uid: string, string_fecha_hora: string, areaNegocio: AreaNegocio){
    if (comando.trim() === "#SaludoKaiV2ESP") {
      await saludoHandler({
        comando: "#SaludoKaiV2ESP",
        uid,
        string_fecha_hora,
        areaNegocio,
      })
      return;
    } else if (comando.trim().startsWith("#SaludoKaiV2ENG")) {
      await saludoHandler({
        comando: "#SaludoKaiV2ENG",
        uid,
        string_fecha_hora,
        areaNegocio,
      })
      return;
    } else if (comando.trim() === "#SaludoKaiV2POR") {
      await saludoHandler({
        comando: "#SaludoKaiV2POR",
        uid,
        string_fecha_hora,
        areaNegocio,
      })
      return;
    } else if (comando.trim() === "#SaludoKaiV2ESPTOUR") {
      await saludoHandler({
        comando: "#SaludoKaiV2ESPTOUR",
        uid,
        string_fecha_hora,
        areaNegocio,
      })
      return;
    } else if (comando.trim().startsWith("#SaludoKaiV2ENGTOUR")) {
      await saludoHandler({
        comando: "#SaludoKaiV2ENGTOUR",
        uid,
        string_fecha_hora,
        areaNegocio,
      })
      return;
    } else if (comando.trim() === "#SaludoKaiV2PORTOUR") {
      await saludoHandler({
        comando: "#SaludoKaiV2PORTOUR",
        uid,
        string_fecha_hora,
        areaNegocio,
      })
      return;
    }
}