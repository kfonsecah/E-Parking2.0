import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/cashier/open:
 *   post:
 *     summary: Open Cashier Session
 *     description: Opens a new cashier session for the authenticated user, allowing them to register an initial cash amount and specify the type of cash session.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cashType:
 *                 type: string
 *                 description: The type of cashier session (e.g., "physical" or "virtual").
 *                 example: "physical"
 *               openAmount:
 *                 type: number
 *                 description: The initial amount of cash registered for the session.
 *                 example: 10000.00
 *     responses:
 *       201:
 *         description: Cashier session successfully opened.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Caja abierta exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     session_id:
 *                       type: string
 *                       description: The unique identifier for the cashier session.
 *                       example: "123e4567-e89b-12d3-a456-426614174000"
 *                     session_user_id:
 *                       type: number
 *                       description: The ID of the user who opened the session.
 *                       example: 123
 *                     session_open_amount:
 *                       type: number
 *                       description: The amount registered at the session opening.
 *                       example: 10000.00
 *                     session_open_time:
 *                       type: string
 *                       format: date-time
 *                       description: The timestamp of when the session was opened.
 *                       example: "2025-05-19T08:00:00Z"
 *                     session_cash_type:
 *                       type: string
 *                       description: The type of cash session (e.g., "physical" or "virtual").
 *                       example: "physical"
 *                     session_is_closed:
 *                       type: boolean
 *                       description: Indicates if the session is currently closed.
 *                       example: false
 *                     session_version:
 *                       type: number
 *                       description: The version of the session record.
 *                       example: 1
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp of the session creation in UTC format.
 *                   example: "2025-05-19T08:00:00Z"
 *       400:
 *         description: Validation error or session already open for today.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ya existe una caja abierta para este usuario hoy"
 *                 detail:
 *                   type: string
 *                   example: "The user already has an open cashier session today."
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
 *                   example: "User must be authenticated to open a cashier session."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al abrir caja"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while opening the cashier session."
 */
export async function POST(req: NextRequest) {
  try {
    // Obtener sesión del usuario autenticado
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const userIdString = (session.user as any).id;
    const userId = parseInt(userIdString, 10);

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    // Leer el cuerpo de la petición
    const body = await req.json();
    const { cashType, openAmount } = body;

    if (!cashType || openAmount === undefined || openAmount === null) {
      return NextResponse.json(
        { error: "Datos incompletos: cashType y openAmount son requeridos" },
        { status: 400 }
      );
    }

    // Obtener fecha actual en formato Costa Rica (UTC-6)
    const nowUTC = new Date();
    const nowCR = new Date(nowUTC.getTime() - 6 * 60 * 60 * 1000);
    const todayCR = nowCR.toISOString().split("T")[0];

    const startOfDay = new Date(`${todayCR}T00:00:00`);
    const endOfDay = new Date(`${todayCR}T23:59:59`);

    // Validar que no tenga ninguna sesión abierta hoy (sin importar tipo)
    const existingSession = await prisma.ep_cashier_session.findFirst({
      where: {
        session_user_id: userId,
        session_open_time: {
          gte: startOfDay,
          lte: endOfDay,
        },
        session_is_closed: false,
      },
    });

    if (existingSession) {
      return NextResponse.json(
        { error: "Ya existe una caja abierta para este usuario hoy" },
        { status: 400 }
      );
    }

    // Crear nueva sesión en base de datos
    const newSession = await prisma.ep_cashier_session.create({
      data: {
        session_user_id: userId,
        session_open_amount: parseFloat(openAmount),
        session_open_time: nowCR,
        session_cash_type: cashType,
        session_version: 1,
        session_is_closed: false,
      },
    });

    // Registrar en bitácora (pendiente de crear tabla cashier_logs)
    /*
    await prisma.cashier_log.create({
      data: {
        user_id: userId,
        action_type: "OPEN_SESSION",
        timestamp: nowCR,
        data_snapshot: JSON.stringify(newSession),
      },
    });
    */

    return NextResponse.json(
      {
        message: "Caja abierta exitosamente",
        data: newSession,
        timestamp: nowCR.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error en apertura de caja:", error);
    return NextResponse.json(
      { error: "Error al abrir caja", detail: String(error) },
      { status: 500 }
    );
  }
}
