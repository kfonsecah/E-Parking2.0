// cSpell:ignore inválido diferencia desconocido Método

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { jwtVerify } from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET!);

/**
 * @swagger
 * /api/auth/validate:
 *   get:
 *     summary: Validate User Session
 *     description: Validates the user's session using either a custom JWT or NextAuth token.
 *     responses:
 *       200:
 *         description: Session validated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   description: Indicates if the session is valid.
 *                   example: true
 *                 origin:
 *                   type: string
 *                   description: The authentication method used to validate the session.
 *                   example: "JWT personalizado"
 *       401:
 *         description: Invalid or unauthorized session.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Sesión inválida"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error validando sesión"
 */
export async function GET(req: NextRequest) {
  try {
    let userId: number | null = null;
    let sessionId: string | null = null;
    let origin = "desconocido";

    const cookieToken = req.cookies.get("app-session")?.value;

    if (cookieToken) {
      // 🔐 Método personalizado (JWT con app-session)
      const { payload } = await jwtVerify(cookieToken, jwtSecret);
      userId = payload.id as number;
      sessionId = payload.sessionId as string;
      origin = "JWT personalizado";
    } else {
      // 🔐 Método NextAuth
      const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });

      if (!token || !(token as any).id || !(token as any).sessionId) {
        console.warn("⛔ Token NextAuth inválido");
        return NextResponse.json(
          { error: "No autorizado (NextAuth)" },
          { status: 401 }
        );
      }

      userId = parseInt((token as any).id);
      sessionId = (token as any).sessionId;
      origin = "NextAuth";
    }

    const user = await prisma.ep_users.findUnique({
      where: { users_id: userId },
    });

    if (!user || user.session_id !== sessionId) {
      console.warn("⚠️ Session ID inválido", {
        origin,
        userId,
        sessionId,
        dbSessionId: user?.session_id,
      });
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    // ✅ Sesión válida
    return NextResponse.json({ ok: true, origin });
  } catch (error) {
    console.error("❌ Error validando sesión:", error);
    return NextResponse.json(
      { error: "Error validando sesión" },
      { status: 500 }
    );
  }
}
