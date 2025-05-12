import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const roles = await prisma.ep_roles.findMany({
      include: { users: true },
    });
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los roles", detail: `${error}` },
      { status: 500 }
    );
  }
}
