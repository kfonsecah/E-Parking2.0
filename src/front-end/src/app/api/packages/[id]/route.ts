import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const packId = parseInt(id);
  const { pack_name, pack_price } = await req.json();

  if (!pack_name || typeof pack_price !== "number") {
    return NextResponse.json(
      { error: "Nombre y precio son requeridos." },
      { status: 400 }
    );
  }

  try {
    const paquete = await prisma.ep_packages.findUnique({
      where: { pack_id: packId },
    });

    if (!paquete) {
      return NextResponse.json(
        { error: "Paquete no encontrado" },
        { status: 404 }
      );
    }

    const actualizado = await prisma.ep_packages.update({
      where: { pack_id: packId },
      data: {
        pack_name,
        pack_price,
        pack_version: paquete.pack_version + 1,
      },
    });

    return NextResponse.json(actualizado, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al editar paquete", detail: `${error}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const packId = parseInt(id);

  try {
    await prisma.ep_packages.delete({
      where: { pack_id: packId },
    });

    return NextResponse.json({ message: "Paquete eliminado" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error al eliminar paquete",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
