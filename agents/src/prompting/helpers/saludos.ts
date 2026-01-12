import { getSaludoKai } from "../common/user_prompts.js";
import type { SaludoKey } from "../common/user_prompts.js";
import { guardarInteraccion } from "../../helpers/user_memory/memory_helpers.js";


type SaludoKai = ReturnType<typeof getSaludoKai>;

interface SaludoHandlerParams {
  comando: SaludoKey;
  uid: string;
  string_fecha_hora: string;
}

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
