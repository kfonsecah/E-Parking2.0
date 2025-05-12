// src/app/api/roles-assigned/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
  }

  const rolId = parseInt(id);

  try {
    const assigned = await prisma.ep_user_roles.findFirst({
      where: { rol_user_rol_id: rolId },
    });

    return NextResponse.json({ assigned: !!assigned });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al consultar asignación", detail: `${error}` },
      { status: 500 }
    );
  }
}
