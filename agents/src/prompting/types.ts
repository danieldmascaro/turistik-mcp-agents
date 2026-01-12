import z from "zod";
// Saludos Kai

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


export type SaludoKai = ReturnType<
typeof import("./common/user_prompts.js").getSaludoKai
>;

export interface SaludoHandlerParams {
  comando: SaludoKey;
  uid: string;
  string_fecha_hora: string;
}
// Cambio de área de negocio

export const AREA_NEGOCIO_CHOICES = ["ParqueMet", "Turismo"] as const;

export type AreaNegocio = (typeof AREA_NEGOCIO_CHOICES)[number];

export const AreaNegocioSchema = z.enum(AREA_NEGOCIO_CHOICES);

export interface CambioAreaNegocio {
  nuevaArea: AreaNegocio;
}

// Si querés el schema del payload completo:
export const CambioAreaNegocioSchema = z.object({
  nuevaArea: AreaNegocioSchema,
});

// Conversación histórica

export type Turno = {
  mensaje_usuario: string;
  mensaje_bot: string;
};
export interface BuildPromptFromHistoryParams {
  entrada: string;
  history: Turno[] | null;
}
