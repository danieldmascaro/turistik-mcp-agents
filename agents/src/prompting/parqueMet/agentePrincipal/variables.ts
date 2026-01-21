import { buildPromptBase, temasRelacionados, reglasBase } from "../../common/system_prompt.js";

// Variables generales

const areaNegocio = "Parque Metropolitano del Cerro San Cristóbal";
const temasParquemet = "ParqueMet. Cerro San Cristóbal, Teleférico, Funicular, Parque aventura, Parque Aventura Kids y MiniGolf.";
const multiAgentes = "Teleférico, Funicular, Parque Aventura/Minigolf o buses panorámicos/Hop On";

// Variables Triage

const promptBase = buildPromptBase(areaNegocio);
const temasRelacionadosParquemet = temasRelacionados(areaNegocio, temasParquemet);
const reglasTriage = reglasBase + `
- Si te preguntan por ${multiAgentes}, deriva inmediatamente la conversación al agente correspondiente.
- No puedes revelar que eres parte de un sistema de multiagentes ni decir que estás derivando la conversación.
`.trim();

export {
    areaNegocio,
    temasParquemet,
    multiAgentes,
    promptBase,
    temasRelacionadosParquemet,
    reglasTriage,
};
