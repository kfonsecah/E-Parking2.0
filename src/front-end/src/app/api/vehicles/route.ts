import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Register New Vehicle
 *     description: Registers a new vehicle in the system with a unique reference and assigns the current tax rate.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               veh_plate:
 *                 type: string
 *                 description: The license plate of the vehicle.
 *                 example: "ABC123"
 *               veh_owner:
 *                 type: string
 *                 description: The owner of the vehicle.
 *                 example: "John Doe"
 *               veh_color:
 *                 type: string
 *                 description: The color of the vehicle (optional).
 *                 example: "Red"
 *     responses:
 *       201:
 *         description: Vehicle registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 veh_id:
 *                   type: integer
 *                   description: The ID of the registered vehicle.
 *                   example: 1
 *                 veh_plate:
 *                   type: string
 *                   description: The license plate of the vehicle.
 *                   example: "ABC123"
 *                 veh_reference:
 *                   type: string
 *                   description: The unique reference of the vehicle.
 *                   example: "REF0001"
 *                 veh_status:
 *                   type: string
 *                   description: The current status of the vehicle.
 *                   example: "P"
 *                 veh_owner:
 *                   type: string
 *                   description: The owner of the vehicle.
 *                   example: "John Doe"
 *                 veh_color:
 *                   type: string
 *                   description: The color of the vehicle.
 *                   example: "Red"
 *                 veh_ingress_date:
 *                   type: string
 *                   format: date-time
 *                   description: The ingress date of the vehicle.
 *                   example: "2025-05-20T14:30:00Z"
 *                 veh_tax:
 *                   type: string
 *                   description: The current tax rate applied to the vehicle.
 *                   example: "500.00"
 *                 veh_version:
 *                   type: integer
 *                   description: The version of the vehicle record.
 *                   example: 1
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "La placa y el propietario son requeridos."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al registrar el vehículo."
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while registering the vehicle."
 *
 *   get:
 *     summary: Get All Parked Vehicles
 *     description: Retrieves a list of all vehicles currently parked in the system.
 *     responses:
 *       200:
 *         description: Vehicles retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   veh_id:
 *                     type: integer
 *                     description: The ID of the vehicle.
 *                     example: 1
 *                   veh_plate:
 *                     type: string
 *                     description: The license plate of the vehicle.
 *                     example: "ABC123"
 *                   veh_owner:
 *                     type: string
 *                     description: The owner of the vehicle.
 *                     example: "John Doe"
 *                   veh_color:
 *                     type: string
 *                     description: The color of the vehicle.
 *                     example: "Red"
 *                   veh_ingress_date:
 *                     type: string
 *                     format: date-time
 *                     description: The ingress date of the vehicle.
 *                     example: "2025-05-20T14:30:00Z"
 *                   veh_reference:
 *                     type: string
 *                     description: The unique reference of the vehicle.
 *                     example: "REF0001"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener los vehículos"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while retrieving the vehicles."
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      veh_plate,
      veh_owner,
      veh_color,
    }: {
      veh_plate: string;
      veh_owner: string;
      veh_color?: string;
    } = body;

    if (!veh_plate || !veh_owner) {
      return NextResponse.json(
        { error: "La placa y el propietario son requeridos." },
        { status: 400 }
      );
    }

    // Generar referencia consecutiva
    const lastVehicle = await prisma.ep_vehicles.findFirst({
      orderBy: { veh_id: "desc" },
    });

    const lastRefNumber = lastVehicle
      ? parseInt(lastVehicle.veh_reference.replace(/\D/g, "")) || 0
      : 0;
    const newReference = `REF${String(lastRefNumber + 1).padStart(4, "0")}`;

    // Obtener impuesto actual
    const taxRecord = await prisma.ep_tax.findFirst({
      orderBy: { tax_id: "desc" },
    });

    if (!taxRecord) {
      return NextResponse.json(
        { error: "No se encontró el registro de impuestos." },
        { status: 500 }
      );
    }

    // Obtener hora local en Costa Rica (UTC-6)
    const nowUTC = new Date();
    const costaRicaOffsetMs = 6 * 60 * 60 * 1000;
    const costaRicaDate = new Date(nowUTC.getTime() - costaRicaOffsetMs);

    // Crear vehículo
    const newVehicle = await prisma.ep_vehicles.create({
      data: {
        veh_plate: veh_plate.toUpperCase(),
        veh_reference: newReference,
        veh_status: "P",
        veh_owner,
        veh_color: veh_color || null,
        veh_ingress_date: costaRicaDate,
        veh_tax: taxRecord.tax_price.toString(),
        veh_version: 1,
      },
    });

    return NextResponse.json(newVehicle, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al registrar el vehículo.", detail: `${error}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const vehicles = await prisma.ep_vehicles.findMany({
      where: {
        veh_status: "P",
      },
      select: {
        veh_id: true,
        veh_plate: true,
        veh_owner: true,
        veh_color: true,
        veh_ingress_date: true,
        veh_reference: true, // <- Aquí
      },
      orderBy: { veh_ingress_date: "desc" },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los vehículos", detail: `${error}` },
      { status: 500 }
    );
  }
}
