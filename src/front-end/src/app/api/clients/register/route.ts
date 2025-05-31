// src/app/api/clients/register/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/clients/register:
 *   post:
 *     summary: Register New Client and Package
 *     description: Registers a new client with the provided details and associates a package with the client, returning a unique client slug.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               client_name:
 *                 type: string
 *                 description: The first name of the client.
 *                 example: "John"
 *               client_lastname:
 *                 type: string
 *                 description: The last name of the client.
 *                 example: "Doe"
 *               client_id_card:
 *                 type: string
 *                 description: The identification card number of the client.
 *                 example: "1234567890"
 *               client_email:
 *                 type: string
 *                 description: The email address of the client.
 *                 example: "john.doe@example.com"
 *               client_phone:
 *                 type: string
 *                 description: The phone number of the client.
 *                 example: "+50688887777"
 *               client_address:
 *                 type: string
 *                 description: The physical address of the client.
 *                 example: "123 Main St, San José, Costa Rica"
 *               client_vehicle_plate:
 *                 type: string
 *                 description: The vehicle plate number of the client.
 *                 example: "ABC123"
 *               selectedPackage:
 *                 type: string
 *                 description: The ID of the package the client is subscribing to.
 *                 example: "1"
 *               client_pack_start_date:
 *                 type: string
 *                 format: date
 *                 description: The start date of the package.
 *                 example: "2025-05-01"
 *               client_pack_end_date:
 *                 type: string
 *                 format: date
 *                 description: The end date of the package.
 *                 example: "2025-05-31"
 *     responses:
 *       200:
 *         description: Client and package registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Cliente y paquete registrados correctamente."
 *                 client_slug:
 *                   type: string
 *                   description: The unique slug generated for the client.
 *                   example: "john-doe-123"
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Faltan campos obligatorios."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error interno del servidor."
 */

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
