import { buildPromptBase } from "../common/system_prompt.js";

// Triage Agent ParqueMet

const area_de_negocio = "ParqueMet. Cerro San Cristóbal, Teleférico, Funicular, Parque aventura, Parque Aventura Kids y MiniGolf."

const prompt_base = buildPromptBase(area_de_negocio)