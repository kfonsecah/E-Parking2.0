import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET!);

/**
 * @swagger
 * /api/auth/validate-session:
 *   get:
 *     summary: Validate User Session
 *     description: Validates the user's session using the JWT token stored in the "app-session" cookie.
 *     responses:
 *       200:
 *         description: Session validated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tokenSessionId:
 *                   type: string
 *                   description: The session ID from the JWT token.
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 dbSessionId:
 *                   type: string
 *                   description: The session ID stored in the database.
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 userId:
 *                   type: integer
 *                   description: The ID of the authenticated user.
 *                   example: 1
 *                 lastActivity:
 *                   type: string
 *                   format: date-time
 *                   description: The last recorded activity timestamp for the user.
 *                   example: "2025-05-19T14:30:00Z"
 *       400:
 *         description: Missing session cookie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No hay cookie"
 *       401:
 *         description: Invalid session or token.
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
 *                   example: "Token inválido"
 */
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
