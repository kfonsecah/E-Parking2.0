import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

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

    const userId = Number((session.user as any).id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "ID de usuario inválido" },
        { status: 400 }
      );
    }

    // Obtener fecha actual CR
    const nowUTC = new Date();
    const nowCR = new Date(nowUTC.getTime() - 6 * 60 * 60 * 1000);
    const todayCR = nowCR.toISOString().split("T")[0];

    const startOfDay = new Date(`${todayCR}T00:00:00`);
    const endOfDay = new Date(`${todayCR}T23:59:59`);

    // Buscar cualquier sesión abierta para el usuario hoy
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
        {
          hasActiveSession: false,
          openingAmount: 0,
          totalIngresos: 0,
          totalEgresos: 0,
          saldoActual: 0,
        },
        { status: 200 }
      );
    }

    // Calcular movimientos
    const ingresos = activeSession.transactions
      .filter((t) => t.transaction_type === "ingreso")
      .reduce((sum, t) => sum + Number(t.transaction_amount), 0);

    const egresos = activeSession.transactions
      .filter((t) => t.transaction_type === "egreso")
      .reduce((sum, t) => sum + Number(t.transaction_amount), 0);

    const saldoActual =
      Number(activeSession.session_open_amount) + ingresos - egresos;

    return NextResponse.json(
      {
        hasActiveSession: true,
        openingAmount: parseFloat(activeSession.session_open_amount.toFixed(2)),
        totalIngresos: parseFloat(ingresos.toFixed(2)),
        totalEgresos: parseFloat(egresos.toFixed(2)),
        saldoActual: parseFloat(saldoActual.toFixed(2)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error al consultar estado de caja:", error);
    return NextResponse.json(
      { error: "Error al consultar estado de caja", detail: String(error) },
      { status: 500 }
    );
  }
}
