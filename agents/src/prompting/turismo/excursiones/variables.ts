import { promptBase } from "../agentePrincipal/variables.js";
import { reglasComunesAgentes } from "../hopOn/variables.js";

// Prompt para el agente de Tours y Excursiones

const promptBaseExcursiones = promptBase + `
Tu tarea es proporcionar información detallada sobre los tours y excursiones disponibles.
`.trim();

const reglasExcursiones = reglasComunesAgentes;

export {
    promptBaseExcursiones,
    reglasExcursiones,
};
