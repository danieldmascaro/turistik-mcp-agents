import "dotenv/config";
import { triageAgent } from "./tour_agents/tour_agents.js";
import {
  run,
  InputGuardrailTripwireTriggered,
} from "@openai/agents";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { buildFechaBotSimple } from "./prompting/helpers/fecha.js";
import { armarPromptParaAgente, guardarInteraccion, borrarMemoriaUID } from "./helpers/user_memory/memory_helpers.js";
import { closePool } from "./helpers/db_helpers/db.js";



export const userId = "Local Master MCP";

const rl = readline.createInterface({ input, output });
export const userPrompt = await rl.question("Ingrese un prompt: ");
rl.close();



async function main() {
  try {
    if (userPrompt.trim() === "#Reiniciar") {
    await borrarMemoriaUID(userId);
    console.log("Memoria reiniciada para el usuario:", userId);
    return;
  }
    // 1) Armar prompt CON historial (antes del run)
    const promptArmado = await armarPromptParaAgente({
      uid: userId,
      mensaje_usuario: userPrompt,
    });

    // 2) Correr agente con promptArmado
    const result = await run(triageAgent, promptArmado, {
      context: { userId, userPrompt },
    });
    const respuestaBot = String(result.finalOutput ?? "");
    console.log(respuestaBot);

    // 3) Guardar interacción (después del run)
    const string_fecha_hora = buildFechaBotSimple();

    await guardarInteraccion({
      uid: userId,
      mensaje_usuario: userPrompt,
      mensaje_bot: respuestaBot,
      string_fecha_hora,
    });
  } catch (e) {
    if (e instanceof InputGuardrailTripwireTriggered) {
      console.log("Guardrail activado: entrada peligrosa detectada.");
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
