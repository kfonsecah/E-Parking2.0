import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest";

const prisma = new PrismaClient();

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
