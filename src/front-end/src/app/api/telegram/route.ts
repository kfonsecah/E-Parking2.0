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
    if (
      (sessionState === "authenticated" || sessionState === "writing_note") &&
      texto
    ) {
      const userId = userTelegramToDbId.get(chatId);
      if (userId) {
        const crTime = new Date(Date.now() - 6 * 60 * 60 * 1000);
        await prisma.ep_notes.create({
          data: {
            notes_user_id: userId,
            notes_content: texto,
            notes_date: crTime,
          },
        });

        await sendMessage(chatId, "✅ Nota guardada.");
        userSessions.set(chatId, "authenticated");

        const user = await prisma.ep_users.findUnique({
          where: { users_id: userId },
          include: { roles: { include: { role: true } } },
        });

        const isAdmin =
          user?.roles.some((r) =>
            ["admin", "administrador"].includes(r.role.rol_name.toLowerCase())
          ) || false;

        await showMainMenu(chatId, isAdmin);
      }

      return NextResponse.json({ ok: true });
    }

    // 🔘 Por defecto
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("❌ Error:", err.response?.data || err.message);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
