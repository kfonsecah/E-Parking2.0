import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Costa Rica timezone (UTC-6)
    const crNow = new Date(Date.now() - 6 * 60 * 60 * 1000);
    crNow.setUTCHours(0, 0, 0, 0);

    const startOfDay = new Date(crNow);
    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const notes = await prisma.ep_notes.findMany({
      where: {
        notes_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        notes_date: "desc",
      },
      select: {
        notes_id: true,
        notes_content: true,
        notes_date: true,
        user: {
          select: {
            users_name: true,
            users_lastname: true,
          },
        },
      },
    });

    const result = notes.map((note) => ({
      id: note.notes_id,
      contenido: note.notes_content,
      fecha: note.notes_date,
      usuario: `${note.user.users_name} ${note.user.users_lastname}`,
    }));

    return NextResponse.json({ ok: true, notas: result });
  } catch (error: any) {
    console.error("❌ Error fetching notes:", error.message);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  }
}
