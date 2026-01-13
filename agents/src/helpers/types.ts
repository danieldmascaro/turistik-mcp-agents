import type { AreaNegocio } from "../prompting/types.js";

export interface ArmarPromptParaAgenteParams {
  uid: string;
  mensaje_usuario: string;
  area_negocio: AreaNegocio;
}

export interface GuardarInteraccionParams {
  uid: string;
  mensaje_usuario: string;
  mensaje_bot: string;
  string_fecha_hora: string;
  areaNegocio: AreaNegocio;
}
