import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, payment_method, transaction_type } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

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
