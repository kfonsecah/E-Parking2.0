import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get Vehicle by ID
 *     description: Retrieves a vehicle by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the vehicle to retrieve.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Vehicle retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 veh_id:
 *                   type: integer
 *                   description: The ID of the vehicle.
 *                   example: 1
 *                 veh_plate:
 *                   type: string
 *                   description: The license plate of the vehicle.
 *                   example: "ABC123"
 *                 veh_status:
 *                   type: string
 *                   description: The current status of the vehicle.
 *                   example: "E"
 *                 veh_egress_date:
 *                   type: string
 *                   format: date-time
 *                   description: The exit date of the vehicle.
 *                   example: "2025-05-20T14:30:00Z"
 *                 veh_tax:
 *                   type: number
 *                   description: The tax paid by the vehicle.
 *                   example: 500.00
 *                 veh_version:
 *                   type: integer
 *                   description: The version of the vehicle record.
 *                   example: 2
 *       400:
 *         description: Invalid vehicle ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID inválido."
 *       404:
 *         description: Vehicle not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El vehículo no existe."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener el vehículo"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while retrieving the vehicle."
 *
 *   delete:
 *     summary: Delete Vehicle
 *     description: Deletes a vehicle by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the vehicle to delete.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Vehicle deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vehículo eliminado exitosamente."
 *       400:
 *         description: Invalid vehicle ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID inválido."
 *       404:
 *         description: Vehicle not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El vehículo no existe."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al eliminar el vehículo"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while deleting the vehicle."
 *
 *   post:
 *     summary: Update Vehicle Exit Data
 *     description: Updates the exit data of a vehicle, including exit date and tax.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the vehicle to update.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               veh_exit_date:
 *                 type: string
 *                 format: date-time
 *                 description: The exit date of the vehicle.
 *                 example: "2025-05-20T14:30:00Z"
 *               veh_tax:
 *                 type: number
 *                 description: The tax paid by the vehicle.
 *                 example: 500.00
 *     responses:
 *       200:
 *         description: Vehicle exit data updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Vehículo actualizado exitosamente."
 *                 vehicle:
 *                   type: object
 *                   properties:
 *                     veh_id:
 *                       type: integer
 *                       description: The ID of the updated vehicle.
 *                       example: 1
 *                     veh_status:
 *                       type: string
 *                       description: The updated status of the vehicle.
 *                       example: "E"
 *                     veh_egress_date:
 *                       type: string
 *                       format: date-time
 *                       description: The updated exit date of the vehicle.
 *                       example: "2025-05-20T14:30:00Z"
 *                     veh_tax:
 *                       type: number
 *                       description: The updated tax of the vehicle.
 *                       example: 500.00
 *                     veh_version:
 *                       type: integer
 *                       description: The updated version of the vehicle.
 *                       example: 2
 *       400:
 *         description: Invalid vehicle ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID inválido."
 *       404:
 *         description: Vehicle not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El vehículo no existe."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al actualizar el vehículo"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while updating the vehicle."
 */
// ✅ GET: Obtener vehículo por ID
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const vehicleId = parseInt(id);

  if (isNaN(vehicleId)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const vehicle = await prisma.ep_vehicles.findUnique({
      where: { veh_id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "El vehículo no existe." },
        { status: 404 }
      );
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener el vehículo", detail: `${error}` },
      { status: 500 }
    );
  }
}

// ✅ DELETE: Eliminar vehículo
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const vehicleId = parseInt(id);

  if (isNaN(vehicleId)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    const vehicle = await prisma.ep_vehicles.findUnique({
      where: { veh_id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "El vehículo no existe." },
        { status: 404 }
      );
    }

    await prisma.ep_vehicles.delete({
      where: { veh_id: vehicleId },
    });

    return NextResponse.json({ message: "Vehículo eliminado exitosamente." });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar el vehículo", detail: `${error}` },
      { status: 500 }
    );
  }
}

// ✅ POST: Actualizar datos de salida del vehículo
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const vehicleId = parseInt(id);

  if (isNaN(vehicleId)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const body = await req.json();

  try {
    const vehicle = await prisma.ep_vehicles.findUnique({
      where: { veh_id: vehicleId },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "El vehículo no existe." },
        { status: 404 }
      );
    }

    const updatedVehicle = await prisma.ep_vehicles.update({
      where: { veh_id: vehicleId },
      data: {
        veh_egress_date: new Date(body.veh_exit_date),
        veh_status: "E",
        veh_tax: body.veh_tax,
        veh_version: vehicle.veh_version + 1,
      },
    });

    return NextResponse.json({
      message: "Vehículo actualizado exitosamente.",
      vehicle: updatedVehicle,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar el vehículo", detail: `${error}` },
      { status: 500 }
    );
  }
}
