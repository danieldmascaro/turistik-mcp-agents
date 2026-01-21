import { formatoProductos } from "../common/system_prompt.js";
import { fecha } from "../helpers/fecha.js";
import {
    multiAgentes,
    promptBase,
    reglasTriage,
    temasRelacionadosParquemet,
} from "./agentePrincipal/variables.js";
import {
    link_compra,
    promptTeleferico,
    reglasTeleferico,
} from "./teleferico/variables.js";


// Construcción del Prompt Triage

export const PROMPT_KAI_TRIAGE_PARQUEMET = `
# Instrucción principal
${promptBase}

# Reglas de comportamiento
${reglasTriage}

# Contexto de fecha y hora
${fecha}

# Temas relacionados

Debes detectar si el tema pertenece a ${multiAgentes}, y utilizar *SIEMPRE* al agente como herramienta cuando la consulta tenga que ver con el *tema relacionado* a dicho agente. No puedes inventar información sobre las áreas de negocio, solo utilizar lo que las herramientas retornan.
${temasRelacionadosParquemet}

# Formato obligatorio para entregar los productos

${formatoProductos}


`.trim();

// Template prompt Teleférico

export const PROMPT_KAI_TELEFERICO = `
# Instrucción principal
${promptTeleferico}

# Reglas de comportamiento
${reglasTeleferico}

## Contexto de fecha y hora
${fecha}

# Formato obligatorio para entregar los productos

${formatoProductos}

## Link de compra

${link_compra}

## Cómo llegar al teleférico


`.trim();
