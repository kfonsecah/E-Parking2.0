import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { BASE_URL, TELEGRAM_API } from "./constants";
import { userTelegramToDbId } from "./sessionManager";

const prisma = new PrismaClient();

/**
 * Genera el menú dinámico según los privilegios del usuario
 */
export function generateDynamicMenu(isAdmin: boolean, isDev: boolean = false) {
  const menu = [
    [{ text: "📝 Enviar nota", callback_data: "enviar_nota" }],
    [
      { text: "📦 Consultar cajas del día", callback_data: "consultar_cajas" },
      { text: "🌐 Ver URL del sistema", callback_data: "consultar_url" },
    ],
  ];

  if (isAdmin) {
    menu.push([
      { text: "🧑‍💼 Registrar usuario", callback_data: "registrar_usuario" },
      { text: "🏷 Ver roles", callback_data: "ver_roles" },
    ]);
  }

  if (isDev) {
    menu.push([{ text: "🚪 Cerrar sesión", callback_data: "cerrar_sesion" }]);
  }

  return menu;
}

/**
 * Muestra el menú principal del bot con detección de roles y nombre del usuario
 */
export async function showMainMenu(chatId: number, isAdmin: boolean) {
  const userId = userTelegramToDbId.get(chatId);
  let nombreCompleto = "Usuario";
  let isDev = false;

  if (userId) {
    const user = await prisma.ep_users.findUnique({
      where: { users_id: userId },
      include: { roles: { include: { role: true } } },
    });

    if (user) {
      nombreCompleto = `${user.users_name} ${user.users_lastname}`;
      isDev = user.roles.some((r) =>
        ["desarrollador", "dev"].includes(r.role.rol_name.toLowerCase())
      );
    }
  }

  const keyboard = generateDynamicMenu(isAdmin, isDev);

  await axios.post(`${TELEGRAM_API}/sendPhoto`, {
    chat_id: chatId,
    photo: `${BASE_URL}/media/bienvenida.png`,
    caption: `👋 Hola ${nombreCompleto}. Soy el *Park Xpress Bot*.\n¡Bienvenido!`,
    parse_mode: "Markdown",
    reply_markup: { inline_keyboard: keyboard },
  });
}
