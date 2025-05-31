import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";

const prisma = new PrismaClient();
/**
 * @swagger
 * /api/cashier/close:
 *   post:
 *     summary: Close Cashier Session
 *     description: Closes an active cashier session for an authenticated user. The user must provide the actual counted amount for the session and may include an optional breakdown of the counted cash.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               realAmount:
 *                 type: number
 *                 description: Actual counted amount for the cashier session.
 *                 example: 25000.00
 *               reason:
 *                 type: string
 *                 description: Reason for closing the session. Optional but required if there is a discrepancy.
 *                 example: "Discrepancy detected during cash count"
 *               breakdown:
 *                 type: object
 *                 description: Detailed cash breakdown.
 *                 properties:
 *                   coins:
 *                     type: number
 *                     description: Total amount in coins.
 *                     example: 500.00
 *                   bills:
 *                     type: number
 *                     description: Total amount in bills.
 *                     example: 23000.00
 *                   sinpe:
 *                     type: number
 *                     description: Total amount received via SINPE mobile.
 *                     example: 1000.00
 *                   transfer:
 *                     type: number
 *                     description: Total amount received via bank transfers.
 *                     example: 500.00
 *     responses:
 *       200:
 *         description: Cashier session successfully closed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cashier session successfully closed"
 *                 data:
 *                   type: object
 *                   properties:
 *                     session:
 *                       type: object
 *                       description: Information about the closed session.
 *                     expectedBalance:
 *                       type: number
 *                       description: The calculated expected balance.
 *                       example: 25000.00
 *                     realBalance:
 *                       type: number
 *                       description: The actual counted amount registered.
 *                       example: 24000.00
 *                     difference:
 *                       type: number
 *                       description: The difference between the expected and actual amounts.
 *                       example: -1000.00
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp of the closure in UTC format.
 *                   example: "2025-05-19T17:45:00Z"
 *       400:
 *         description: Validation error or no open session found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No open cashier session found"
 *                 detail:
 *                   type: string
 *                   example: "The requested cashier session could not be found."
 *       401:
 *         description: User not authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not authenticated"
 *                 detail:
 *                   type: string
 *                   example: "The user must be authenticated to close the cashier session."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while closing the cashier session."
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const { realAmount, reason, breakdown } = await req.json();

    if (realAmount === undefined || realAmount === null || isNaN(realAmount)) {
      return NextResponse.json(
        {
          error:
            "El monto real contado (realAmount) es requerido y debe ser un número válido",
        },
        { status: 400 }
      );
    }

    const realAmountFixed = parseFloat(parseFloat(realAmount).toFixed(2));

    const activeSession = await prisma.ep_cashier_session.findFirst({
      where: {
        session_user_id: userId,
        session_is_closed: false,
      },
      include: {
        transactions: true,
      },
    });

    if (!activeSession) {
      return NextResponse.json(
        { error: "No hay una caja abierta para cerrar" },
        { status: 400 }
      );
    }

    // Calcular movimientos
    const ingresos = activeSession.transactions
      .filter((t) => t.transaction_type === "ingreso")
      .reduce((sum, t) => sum + Number(t.transaction_amount), 0);

    const egresos = activeSession.transactions
      .filter((t) => t.transaction_type === "egreso")
      .reduce((sum, t) => sum + Number(t.transaction_amount), 0);

    const expectedBalance = parseFloat(
      (Number(activeSession.session_open_amount) + ingresos - egresos).toFixed(
        2
      )
    );

    const difference = parseFloat(
      (realAmountFixed - expectedBalance).toFixed(2)
    );
    const nowUTC = new Date();
    const nowCR = new Date(nowUTC.getTime() - 6 * 60 * 60 * 1000);

    // Cerrar la sesión
    const closedSession = await prisma.ep_cashier_session.update({
      where: { session_id: activeSession.session_id },
      data: {
        session_close_amount: realAmountFixed,
        session_close_time: nowCR,
        session_is_closed: true,
      },
    });

    // Registrar en auditoría con desglose
    await prisma.ep_cashier_audit.create({
      data: {
        audit_session_id: activeSession.session_id,
        audit_user_id: userId,
        audit_cash_type: activeSession.session_cash_type,
        audit_expected_amount: expectedBalance,
        audit_real_amount: realAmountFixed,
        audit_difference: difference,
        audit_reason:
          reason?.trim() ||
          (Math.abs(difference) > 0.01
            ? "Diferencia detectada"
            : "Conciliación correcta"),
        audit_created_at: nowCR,

        // 💰 Desglose recibido del frontend (con fallback a 0)
        audit_cash_coins: parseFloat(breakdown?.coins) || 0,
        audit_cash_bills: parseFloat(breakdown?.bills) || 0,
        audit_cash_sinpe: parseFloat(breakdown?.sinpe) || 0,
        audit_cash_transfer: parseFloat(breakdown?.transfer) || 0,
      },
    });

    return NextResponse.json(
      {
        message: "Caja cerrada exitosamente",
        data: {
          session: closedSession,
          expectedBalance,
          realBalance: realAmountFixed,
          difference,
        },
        timestamp: nowCR.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error al cerrar caja:", error);
    return NextResponse.json(
      { error: "Error al cerrar caja", detail: String(error) },
      { status: 500 }
    );
  }
}
