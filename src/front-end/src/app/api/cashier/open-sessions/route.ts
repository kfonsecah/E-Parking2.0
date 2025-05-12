import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getUserIdFromRequest } from "@/lib/getUserIdFromRequest"; // Usamos JWT y NextAuth

const prisma = new PrismaClient();

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
