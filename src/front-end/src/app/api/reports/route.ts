import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/reports/vehicles:
 *   get:
 *     summary: Get Vehicle Exit Report
 *     description: Retrieves a report of all exited vehicles within a specified date range, including total car count and total ingress.
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         description: The start date of the report period (YYYY-MM-DD).
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-05-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         description: The end date of the report period (YYYY-MM-DD).
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-05-31"
 *     responses:
 *       200:
 *         description: Vehicle exit report generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCountCars:
 *                   type: integer
 *                   description: The total number of cars that exited within the date range.
 *                   example: 150
 *                 totalIngress:
 *                   type: number
 *                   description: The total income generated from vehicle exits within the date range.
 *                   example: 75000.00
 *                 vehicles:
 *                   type: array
 *                   description: A list of vehicles that exited within the date range.
 *                   items:
 *                     type: object
 *                     properties:
 *                       veh_id:
 *                         type: integer
 *                         description: The ID of the vehicle.
 *                         example: 1
 *                       veh_plate:
 *                         type: string
 *                         description: The license plate of the vehicle.
 *                         example: "ABC123"
 *                       veh_tax:
 *                         type: number
 *                         description: The tax amount paid for the vehicle exit.
 *                         example: 500.00
 *                       veh_egress_date:
 *                         type: string
 *                         format: date-time
 *                         description: The date and time when the vehicle exited.
 *                         example: "2025-05-19T15:30:00Z"
 *                       veh_status:
 *                         type: string
 *                         description: The current status of the vehicle.
 *                         example: "E"
 *       400:
 *         description: Missing required date parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Se requiere la fecha de inicio y de final del reporte"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener los datos"
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "Se requiere la fecha de inicio y de final del reporte" },
      { status: 400 }
    );
  }

  try {
    const data = await prisma.ep_vehicles.findMany({
      where: {
        veh_status: "E",
        veh_egress_date: {
          gte: new Date(startDate),
          lte: new Date(endDate + "T23:59:59"),
        },
      },
      orderBy: {
        veh_egress_date: "asc",
      },
    });

    const totalCountCars = data.length;
    const totalIngress = data.reduce(
      (sum, v) => sum + (parseFloat(v.veh_tax) || 0),
      0
    );

    return NextResponse.json({
      totalCountCars,
      totalIngress,
      vehicles: data,
    });
  } catch (error) {
    console.error("Error al obtener los datos:", error);
    return NextResponse.json(
      { error: "Error al obtener los datos" },
      { status: 500 }
    );
  }
}
