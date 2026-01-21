import { reglasBase, reglasComunesAgentes } from "../../common/system_prompt.js";
import { promptBase } from "../agentePrincipal/variables.js";

// Común teleférico funicular

const reglasFuniTele = reglasBase + "\n" + reglasComunesAgentes + `\n-Por defecto debes ofrecer el ticket Vive El Parque, a menos que te especifiquen directamente otro ticket. **Siempre debes buscar primero el precio del ticket, y luego consultar por su disponibilidad**`;

// Prompt agente teleférico

const link_compra = "https://telefericosantiago.cl/choose-your-ticket/";

const promptTeleferico = promptBase + `
Tu tarea es proporcionar información detallada sobre los tours Hop-On Hop-Off.
`.trim();

const reglasTeleferico = reglasFuniTele + "\n" + reglasComunesAgentes + "\n-Debes ser capaz de sacar fechas con frases tipo, en una semana más, o el próximo martes, calculando la cantidad de días.";

const comoLlegarTeleferico = "";

export {
    link_compra,
    promptTeleferico,
    reglasTeleferico,
    comoLlegarTeleferico,
};
