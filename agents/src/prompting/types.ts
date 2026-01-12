export type SaludoKey = keyof typeof import("./common/user_prompts.js").saludos_kai;

export type Turno = {
  mensaje_usuario: string;
  mensaje_bot: string;
};

export type SaludoKai = ReturnType<
  typeof import("./common/user_prompts.js").getSaludoKai
>;

export interface SaludoHandlerParams {
  comando: SaludoKey;
  uid: string;
  string_fecha_hora: string;
}

export interface BuildPromptFromHistoryParams {
  entrada: string;
  history: Turno[] | null;
}
