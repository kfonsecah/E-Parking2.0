import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();
const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
  try {
    let userId: number | null = null;
    let sessionId: string | null = null;
    let origin = "desconocido";

    const tokenCookie = req.cookies.get("app-session")?.value;

    // 🛡️ Verificación para JWT personalizado
    if (tokenCookie) {
      try {
        const { payload } = await jwtVerify(tokenCookie, jwtSecret);
        userId = payload.id as number;
        sessionId = payload.sessionId as string;
        origin = "JWT personalizado";
      } catch (error) {
        console.error("❌ Error verificando JWT personalizado:", error);
        return NextResponse.redirect(new URL("/auth", req.url));
      }
    }

    // 🛡️ Verificación para NextAuth
    if (!userId || !sessionId) {
      try {
        const token = await getToken({
          req,
          secret: process.env.NEXTAUTH_SECRET,
        });

        if (!token || !(token as any).id || !(token as any).sessionId) {
          console.warn("⛔ Token NextAuth inválido");
          return NextResponse.redirect(new URL("/auth", req.url));
        }

        userId = token.id as number;
        sessionId = token.sessionId as string;
        origin = "NextAuth";
      } catch (error) {
        console.error("❌ Error verificando token de NextAuth:", error);
        return NextResponse.redirect(new URL("/auth", req.url));
      }
    }

    const user = await prisma.ep_users.findUnique({
      where: { users_id: userId },
    });

    if (!user || user.session_id !== sessionId) {
      console.warn("⚠️ Middleware: sesión inválida", {
        origin,
        userId,
        tokenSessionId: sessionId,
        dbSessionId: user?.session_id,
      });
      return NextResponse.redirect(new URL("/auth", req.url));
    }

    // ✅ Sesión válida
    return NextResponse.next();
  } catch (error) {
    console.error("❌ Middleware: error verificando sesión", error);
    return NextResponse.redirect(new URL("/auth", req.url));
  }
}
