import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/information:
 *   get:
 *     summary: Get Parking Information
 *     description: Retrieves the parking information including name, location, number of spaces, version, owner details, and image.
 *     responses:
 *       200:
 *         description: Parking information retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 info_id:
 *                   type: integer
 *                   description: The unique identifier for the parking information.
 *                   example: 1
 *                 info_name:
 *                   type: string
 *                   description: The name of the parking facility.
 *                   example: "Main Street Parking"
 *                 info_location:
 *                   type: string
 *                   description: The location of the parking facility.
 *                   example: "123 Main St, San José, Costa Rica"
 *                 info_spaces:
 *                   type: integer
 *                   description: The total number of parking spaces.
 *                   example: 100
 *                 info_version:
 *                   type: integer
 *                   description: The version of the parking information.
 *                   example: 1
 *                 info_owner:
 *                   type: string
 *                   description: The name of the parking owner.
 *                   example: "Juan Pérez"
 *                 info_owner_id_card:
 *                   type: string
 *                   description: The ID card number of the parking owner.
 *                   example: "1234567890"
 *                 info_owner_phone:
 *                   type: string
 *                   description: The phone number of the parking owner.
 *                   example: "+50688887777"
 *                 info_schedule:
 *                   type: string
 *                   description: The schedule of the parking facility.
 *                   example: "24/7"
 *                 imageBase64:
 *                   type: string
 *                   description: The base64 encoded image of the parking facility.
 *                   example: "iVBORw0KGgoAAAANSUhEUgAA..."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener información"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while retrieving the parking information."
 *
 *   post:
 *     summary: Create or Update Parking Information
 *     description: Creates a new parking information record or updates the existing one if it already exists.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               info_name:
 *                 type: string
 *                 description: The name of the parking facility.
 *                 example: "Main Street Parking"
 *               info_location:
 *                 type: string
 *                 description: The location of the parking facility.
 *                 example: "123 Main St, San José, Costa Rica"
 *               info_spaces:
 *                 type: integer
 *                 description: The total number of parking spaces.
 *                 example: 100
 *               info_version:
 *                 type: integer
 *                 description: The version of the parking information.
 *                 example: 1
 *               imageBase64:
 *                 type: string
 *                 description: The base64 encoded image of the parking facility.
 *                 example: "iVBORw0KGgoAAAANSUhEUgAA..."
 *               info_owner:
 *                 type: string
 *                 description: The name of the parking owner.
 *                 example: "Juan Pérez"
 *               info_owner_id_card:
 *                 type: string
 *                 description: The ID card number of the parking owner.
 *                 example: "1234567890"
 *               info_owner_phone:
 *                 type: string
 *                 description: The phone number of the parking owner.
 *                 example: "+50688887777"
 *               info_schedule:
 *                 type: string
 *                 description: The schedule of the parking facility.
 *                 example: "24/7"
 *     responses:
 *       200:
 *         description: Parking information updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 info_id:
 *                   type: integer
 *                   example: 1
 *                 info_name:
 *                   type: string
 *                   example: "Main Street Parking"
 *                 info_location:
 *                   type: string
 *                   example: "123 Main St, San José, Costa Rica"
 *                 info_spaces:
 *                   type: integer
 *                   example: 100
 *                 info_version:
 *                   type: integer
 *                   example: 2
 *                 info_owner:
 *                   type: string
 *                   example: "Juan Pérez"
 *                 info_owner_id_card:
 *                   type: string
 *                   example: "1234567890"
 *                 info_owner_phone:
 *                   type: string
 *                   example: "+50688887777"
 *                 info_schedule:
 *                   type: string
 *                   example: "24/7"
 *       201:
 *         description: Parking information created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 info_id:
 *                   type: integer
 *                   example: 1
 *                 info_name:
 *                   type: string
 *                   example: "Main Street Parking"
 *                 info_location:
 *                   type: string
 *                   example: "123 Main St, San José, Costa Rica"
 *                 info_spaces:
 *                   type: integer
 *                   example: 100
 *                 info_version:
 *                   type: integer
 *                   example: 1
 *                 info_owner:
 *                   type: string
 *                   example: "Juan Pérez"
 *                 info_owner_id_card:
 *                   type: string
 *                   example: "1234567890"
 *                 info_owner_phone:
 *                   type: string
 *                   example: "+50688887777"
 *                 info_schedule:
 *                   type: string
 *                   example: "24/7"
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Todos los campos son requeridos"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al guardar"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while saving the parking information."
 */
// Obtener información
export async function GET() {
  try {
    const info = await prisma.ep_information.findUnique({
      where: { info_id: 1 },
    });

    if (!info) {
      return NextResponse.json(null, { status: 200 });
    }

    const base64Image = info.info_image
      ? Buffer.from(info.info_image).toString("base64")
      : null;

    return NextResponse.json({ ...info, imageBase64: base64Image });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener información", detail: `${error}` },
      { status: 500 }
    );
  }
}

// Crear o actualizar información
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    info_name,
    info_location,
    info_spaces,
    info_version,
    imageBase64,
    info_owner,
    info_owner_id_card,
    info_owner_phone,
    info_schedule,
  } = body;

  // Validación de campos
  if (
    !info_name ||
    !info_location ||
    !info_spaces ||
    !info_version ||
    !imageBase64 ||
    !info_owner ||
    !info_owner_id_card ||
    !info_owner_phone ||
    !info_schedule
  ) {
    return NextResponse.json(
      { error: "Todos los campos son requeridos" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(imageBase64, "base64");

  try {
    const existing = await prisma.ep_information.findUnique({
      where: { info_id: 1 },
    });

    if (existing) {
      const updated = await prisma.ep_information.update({
        where: { info_id: 1 },
        data: {
          info_name,
          info_location,
          info_spaces: parseInt(info_spaces),
          info_version: existing.info_version + 1,
          info_image: buffer,
          info_owner,
          info_owner_id_card,
          info_owner_phone,
          info_schedule,
        },
      });
      return NextResponse.json(updated, { status: 200 });
    } else {
      const created = await prisma.ep_information.create({
        data: {
          info_id: 1,
          info_name,
          info_location,
          info_spaces: parseInt(info_spaces),
          info_version: 1,
          info_image: buffer,
          info_owner,
          info_owner_id_card,
          info_owner_phone,
          info_schedule,
        },
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Error al guardar", detail: `${error}` },
      { status: 500 }
    );
  }
}
