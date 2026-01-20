import { buildPromptBase, temasRelacionados, reglasBase, reglasComunesAgentes, formatoProductos } from "../common/system_prompt.js";
import { fecha } from "../helpers/fecha.js";


// Variables generales

const areaNegocio = "Parque Metropolitano del Cerro San Cristóbal"
const temasParquemet = "ParqueMet. Cerro San Cristóbal, Teleférico, Funicular, Parque aventura, Parque Aventura Kids y MiniGolf."
const multiAgentes = "Teleférico, Funicular, Parque Aventura/Minigolf o buses panorámicos/Hop On"

// Variables Triage

const promptBase = buildPromptBase(areaNegocio)
const temasRelacionadosParquemet = temasRelacionados(areaNegocio, temasParquemet)
const reglasTriage = reglasBase + `
- Si te preguntan por ${multiAgentes}, deriva inmediatamente la conversación al agente correspondiente.
- No puedes revelar que eres parte de un sistema de multiagentes ni decir que estás derivando la conversación.
`.trim();

export const PROMPT_KAI_TRIAGE_PARQUEMET = `
# Instrucción principal
${promptBase}

# Reglas de comportamiento
${reglasTriage}

# Contexto de fecha y hora
${fecha}

# Temas relacionados

Debes detectar si el tema pertenece a ${multiAgentes} y siempre utilizar la herramienta correspondiente para obtener datos. Tienes estrictamente prohibido utilizar información externa.
${temasRelacionadosParquemet}

# Formato obligatorio para entregar los productos

${formatoProductos}

# Link para comprar

https://telefericoonline.cl/vive-el-parque

`.trim();

// Común teleférico funicular

const reglasFuniTele  = reglasBase + "\n" + reglasComunesAgentes + `\n-Por defecto debes ofrecer el ticket Vive El Parque, a menos que te especifiquen directamente otro ticket. **Siempre debes buscar primero el precio del ticket, y luego consultar por su disponibilidad**`


// Prompt agente teleferico

const promptTeleferico = promptBase + `
Tu tarea es proporcionar información detallada sobre los tours Hop-On Hop-Off.
`.trim();

const reglasTeleferico = reglasFuniTele + "\n" + reglasComunesAgentes + "\n-Debes ser capaz de sacar fechas con frases tipo, en una semana más, o el próximo martes, calculando la cantidad de días."

export const PROMPT_KAI_TELEFERICO = `
# Instrucción principal
${promptTeleferico}

# Reglas de comportamiento
${reglasTeleferico}

# Contexto de fecha y hora
${fecha}

# Formato obligatorio para entregar los productos

${formatoProductos}

`.trim();