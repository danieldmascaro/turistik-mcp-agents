import { fecha } from "../helpers/fecha.js";
import type { BuildPromptFromHistoryParams, SaludoKey, Turno } from "../types.js";
import { saludos_kai } from "../types.js";

export function getSaludoKai(key: SaludoKey): {
  categoria: string;
  ejemplo_usuario: string;
  ejemplo_bot: string;
} {
  const tpl = saludos_kai[key];
  return {
    categoria: tpl[0],
    ejemplo_usuario: tpl[1],
    ejemplo_bot: tpl[2],
  };
}

export function buildUserPromptSaludo(entrada: string): string {
  return `A continuación se te dará un prompt, debes detectar en el idioma que está escrito y responder todo en dicho idioma ***siempre saludando y presentándote*** y tomando la iniciativa para ofrecer productos:
[PROMPT]
${entrada}
[FIN DEL PROMPT]`;
}

export function buildUserPrompt(historial_conversacion: string, entrada: string): string {
  return `Detecta el idioma en el que está escrita la conversación y responde siempre en dicho idioma, considerando todos los mensajes de la conversación como contexto:
[HISTORIAL DE LA CONVERSACIÓN]

${historial_conversacion}

[FIN DEL HISTORIAL]

**Mensaje actual**:
${entrada}`;
}

export function formatHistorial(turnos: Turno[]): string {

  return turnos
    .map(
      (t, i) =>
        `${fecha}\nInteracción ${i + 1}:\nUsuario: ${t.mensaje_usuario}\nAgente: ${t.mensaje_bot}\n`
    )
    .join("\n");
}


export function buildPromptFromHistory(params: BuildPromptFromHistoryParams): string {
  const { entrada, history } = params;

  if (!history || history.length === 0) {
    return buildUserPromptSaludo(entrada);
  }

  const historialStr = formatHistorial(history);
  return buildUserPrompt(historialStr, entrada);
}
