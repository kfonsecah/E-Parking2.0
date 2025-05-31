import { sendMessage } from "../messages";
import { BASE_URL } from "../constants";
import { showMainMenu } from "../menu";
import {
  userSessions,
  pendingUserData,
  userTelegramToDbId,
} from "../sessionManager";
import { isUserAdmin } from "../utils/isUserAdmin";

export async function handleInlineCallback(chatId: number, data: string) {
  if (data === "registrar_usuario") {
    userSessions.set(chatId, "register_name");
    pendingUserData.set(chatId, {});
    await sendMessage(chatId, "🧑 Ingrese el nombre del nuevo usuario:");
    return;
  }

  if (data === "enviar_nota") {
    userSessions.set(chatId, "writing_note");
    await sendMessage(
      chatId,
      "📝 Escriba su nota en el siguiente formato:\n\n" +
        "<estado> <contenido>\n\n" +
        "📌 Estados permitidos:\n" +
        " - nuevo (verde)\n" +
        " - advertencia (amarillo)\n" +
        " - alerta (rojo)\n\n" +
        "Ejemplo:\n" +
        "advertencia No permitir la entrada al carro AAA-123\n\n" +
        "⚠️ Recuerde que el estado es obligatorio y debe ir primero.\n"
    );
    return;
  }

  if (data === "consultar_cajas") {
    try {
      const typesRes = await fetch(`${BASE_URL}/api/cashier?type=types`);
      const types = await typesRes.json();

      if (!types || types.length === 0) {
        await sendMessage(chatId, "ℹ️ No hay cajas registradas hoy.");
      } else {
        let message = "📦 *Cajas del día:*\n\n";
        for (const type of types) {
          const res = await fetch(`${BASE_URL}/api/cashier?type=${type}`);
          const totals = await res.json();
          message += `• *${type}*: ₡${totals.totalEnCaja.toLocaleString(
            "es-CR",
            { minimumFractionDigits: 2 }
          )}\n`;
        }

        await sendMessage(chatId, message, { parse_mode: "Markdown" });
      }
    } catch (err) {
      console.error("❌ Error al consultar cajas:", err);
      await sendMessage(chatId, "⚠️ Error al consultar las cajas.");
    }

    const userId = userTelegramToDbId.get(chatId);
    const isAdmin = userId ? await isUserAdmin(userId) : false;
    await showMainMenu(chatId, isAdmin);
    return;
  }

  if (data === "ver_roles") {
    try {
      const res = await fetch(`${BASE_URL}/api/roles`);
      const roles = await res.json();

      if (!roles || roles.length === 0) {
        await sendMessage(chatId, "ℹ️ No hay roles registrados.");
        return;
      }

      let message = "🏷 *Roles disponibles:*\n\n";
      for (const role of roles) {
        message += `• *${role.rol_name}*\n`;
      }

      await sendMessage(chatId, message, { parse_mode: "Markdown" });
    } catch (err) {
      console.error("❌ Error al consultar roles:", err);
      await sendMessage(chatId, "⚠️ Error al consultar los roles.");
    }

    const userId = userTelegramToDbId.get(chatId);
    const isAdmin = userId ? await isUserAdmin(userId) : false;
    await showMainMenu(chatId, isAdmin);
    return;
  }

  if (data === "cerrar_sesion") {
    userSessions.delete(chatId);
    userTelegramToDbId.delete(chatId);
    pendingUserData.delete(chatId);

    await sendMessage(
      chatId,
      "🚪 Has cerrado sesión. Usa /start para comenzar nuevamente."
    );
    return;
  }

  const respuestas: Record<string, string> = {
    consultar_url: "🌐 Visite: https://parkxpress.vercel.app",
  };

  const respuesta = respuestas[data] || "⚠️ Acción no reconocida.";
  await sendMessage(chatId, respuesta);

  const userId = userTelegramToDbId.get(chatId);
  const isAdmin = userId ? await isUserAdmin(userId) : false;
  await showMainMenu(chatId, isAdmin);
}
