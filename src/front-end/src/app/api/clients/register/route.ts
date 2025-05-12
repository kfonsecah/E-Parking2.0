// src/app/api/clients/register/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

// ✅ Método POST
export async function POST(req: Request) {
  try {
    const {
      client_name,
      client_lastname,
      client_id_card,
      client_email,
      client_phone,
      client_address,
      client_vehicle_plate,
      selectedPackage,
      client_pack_start_date,
      client_pack_end_date,
    } = await req.json();

    if (
      !client_name ||
      !client_lastname ||
      !client_id_card ||
      !client_email ||
      !client_phone ||
      !client_address ||
      !client_vehicle_plate ||
      !selectedPackage ||
      !client_pack_start_date ||
      !client_pack_end_date
    ) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    // ✅ Crear el cliente
    const newClient = await prisma.ep_clients.create({
      data: {
        client_name,
        client_lastname,
        client_id_card,
        client_email,
        client_phone,
        client_address,
        client_vehicle_plate,
      },
    });

    // ✅ Crear slug único basado en nombre y apellido
    const clientSlug = slugify(
      `${client_name}-${client_lastname}-${newClient.client_id}`,
      {
        lower: true,
        strict: true,
        replacement: "-",
      }
    );

    // ✅ Crear el paquete asociado
    await prisma.ep_clients_packages.create({
      data: {
        client_pack_client_id: newClient.client_id,
        client_pack_pack_id: parseInt(selectedPackage),
        client_pack_start_date: new Date(client_pack_start_date),
        client_pack_end_date: new Date(client_pack_end_date),
        status: "pendiente",
      },
    });

    // ✅ Devolver el slug para la redirección
    return NextResponse.json(
      {
        message: "Cliente y paquete registrados correctamente.",
        client_slug: clientSlug,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error al registrar cliente:", error);
    return NextResponse.json(
      { message: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
