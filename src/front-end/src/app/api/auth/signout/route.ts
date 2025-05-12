import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";
import { jwtVerify } from "jose";

const prisma = new PrismaClient();
const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function POST(req: NextRequest) {
  try {
    let userId: number | null = null;

    // 🔍 Intentar con JWT personalizado
    const cookieToken = req.cookies.get("app-session")?.value;
    if (cookieToken) {
      const { payload } = await jwtVerify(cookieToken, jwtSecret);
      userId = payload.id as number;
    } else {
      // 🔍 Fallback con token NextAuth
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (!token || !(token as any).id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      userId = parseInt((token as any).id);
    }

    if (!userId) {
      return NextResponse.json(
        { error: "ID de usuario desconocido" },
        { status: 400 }
      );
    }

    // 🧹 Limpiar sesión en DB
    await prisma.ep_users.update({
      where: { users_id: userId },
      data: {
        session_id: null,
        session_last_activity: null,
      },
    });

    // 🍪 Borrar cookie personalizada
    const response = NextResponse.json({ ok: true });
    response.cookies.set("app-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("❌ Error al cerrar sesión:", error);
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
