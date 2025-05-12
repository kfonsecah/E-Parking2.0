import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

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
