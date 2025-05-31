import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions"; // Ajusta si tu proyecto cambia de estructura

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/cashier/history:
 *   get:
 *     summary: Get Cashier Session History
 *     description: Retrieves the cashier session history for the authenticated user for the current day, filtered by cash type.
 *     parameters:
 *       - in: query
 *         name: cashType
 *         required: true
 *         description: The type of cashier session to retrieve (e.g., "physical" or "virtual").
 *         schema:
 *           type: string
 *           example: "physical"
 *     responses:
 *       200:
 *         description: Cashier session history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sesiones encontradas"
 *                 sessions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sessionId:
 *                         type: string
 *                         description: The unique identifier for the cashier session.
 *                         example: "123e4567-e89b-12d3-a456-426614174000"
 *                       openingAmount:
 *                         type: number
 *                         description: The opening amount of the cashier session.
 *                         example: 10000.00
 *                       closingAmount:
 *                         type: number
 *                         description: The closing amount of the cashier session (if closed).
 *                         example: 15000.00
 *                       isClosed:
 *                         type: boolean
 *                         description: Indicates if the cashier session is closed.
 *                         example: true
 *                       openTime:
 *                         type: string
 *                         format: date-time
 *                         description: The time when the session was opened.
 *                         example: "2025-05-19T08:00:00Z"
 *                       closeTime:
 *                         type: string
 *                         format: date-time
 *                         description: The time when the session was closed (if closed).
 *                         example: "2025-05-19T17:00:00Z"
 *       400:
 *         description: Missing or invalid query parameter.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tipo de caja (cashType) es requerido"
 *                 detail:
 *                   type: string
 *                   example: "The 'cashType' query parameter is required."
 *       401:
 *         description: User not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuario no autenticado"
 *                 detail:
 *                   type: string
 *                   example: "User must be authenticated to view cashier session history."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al consultar historial de cajas"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while retrieving the cashier session history."
 */
export async function GET(req: NextRequest) {
  try {
    // Validar usuario autenticado
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    if (!userId) {
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const cashType = searchParams.get("cashType");

    if (!cashType) {
      return NextResponse.json(
        { error: "Tipo de caja (cashType) es requerido" },
        { status: 400 }
      );
    }

    // Obtener fecha actual en CR
    const nowUTC = new Date();
    const nowCR = new Date(nowUTC.getTime() - 6 * 60 * 60 * 1000);
    const todayCR = nowCR.toISOString().split("T")[0];

    const startOfDay = new Date(`${todayCR}T00:00:00`);
    const endOfDay = new Date(`${todayCR}T23:59:59`);

    // Buscar sesiones del día (abiertas o cerradas)
    const sessions = await prisma.ep_cashier_session.findMany({
      where: {
        session_user_id: userId,
        session_cash_type: cashType,
        session_open_time: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        session_open_time: "asc",
      },
    });

    if (sessions.length === 0) {
      return NextResponse.json(
        {
          message: "No hay sesiones registradas hoy para este tipo de caja",
          sessions: [],
        },
        { status: 200 }
      );
    }

    // Formatear respuesta
    const formattedSessions = sessions.map((session) => ({
      sessionId: session.session_id,
      openingAmount: parseFloat(session.session_open_amount.toFixed(2)),
      closingAmount:
        session.session_close_amount !== null
          ? parseFloat(session.session_close_amount.toFixed(2))
          : null,
      isClosed: session.session_is_closed,
      openTime: session.session_open_time,
      closeTime: session.session_close_time,
    }));

    return NextResponse.json(
      {
        message: "Sesiones encontradas",
        sessions: formattedSessions,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error al consultar historial de cajas:", error);
    return NextResponse.json(
      { error: "Error al consultar historial de cajas", detail: String(error) },
      { status: 500 }
    );
  }
}
