import { fecha } from "../helpers/fecha.js";
import { formatoProductos } from "../common/system_prompt.js";
import {
    promptBaseTriage,
    reglasTriage,
    temasRelacionadosTurismo,
} from "./agentePrincipal/variables.js";
import {
    informacionServicioHopOn,
    promptBaseHopOn,
    reglasHopOn,
} from "./hopOn/variables.js";
import {
    promptBaseExcursiones,
    reglasExcursiones,
} from "./excursiones/variables.js";


export const PROMPT_KAI_TRIAGE_TURISMO = `
# Instrucción principal
${promptBaseTriage}

# Reglas de comportamiento
${reglasTriage}

# Contexto de fecha y hora
${fecha}

# Formato obligatorio para entregar los productos

${formatoProductos}

# Temas relacionados

Debes detectar si el tema pertenece a Buses Hop On-Hop Off, o a excursiones. Y utilizar al agente como herramienta siempre que la consulta tenga que ver con el tema relacionado a dicho agente.
${temasRelacionadosTurismo}

`.trim();

export const PROMPT_KAI_HOPON = `
# Instrucción principal
${promptBaseHopOn}

# Reglas de comportamiento
${reglasHopOn}

### Contexto de fecha y hora
${fecha}

### Formato obligatorio para entregar los productos

${formatoProductos}

# Descripción del servicio

${informacionServicioHopOn}


`.trim();

export const PROMPT_KAI_EXCURSIONES = `
# Instrucción principal
${promptBaseExcursiones}

# Reglas de comportamiento
${reglasExcursiones}

# Contexto de fecha y hora
${fecha}

# Formato obligatorio para entregar los productos

${formatoProductos}

`.trim();
