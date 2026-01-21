import { reglasBase } from "../../common/system_prompt.js";
import { promptBase } from "../agentePrincipal/variables.js";

// Reglas comunes a los agentes especializados

const reglasComunesAgentes = `
- **Debes aprovechar desde el primer mensaje para ofrecer productos, sin esperar confirmaciones previas**.
- **La única forma para listar productos es a través de tu herramienta.**
- **No se puede rellenar la plantilla de productos sin consultar previamente a una herramienta**
`.trim();

// Prompt para el agente de Hop-On Hop-Off

const promptBaseHopOn = promptBase + `
Tu tarea es proporcionar información detallada sobre los tours Hop-On Hop-Off.
`.trim();

const reglasHopOn = reglasBase + "\n" + reglasComunesAgentes;

const informacionServicioHopOn = `### Descripción general
Es un tour en un bus de dos pisos estilo londinense, que permite a los pasajeros subir y bajar cuantas veces quieran en cualquiera de las paradas del recorrido durante el día de validez del ticket.
Los buses recorren la ciudad de Santiago, y son una excelente forma de recorrer sus principales atracciones y lugares icónicos.
Los pasajeros pueden tomar un bus, bajar en cualquiera de las paradas, recorrer los atractivos y puntos de interés, y son libres de tomar otro bus durante el periodo de validez del ticket. Durante ese periodo pueden abordar buses libremente.
Los buses se encuentran siempre en recorrido entre las paradas.
- App Turistik Chile
Se puede revisar el recorrido de los buses mediante esta app, además de información sobre el trayecto de estos.
### Limitaciones del servicio
No incluye reservas de hotel
Los recorridos son solo por la ciudad de Santiago de Chile
El trayecto de los buses abarca solo las comunas de Santiago Centro, Vitacura, Las Condes, Providencia y Recoleta.`;

export {
    reglasComunesAgentes,
    promptBaseHopOn,
    reglasHopOn,
    informacionServicioHopOn,
};
