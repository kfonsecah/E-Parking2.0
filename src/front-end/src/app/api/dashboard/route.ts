import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Get Dashboard Data
 *     description: Retrieves parking and cashier data for the authenticated user's dashboard, including available spaces, parked cars, and financial summaries.
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 availableSpaces:
 *                   type: integer
 *                   description: The number of available parking spaces.
 *                   example: 50
 *                 totalSpaces:
 *                   type: integer
 *                   description: The total number of parking spaces.
 *                   example: 100
 *                 egressedCars:
 *                   type: integer
 *                   description: The total number of cars that have exited the parking lot.
 *                   example: 30
 *                 onExitCars:
 *                   type: integer
 *                   description: The number of cars that have exited within the last 15 minutes.
 *                   example: 5
 *                 parkedCars:
 *                   type: integer
 *                   description: The total number of currently parked cars.
 *                   example: 20
 *                 openingAmount:
 *                   type: number
 *                   description: The total opening amount of active cashier sessions for the day.
 *                   example: 10000.00
 *                 totalIngresos:
 *                   type: number
 *                   description: The total amount of ingresos (cash in) for the day.
 *                   example: 15000.00
 *                 totalEgresos:
 *                   type: number
 *                   description: The total amount of egresos (cash out) for the day.
 *                   example: 5000.00
 *                 saldoActual:
 *                   type: number
 *                   description: The current balance of active cashier sessions for the day.
 *                   example: 20000.00
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
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al cargar datos del dashboard"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while loading dashboard data."
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const userId = Number((session.user as any).id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    // Hora actual CR
    const nowUTC = new Date();
    const nowCR = new Date(nowUTC.getTime() - 6 * 60 * 60 * 1000);

    const dayStart = new Date(nowCR);
    dayStart.setHours(0, 0, 0, 0);

    const dayFinish = new Date(nowCR);
    dayFinish.setHours(23, 59, 59, 999);

    const minExit = new Date(nowCR.getTime() - 15 * 60 * 1000);

    // 🔥 Datos de parqueo
    const totalSpaces = await prisma.ep_information.findFirst({
      select: { info_spaces: true },
    });

    const parkedCars = await prisma.ep_vehicles.count({
      where: { veh_status: "P" },
    });

    const egressedCars = await prisma.ep_vehicles.count({
      where: { veh_status: "E" },
    });

    const onExitCars = await prisma.ep_vehicles.count({
      where: {
        veh_status: "E",
        veh_egress_date: {
          gte: minExit,
        },
      },
    });

    // 🔥 Datos de caja
    const sessions = await prisma.ep_cashier_session.findMany({
      where: {
        session_user_id: userId,
        session_open_time: {
          gte: dayStart,
          lte: dayFinish,
        },
        session_is_closed: false,
      },
      include: {
        transactions: true,
      },
    });

    let openingAmount = 0;
    let totalIngresos = 0;
    let totalEgresos = 0;

    sessions.forEach((session) => {
      openingAmount += Number(session.session_open_amount);

      session.transactions.forEach((t) => {
        if (t.transaction_type === "ingreso") {
          totalIngresos += Number(t.transaction_amount);
        } else if (t.transaction_type === "egreso") {
          totalEgresos += Number(t.transaction_amount);
        }
      });
    });

    const saldoActual = openingAmount + totalIngresos - totalEgresos;

    return NextResponse.json({
      // 📦 Datos del parqueo
      availableSpaces: (totalSpaces?.info_spaces ?? 0) - parkedCars,
      totalSpaces: totalSpaces?.info_spaces ?? 0,
      egressedCars,
      onExitCars,
      parkedCars,

      // 💸 Datos de la caja
      openingAmount: parseFloat(openingAmount.toFixed(2)),
      totalIngresos: parseFloat(totalIngresos.toFixed(2)),
      totalEgresos: parseFloat(totalEgresos.toFixed(2)),
      saldoActual: parseFloat(saldoActual.toFixed(2)),
    });
  } catch (error) {
    console.error("❌ Error al cargar dashboard:", error);
    return NextResponse.json(
      { error: "Error al cargar datos del dashboard", detail: String(error) },
      { status: 500 }
    );
  }
}
