// lib/telegramBot/handlers/handleRegister.ts
import { sendMessage } from "../messages";
import { BASE_URL } from "../constants";
import {
  userSessions,
  pendingUserData,
  roleSelectionMap,
  userTelegramToDbId,
} from "../sessionManager";
import { showMainMenu } from "../menu";
import { isUserAdmin } from "../utils/isUserAdmin";

export async function handleRegister(chatId: number, texto: string) {
  const sessionState = userSessions.get(chatId);
  const step = sessionState!.split("_")[1];
  const current = pendingUserData.get(chatId) || {};

  switch (step) {
    case "name":
      current.users_name = texto;
      userSessions.set(chatId, "register_lastname");
      await sendMessage(chatId, "🧾 Ingrese el apellido:");
      break;

    case "lastname":
      current.users_lastname = texto;
      userSessions.set(chatId, "register_ced");
      await sendMessage(chatId, "🧾 Ingrese la cédula:");
      break;

    case "ced":
      current.users_id_card = texto;
      userSessions.set(chatId, "register_email");
      await sendMessage(chatId, "📧 Ingrese el correo:");
      break;

    case "email":
      current.users_email = texto;
      userSessions.set(chatId, "register_username");
      await sendMessage(chatId, "👤 Ingrese el nombre de usuario:");
      break;

    case "username":
      current.users_username = texto;
      userSessions.set(chatId, "register_password");
      await sendMessage(chatId, "🔑 Ingrese la contraseña:");
      break;

    case "password":
      if (!texto || !texto.trim()) {
        await sendMessage(chatId, "❌ La contraseña no puede estar vacía.");
        return;
      }
      current.users_password = texto.trim();
      userSessions.set(chatId, "register_role");

      const rolesRes = await fetch(`${BASE_URL}/api/roles`);
      const roles = await rolesRes.json();

      const roleMap: Record<string, string> = {};
      const lista = roles
        .map((r: any, i: number) => {
          roleMap[`${i + 1}`] = r.rol_name;
          return `${i + 1}. ${r.rol_name}`;
        })
        .join("\n");

      roleSelectionMap.set(chatId, roleMap);
      await sendMessage(chatId, `🏷 Ingrese el número del rol:\n${lista}`);
      break;

    case "role":
      const map = roleSelectionMap.get(chatId) || {};
      const selectedRole = map[texto];

      if (!selectedRole) {
        await sendMessage(chatId, "❌ Rol no válido.");
        return;
      }

      current.users_version = 1;

      try {
        const createUser = await fetch(`${BASE_URL}/api/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(current),
        });

        if (!createUser.ok) {
          const err = await createUser.json();
          await sendMessage(chatId, `❌ Error: ${err.error}`);
        } else {
          const newUser = await createUser.json();
          const allRoles = await fetch(`${BASE_URL}/api/roles`).then((r) =>
            r.json()
          );
          const role = allRoles.find((r: any) => r.rol_name === selectedRole);

          if (!role) {
            await sendMessage(chatId, "⚠️ Rol no encontrado.");
          } else {
            await fetch(
              `${BASE_URL}/api/users/${newUser.users_id}/assign-role`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rol_id: role.rol_id }),
              }
            );
            await sendMessage(chatId, "✅ Usuario creado y rol asignado.");
          }
        }
      } catch (err) {
        console.error("❌ Error en creación de usuario:", err);
        await sendMessage(chatId, "❌ Error inesperado al crear el usuario.");
      }

      userSessions.set(chatId, "authenticated");
      pendingUserData.delete(chatId);

      const userId = userTelegramToDbId.get(chatId);
      const isAdmin = userId ? await isUserAdmin(userId) : false;
      await showMainMenu(chatId, isAdmin);
      break;
  }

  pendingUserData.set(chatId, current);
}
