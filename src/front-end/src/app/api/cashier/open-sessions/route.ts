import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest"; // Usamos JWT y NextAuth

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/cashier/open-session:
 *   get:
 *     summary: Get Current Open Cashier Session
 *     description: Retrieves the currently open cashier session for the authenticated user, if it exists.
 *     responses:
 *       200:
 *         description: Open cashier session retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 *                   description: The unique identifier for the open cashier session.
 *                   example: "123e4567-e89b-12d3-a456-426614174000"
 *                 cashType:
 *                   type: string
 *                   description: The type of the open cashier session (e.g., "physical" or "virtual").
 *                   example: "physical"
 *                 openTime:
 *                   type: string
 *                   format: date-time
 *                   description: The timestamp of when the session was opened.
 *                   example: "2025-05-19T08:00:00Z"
 *       401:
 *         description: User not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No autorizado"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error interno"
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const openSession = await prisma.ep_cashier_session.findFirst({
      where: {
        session_user_id: userId,
        session_is_closed: false,
      },
      select: {
        session_id: true,
        session_cash_type: true,
        session_open_time: true,
      },
    });

    if (!openSession) {
      return NextResponse.json(null, { status: 200 });
    }

    const session = {
      sessionId: openSession.session_id,
      cashType: openSession.session_cash_type,
      openTime: openSession.session_open_time,
    };

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("❌ Error al obtener sesión abierta:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
