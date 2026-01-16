import { buildPromptBase, temasRelacionados, reglasBase, formatoProductos } from "../common/system_prompt.js";
import { fecha } from "../helpers/fecha.js";


// Variables generales

const areaNegocio = "Parque Metropolitano del Cerro San Cristóbal"
const temasParquemet = "ParqueMet. Cerro San Cristóbal, Teleférico, Funicular, Parque aventura, Parque Aventura Kids y MiniGolf."
const multiAgentes = "Teleférico, Funicular, Parque Aventura/Minigolf o buses panorámicos/Hop On"

// Variables Triage

const promptBaseTriageParquemet = buildPromptBase(areaNegocio)
const temasRelacionadosParquemet = temasRelacionados(areaNegocio, temasParquemet)
const reglasTriage = reglasBase + `
- Si te preguntan por ${multiAgentes}, deriva inmediatamente la conversación al agente correspondiente.
- No puedes revelar que eres parte de un sistema de multiagentes ni decir que estás derivando la conversación.
`.trim();

export const PROMPT_KAI_TRIAGE_PARQUEMET = `
## Instrucción principal
${promptBaseTriageParquemet}

## Reglas de comportamiento
${reglasTriage}

## Contexto de fecha y hora
${fecha}

## Temas relacionados

Debes detectar si el tema pertenece a ${multiAgentes}. Y utilizar al agente como herramienta según corresponda.
${temasRelacionadosParquemet}

## Formato para ofrecer productos
${formatoProductos}
`.trim();