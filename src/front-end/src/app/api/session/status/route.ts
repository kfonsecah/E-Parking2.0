import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("app-session")?.value;

  if (!cookie) {
    return NextResponse.json({ error: "No hay cookie" }, { status: 400 });
  }

  try {
    const { payload } = await jwtVerify(cookie, jwtSecret);
    const user = await prisma.ep_users.findUnique({
      where: { users_id: payload.id as number },
    });

    // Validar que la sesión sea válida
    if (!user || user.session_id !== payload.sessionId) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    // Actualizar última actividad
    await prisma.ep_users.update({
      where: { users_id: user.users_id },
      data: {
        session_last_activity: new Date(),
      },
    });

    return NextResponse.json({
      tokenSessionId: payload.sessionId,
      dbSessionId: user.session_id,
      userId: payload.id,
      lastActivity: user.session_last_activity,
    });
  } catch (e) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
}
