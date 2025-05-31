import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, payment_method, transaction_type } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();
/**
 * @swagger
 * /api/cashier/transaction:
 *   post:
 *     summary: Register Cashier Transaction
 *     description: Registers a transaction for the authenticated user's active cashier session, including payments received and change given.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cashType:
 *                 type: string
 *                 description: The type of cashier session (e.g., "Común" or "Eventos").
 *                 example: "Común"
 *               paymentMethod:
 *                 type: string
 *                 description: The payment method used (e.g., "cash", "card", "sinpe", "transfer").
 *                 example: "cash"
 *               totalToPay:
 *                 type: number
 *                 description: The total amount to be paid by the customer.
 *                 example: 5000.00
 *               totalReceived:
 *                 type: number
 *                 description: The total amount received from the customer.
 *                 example: 10000.00
 *     responses:
 *       201:
 *         description: Transactions successfully registered.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Movimientos registrados exitosamente"
 *                 insertados:
 *                   type: integer
 *                   description: The number of transactions registered.
 *                   example: 2
 *                 movimientos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       transaction_session_id:
 *                         type: integer
 *                         description: The ID of the cashier session for the transaction.
 *                         example: 123
 *                       transaction_amount:
 *                         type: number
 *                         description: The amount of the transaction.
 *                         example: 5000.00
 *                       transaction_type:
 *                         type: string
 *                         description: The type of transaction (e.g., "ingreso" or "egreso").
 *                         example: "ingreso"
 *                       transaction_pay_method:
 *                         type: string
 *                         description: The payment method used for the transaction.
 *                         example: "cash"
 *                       transaction_description:
 *                         type: string
 *                         description: A brief description of the transaction.
 *                         example: "Pago recibido"
 *                       transaction_created_at:
 *                         type: string
 *                         format: date-time
 *                         description: The timestamp when the transaction was created.
 *                         example: "2025-05-19T15:00:00Z"
 *       400:
 *         description: Validation error or no open session found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No tienes una caja abierta para el tipo solicitado"
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
 *                   example: "Error interno al registrar movimientos"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while registering transactions."
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const userId = parseInt((session.user as any).id, 10);
    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    const { cashType, paymentMethod, totalToPay, totalReceived } =
      await req.json();

    if (
      !cashType ||
      !paymentMethod ||
      totalToPay == null ||
      totalReceived == null
    ) {
      return NextResponse.json(
        {
          error:
            "Faltan datos: cashType, paymentMethod, totalToPay o totalReceived",
        },
        { status: 400 }
      );
    }

    const parsedTotalToPay = parseFloat(totalToPay);
    const parsedTotalReceived = parseFloat(totalReceived);

    if (isNaN(parsedTotalToPay) || parsedTotalToPay <= 0) {
      return NextResponse.json(
        { error: "totalToPay debe ser un número mayor a 0" },
        { status: 400 }
      );
    }
    if (isNaN(parsedTotalReceived) || parsedTotalReceived <= 0) {
      return NextResponse.json(
        { error: "totalReceived debe ser un número mayor a 0" },
        { status: 400 }
      );
    }

    const nowUTC = new Date();
    const nowCR = new Date(nowUTC.getTime() - 6 * 60 * 60 * 1000);
    const todayCR = nowCR.toISOString().split("T")[0];

    const activeSession = await prisma.ep_cashier_session.findFirst({
      where: {
        session_user_id: userId,
        session_cash_type: cashType,
        session_open_time: {
          gte: new Date(`${todayCR}T00:00:00`),
          lte: new Date(`${todayCR}T23:59:59`),
        },
        session_is_closed: false,
      },
    });

    if (!activeSession) {
      return NextResponse.json(
        { error: "No tienes una caja abierta para el tipo solicitado" },
        { status: 400 }
      );
    }

    const change = parsedTotalReceived - parsedTotalToPay;

    const transactions: {
      transaction_session_id: number;
      transaction_amount: number;
      transaction_type: transaction_type;
      transaction_pay_method: payment_method;
      transaction_description: string;
      transaction_created_at: Date;
    }[] = [];

    // Pago recibido
    transactions.push({
      transaction_session_id: activeSession.session_id,
      transaction_amount: parsedTotalToPay,
      transaction_type: "ingreso" as transaction_type,
      transaction_pay_method: paymentMethod as payment_method,
      transaction_description: "Pago recibido",
      transaction_created_at: nowCR,
    });

    // Si hay vuelto (cambio)
    if (change > 0) {
      transactions.push({
        transaction_session_id: activeSession.session_id,
        transaction_amount: change,
        transaction_type: "egreso" as transaction_type, // 🔥 Aquí casteamos correctamente
        transaction_pay_method: "efectivo" as payment_method,
        transaction_description: "Vuelto entregado",
        transaction_created_at: nowCR,
      });
    }

    const result = await prisma.ep_cashier_transaction.createMany({
      data: transactions,
    });

    return NextResponse.json(
      {
        message: "Movimientos registrados exitosamente",
        insertados: result.count,
        movimientos: transactions,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("❌ Error en POST /api/cashier/transaction:", error);
    return NextResponse.json(
      {
        error: "Error interno al registrar movimientos",
        detail: error.message || String(error),
      },
      { status: 500 }
    );
  }
}
