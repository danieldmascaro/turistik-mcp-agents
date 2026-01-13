import "dotenv/config";
import { triageAgent } from "./tour_agents/tour_agents.js";
import {
  run,
  InputGuardrailTripwireTriggered,
} from "@openai/agents";
import { saludoHandler } from "./prompting/helpers/saludos.js";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { buildFechaBotSimple } from "./prompting/helpers/fecha.js";
import { armarPromptParaAgente, guardarInteraccion, borrarMemoriaUID, getAreaNegocio } from "./helpers/user_config/user_settings.js";
import { closePool } from "./helpers/db_helpers/db.js";






const userId = "Local Master MCP";
const string_fecha_hora = buildFechaBotSimple();
const rl = readline.createInterface({ input, output });
const userPrompt = await rl.question("Ingrese un prompt: ");
rl.close();



async function main() {
  try {
    if (userPrompt.trim() === "#Reiniciar") {
    await borrarMemoriaUID(userId);
    console.log("Memoria reiniciada para el usuario:", userId);
    return;
    } else if (userPrompt.trim() === "#SaludoKaiV2ESP") {
      await saludoHandler({
        comando: "#SaludoKaiV2ESP",
        uid: userId,
        string_fecha_hora,
      })
      return;
    } else if (userPrompt.trim().startsWith("#SaludoKaiV2ENG")) {
      await saludoHandler({
        comando: "#SaludoKaiV2ENG",
        uid: userId,
        string_fecha_hora,
      })
      return;
    } else if (userPrompt.trim() === "#SaludoKaiV2POR") {
      await saludoHandler({
        comando: "#SaludoKaiV2POR",
        uid: userId,
        string_fecha_hora,
      })
      return;
    } else if (userPrompt.trim() === "#SaludoKaiV2ESPTOUR") {
      await saludoHandler({
        comando: "#SaludoKaiV2ESPTOUR",
        uid: userId,
        string_fecha_hora,
      })
      return;
    } else if (userPrompt.trim().startsWith("#SaludoKaiV2ENGTOUR")) {
      await saludoHandler({
        comando: "#SaludoKaiV2ENGTOUR",
        uid: userId,
        string_fecha_hora,
      })
      return;
    } else if (userPrompt.trim() === "#SaludoKaiV2PORTOUR") {
      await saludoHandler({
        comando: "#SaludoKaiV2PORTOUR",
        uid: userId,
        string_fecha_hora,
      })
      return;
    }

    // Consultar área de negocio actual
    const areaNegocio = await getAreaNegocio(userId);
    // 1) Armar prompt CON historial (antes del run)
    const promptArmado = await armarPromptParaAgente({
      uid: userId,
      mensaje_usuario: userPrompt,
      area_negocio: "turismo",
    });

    // 2) Correr agente con promptArmado
    const result = await run(triageAgent, promptArmado, {
      context: { userId, userPrompt },
    });
    const respuestaBot = String(result.finalOutput ?? "");
    console.log(respuestaBot);

    // 3) Guardar interacción (después del run)

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
