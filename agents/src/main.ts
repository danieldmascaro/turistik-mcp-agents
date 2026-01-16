import "dotenv/config";
import { triageAgentTurismo } from "./tour_agents/tour_agents.js";
import { triageAgentCerro } from "./parquemet_agents/parquemet_agents.js";
import {
  run,
  InputGuardrailTripwireTriggered,
} from "@openai/agents";
import { comandoSaludoHandler } from "./prompting/helpers/saludos.js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { armarPromptParaAgente, guardarInteraccion, borrarMemoriaUID, getAreaNegocio } from "./helpers/user_config/user_settings.js";
import { closePool } from "./helpers/db_helpers/db.js";
import type { AreaNegocio } from "./prompting/types.js";
import { string_fecha_hora } from "./prompting/helpers/fecha.js";

// User Id y Prompt desde consola
const userId = "Local Master MCP";
const areaNegocio = await getAreaNegocio(userId) as AreaNegocio;
const rl = readline.createInterface({ input, output });
const userPrompt = await rl.question("Ingrese un prompt: ");
rl.close();

type ProductoItem = {
  nombre?: string;
  precio?: number;
  descripcion?: string;
  horario?: string;
};

type AgentesProductosOutput = {
  respuesta?: string;
  tickets?: ProductoItem[];
};

const formatRespuestaAgentesProductos = (finalOutput: unknown): string => {
  if (!finalOutput || typeof finalOutput !== "object") {
    return String(finalOutput ?? "");
  }

  const output = finalOutput as AgentesProductosOutput;
  const respuesta = typeof output.respuesta === "string" ? output.respuesta : "";
  const tickets = Array.isArray(output.tickets) ? output.tickets : [];

  if (tickets.length === 0) {
    return respuesta;
  }

  const lines: string[] = [respuesta, "", "Detalles de los productos:"];
  for (const ticket of tickets) {
    const nombre = ticket?.nombre ?? "";
    const precioNumero = typeof ticket?.precio === "number" ? ticket.precio : Number(ticket?.precio);
    const precioFormateado = Number.isFinite(precioNumero)
      ? precioNumero.toLocaleString("es-CL")
      : String(ticket?.precio ?? "");
    const descripcion = ticket?.descripcion ?? "";
    const horario = ticket?.horario ?? "";

    lines.push(nombre);
    lines.push(`Precios desde: $${precioFormateado} CLP`);
    lines.push(descripcion);
    lines.push(`Horario: "${horario}"`);
    lines.push("");
  }

  if (lines[lines.length - 1] === "") {
    lines.pop();
  }

  return lines.join("\n");
};


async function main() {
  try {
    if (userPrompt.trim() === "#Reiniciar") {
      await borrarMemoriaUID(userId, areaNegocio);
    console.log("Memoria reiniciada para el usuario:", userId);
    return;
  } else if (userPrompt.trim().startsWith("#SaludoKaiV2")) {
    // Consultar área de negocio actual
    await comandoSaludoHandler(userPrompt, userId, string_fecha_hora, areaNegocio);
    return;
  }

  // 1) Armar prompt CON historial (antes del run)
  const promptArmado = await armarPromptParaAgente({
      uid: userId,
      mensaje_usuario: userPrompt,
      area_negocio: areaNegocio,
    });
    let result;
    if (areaNegocio === "Turismo") {
      console.log("Área de negocio actual: Turismo");
      result = await run(triageAgentTurismo, promptArmado, {
        context: { userId, userPrompt },
      });
    } else if (areaNegocio === "ParqueMet") {
      result = await run(triageAgentCerro, promptArmado, {
        context: { userId, userPrompt },
      });
      console.log("Área de negocio actual: ParqueMet");
    }

        

    const respuestaBot = formatRespuestaAgentesProductos(result?.finalOutput);
    console.log(respuestaBot);

    // 3) Guardar interacción (después del run)
    await guardarInteraccion({
      uid: userId,
      mensaje_usuario: userPrompt,
      mensaje_bot: respuestaBot,
      string_fecha_hora,
      areaNegocio: areaNegocio,
    });
  } catch (e) {
    if (e instanceof InputGuardrailTripwireTriggered) {
      console.error("Hola, soy Kai. Puedo ayudarte con solicitudes relacionadas a Turistik.");
      return;
    }
    throw e;
  } finally {
    try {
      await closePool();
    } catch (err) {
      console.error("No se pudo cerrar el pool SQL:", err);
    }
  }
}

main().catch((err) => console.error(err));
