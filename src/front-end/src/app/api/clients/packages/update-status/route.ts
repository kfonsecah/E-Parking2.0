// src/app/api/clients/packages/update-status/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { client_slug, packageId } = await req.json();

    if (!client_slug || !packageId) {
      return NextResponse.json(
        { message: "Client Slug o Package ID inválido." },
        { status: 400 }
      );
    }

    // ✅ Extraer el client_id del slug
    const slugParts = client_slug.split("-");
    const clientId = parseInt(slugParts[slugParts.length - 1]);

    if (isNaN(clientId)) {
      return NextResponse.json(
        { message: "Client ID inválido en el slug." },
        { status: 400 }
      );
    }

    // ✅ Verificar que el cliente exista
    const client = await prisma.ep_clients.findUnique({
      where: {
        client_id: clientId,
      },
    });

    if (!client) {
      return NextResponse.json(
        { message: "Cliente no encontrado." },
        { status: 404 }
      );
    }

    // ✅ Actualiza el estado del paquete a "activo"
    const updatedPackage = await prisma.ep_clients_packages.updateMany({
      where: {
        client_pack_client_id: client.client_id,
        client_pack_pack_id: parseInt(packageId),
        status: "pendiente",
      },
      data: {
        status: "activo",
      },
    });

    if (updatedPackage.count === 0) {
      return NextResponse.json(
        { message: "Paquete no encontrado o ya activo." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Paquete activado correctamente." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al actualizar estado del paquete:", error);
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
