// src/app/api/telegram/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

import { sendMessage } from "@/lib/telegram_bot/messages";
import { showMainMenu } from "@/lib/telegram_bot/menu";
import { handleInlineCallback } from "@/lib/telegram_bot/handlers/handleCallback";
import { handleRegister } from "@/lib/telegram_bot/handlers/handleRegister";
import { isUserAdmin } from "@/lib/telegram_bot/utils/isUserAdmin";
import {
  userSessions,
  userTelegramToDbId,
  pendingUserData,
} from "@/lib/telegram_bot/sessionManager";

function normalizeCedula(value: string): string {
  return value.replace(/\D/g, "");
}

const prisma = new PrismaClient();
/**
 * @swagger
 * /api/telegram:
 *   post:
 *     summary: Handle Telegram Bot Webhook
 *     description: Processes incoming messages and callbacks from the Park Xpress Telegram bot, including authentication, note creation, and user registration.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: object
 *                 description: The message object from the Telegram bot.
 *                 example:
 *                   message_id: 123
 *                   from:
 *                     id: 456
 *                     first_name: "Juan"
 *                     last_name: "Pérez"
 *                   chat:
 *                     id: 789
 *                     type: "private"
 *                   text: "/start"
 *                   date: 1684497851
 *               callback_query:
 *                 type: object
 *                 description: The callback query object from inline buttons.
 *                 example:
 *                   id: "1234567890"
 *                   from:
 *                     id: 456
 *                     first_name: "Juan"
 *                     last_name: "Pérez"
 *                   message:
 *                     message_id: 123
 *                     chat:
 *                       id: 789
 *                       type: "private"
 *                   data: "registrar_usuario"
 *     responses:
 *       200:
 *         description: Webhook processed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   description: Indicates if the message was processed successfully.
 *                   example: true
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Error interno del servidor"
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message || body.callback_query?.message;
    const data = body.callback_query?.data;
    const chatId = message?.chat?.id;
    const texto = body.message?.text?.trim();
    const sessionState = userSessions.get(chatId);

    if (!message || !chatId) return NextResponse.json({ ok: true });

    // 🔘 Botones inline
    if (data) {
      await handleInlineCallback(chatId, data);
      return NextResponse.json({ ok: true });
    }

    // 🔘 /start o /menu
    if (texto === "/start" || texto === "/menu") {
      const userId = userTelegramToDbId.get(chatId);

      if (!userId) {
        userSessions.set(chatId, "awaiting_cedula");
        await sendMessage(
          chatId,
          "🔒 Bienvenido. Ingrese su cédula para comenzar."
        );
        return NextResponse.json({ ok: true });
      }

      if (sessionState !== "authenticated") {
        userSessions.set(chatId, "authenticated");
      }

      const isAdmin = await isUserAdmin(userId);
      await showMainMenu(chatId, isAdmin);
      return NextResponse.json({ ok: true });
    }

    // 🔐 Paso 1: Validar cédula
    if (sessionState === "awaiting_cedula") {
      const cedulaIngresada = texto!;
      const usuarios = await prisma.ep_users.findMany();

      const usuario = usuarios.find(
        (u) =>
          normalizeCedula(u.users_id_card) === normalizeCedula(cedulaIngresada)
      );

      if (!usuario) {
        await sendMessage(chatId, "❌ Cédula no encontrada.");
        userSessions.delete(chatId);
        return NextResponse.json({ ok: true });
      }

      // Guardar provisionalmente el ID y el hash de contraseña
      pendingUserData.set(chatId, {
        id: usuario.users_id,
        passwordHash: usuario.users_password,
      });

      userSessions.set(chatId, "awaiting_password");
      await sendMessage(chatId, "🔑 Ingrese su contraseña.");
      return NextResponse.json({ ok: true });
    }

    // 🔐 Paso 2: Validar contraseña
    if (sessionState === "awaiting_password") {
      const pending = pendingUserData.get(chatId);
      if (!pending) {
        await sendMessage(
          chatId,
          "⚠️ Error de sesión. Intente con /start nuevamente."
        );
        userSessions.delete(chatId);
        return NextResponse.json({ ok: true });
      }

      const passwordIngresada = texto!;
      let validPassword = await bcrypt.compare(
        passwordIngresada,
        pending.passwordHash
      );

      if (!validPassword && passwordIngresada === pending.passwordHash) {
        validPassword = true; // Fallback para usuarios sin hash
      }

      if (!validPassword) {
        await sendMessage(chatId, "❌ Contraseña incorrecta.");
        userSessions.delete(chatId);
        pendingUserData.delete(chatId);
        return NextResponse.json({ ok: true });
      }

      // Éxito
      userSessions.set(chatId, "authenticated");
      userTelegramToDbId.set(chatId, pending.id);
      pendingUserData.delete(chatId);

      await sendMessage(chatId, "✅ Acceso permitido.");
      const isAdmin = await isUserAdmin(pending.id);
      await showMainMenu(chatId, isAdmin);
      return NextResponse.json({ ok: true });
    }

    // 🔘 Registrar usuario
    if (sessionState?.startsWith("register_")) {
      await handleRegister(chatId, texto!);
      return NextResponse.json({ ok: true });
    }

    // 🔘 Guardar nota
    if (sessionState === "authenticated" || sessionState === "writing_note") {
      const userId = userTelegramToDbId.get(chatId);
      if (userId && texto) {
        // Separar estado y contenido
        const [estado, ...resto] = texto.split(" ");
        const contenido = resto.join(" ").trim().replace(/  +/g, " ");

        // Validar estado
        const estadosValidos = ["nuevo", "advertencia", "alerta"];
        if (!estadosValidos.includes(estado.toLowerCase())) {
          await sendMessage(
            chatId,
            "⚠️ Estado no válido. Use 'nuevo', 'advertencia' o 'alerta'."
          );
          return NextResponse.json({ ok: true });
        }

        // Guardar el estado provisionalmente
        pendingUserData.set(chatId, {
          id: userId,
          status: estado.toLowerCase(),
          content: contenido,
        });

        // Pedir fecha de expiración
        await sendMessage(
          chatId,
          "📅 Ingrese la fecha de expiración (YYYY-MM-DD)."
        );
        userSessions.set(chatId, "awaiting_expiry_date");
        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ ok: true });
    }

    // 🔐 Validar fecha de expiración
    if (sessionState === "awaiting_expiry_date") {
      const pending = pendingUserData.get(chatId);
      if (!pending) {
        await sendMessage(
          chatId,
          "⚠️ Error de sesión. Intente con /start nuevamente."
        );
        userSessions.delete(chatId);
        return NextResponse.json({ ok: true });
      }

      // Validar formato de fecha
      const fechaIngresada = texto!.trim();
      const fechaExpiracion = new Date(`${fechaIngresada}T23:59:59`);

      if (isNaN(fechaExpiracion.getTime())) {
        await sendMessage(
          chatId,
          "❌ Formato de fecha inválido. Use 'YYYY-MM-DD'."
        );
        return NextResponse.json({ ok: true });
      }

      // Guardar la nota
      await prisma.ep_notes.create({
        data: {
          notes_user_id: pending.id,
          notes_content: pending.content,
          notes_date: new Date(),
          notes_expiry: fechaExpiracion,
          notes_status: pending.status,
        },
      });

      await sendMessage(chatId, "✅ Nota guardada correctamente.");
      userSessions.set(chatId, "authenticated");
      pendingUserData.delete(chatId);

      // Mostrar menú principal
      const isAdmin = await isUserAdmin(pending.id);
      await showMainMenu(chatId, isAdmin);
      return NextResponse.json({ ok: true });
    }

    // 🔘 Por defecto
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Error:", err.message);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
