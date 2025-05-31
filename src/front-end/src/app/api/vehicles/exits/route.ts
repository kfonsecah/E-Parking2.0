import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/vehicles/exited-today:
 *   get:
 *     summary: Get Exited Vehicles Today
 *     description: Retrieves a list of all vehicles that exited today.
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
 *                   veh_egress_date:
 *                     type: string
 *                     format: date-time
 *                     description: The date and time when the vehicle exited.
 *                     example: "2025-05-20T14:30:00Z"
 *                   veh_reference:
 *                     type: string
 *                     description: An optional reference for the vehicle.
 *                     example: "Parking Lot A - Spot 15"
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
export async function GET() {
  try {
    const nowUTC = new Date();
    const nowCR = new Date(nowUTC.getTime() - 6 * 60 * 60 * 1000);
    const todayCR = nowCR.toISOString().split("T")[0];

    const vehicles = await prisma.ep_vehicles.findMany({
      where: {
        veh_status: "E",
        veh_egress_date: {
          gte: new Date(`${todayCR}T00:00:00.000Z`),
          lte: new Date(`${todayCR}T23:59:59.999Z`),
        },
      },
      select: {
        veh_id: true,
        veh_plate: true,
        veh_owner: true,
        veh_color: true,
        veh_egress_date: true,
        veh_reference: true, // <- Aquí
      },
      orderBy: { veh_egress_date: "desc" },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener los vehículos", detail: `${error}` },
      { status: 500 }
    );
  }
}
