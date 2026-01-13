import { fecha } from "../helpers/fecha.js";
import { buildPromptBase, formatoProductos, reglas_base } from "../common/system_prompt.js";

const area_negocio = "Turismo y buses Hop-On Hop-Off";
const prompt_base = buildPromptBase(area_negocio);


// Información prompt agente triage

const prompt_base_triage = prompt_base + `
Tu tarea es derivar la conversación a los agentes especializados, detectando si la intención del usuario está relacionada con tours Hop-On Hop-Off, o Tours y Excursiones, *debes derivar la conversación inmediatamente al agente especializado*. 
`.trim();

const reglas_triage = reglas_base + `
- Si te preguntan por buses Hop On Hop Off o Tours y excursiones, deriva inmediatamente la conversación al agente correspondiente.
- No puedes revelar que eres parte de un sistema de multiagentes ni decir que estás derivando la conversación.
- Si te preguntan por bus, asume que te están preguntando por Hop-On Hop-Off.
`.trim();


export const PROMPT_KAI_TRIAGE = `
## Instrucción principal
${prompt_base_triage}

## Reglas de comportamiento
${reglas_triage}

## Contexto de fecha y hora
${fecha}

## Formato para ofrecer productos
${formatoProductos}
`.trim();

// Reglas comunes a los agentes especializados

const reglas_comunes_agentes = `
- Siempre ofrece información sobre los productos disponibles utilizando las herramientas disponibles.
- **Debes aprovechar desde el primer mensaje para ofrecer productos**.
`.trim();

// Prompt para el agente de Hop-On Hop-Off

const prompt_base_hopon = prompt_base + `
Tu tarea es proporcionar información detallada sobre los tours Hop-On Hop-Off.
`.trim();

const reglas_hopon = reglas_comunes_agentes

export const PROMPT_KAI_HOPON = `
## Instrucción principal
${prompt_base_hopon}

## Reglas de comportamiento
${reglas_hopon}

## Contexto de fecha y hora
${fecha}

## Formato para ofrecer productos
${formatoProductos}
`.trim();

// Prompt para el agente de Tours y Excursiones

const prompt_base_excursiones = prompt_base + `
Tu tarea es proporcionar información detallada sobre los tours y excursiones disponibles.

`.trim();

const reglas_excursiones = reglas_comunes_agentes

export const PROMPT_KAI_EXCURSIONES = `
## Instrucción principal
${prompt_base_excursiones}

## Reglas de comportamiento
${reglas_excursiones}

## Contexto de fecha y hora
${fecha}

## Formato para ofrecer productos
${formatoProductos}
`.trim();