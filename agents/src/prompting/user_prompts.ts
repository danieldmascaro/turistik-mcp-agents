import { buildFechaBotSimple } from "./helpers/fecha.js";

export const saludos_kai = {
  "#SaludoKaiV2ESP": [
    "Parquemet",
    "Hola Kai",
    "Hola, soy Kai, el asistente virtual de Turistik. ¿En qué puedo ayudarte hoy?",
  ],
  "#SaludoKaiV2ENG": [
    "Parquemet",
    "Hi Kai, can you assist me?",
    "Hi there! I'm Kai, your virtual assistant from Turistik. How can I help you today?",
  ],
  "#SaludoKaiV2POR": [
    "Parquemet",
    "Olá, você pode me ajudar?",
    "Olá! Eu sou Kai, o assistente virtual da Turistik. Como posso te ajudar hoje?",
  ],
  "#SaludoKaiV2ESPTOUR": [
    "Turismo",
    "Hola Kai",
    "Hola, soy Kai, el asistente virtual de Turistik. ¿En qué puedo ayudarte hoy? Si estás interesado en tours o los paseos en los Buses Hop-On Hop-Off, ¡estaré encantado de ofrecerte información!",
  ],
  "#SaludoKaiV2ENGTOUR": [
    "Turismo",
    "Hi Kai, can you assist me?",
    "Hi, I'm Kai, Turistik's virtual assistant. How can I help you today? If you're interested in tours or the Hop-On Hop-Off buses, I'll be happy to provide you with information!",
  ],
  "#SaludoKaiV2PORTOUR": [
    "Turismo",
    "Olá, você pode me ajudar?",
    "Olá, eu sou o Kai, assistente virtual da Turistik. Como posso te ajudar hoje? Se você estiver interessado em passeios ou nos ônibus Hop-On Hop-Off, ficarei feliz em te fornecer informações!",
  ],
} as const;

export type SaludoKey = keyof typeof saludos_kai;

export type Turno = { mensaje_usuario: string; mensaje_bot: string };

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
        `${buildFechaBotSimple()}
      Interacción ${i + 1}:\nUsuario: ${t.mensaje_usuario}\nAgente: ${t.mensaje_bot}\n`
    )
    .join("\n");
}


export function buildPromptFromHistory(params: {
  entrada: string;
  history: Turno[] | null;
}): string {
  const { entrada, history } = params;

  if (!history || history.length === 0) {
    return buildUserPromptSaludo(entrada);
  }

  const historialStr = formatHistorial(history);
  return buildUserPrompt(historialStr, entrada);
}
