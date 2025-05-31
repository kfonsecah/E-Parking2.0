// src/app/api/vehicles/packages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/vehicles/packages:
 *   post:
 *     summary: Check Active Package for Vehicle
 *     description: Checks if a vehicle has an active package based on its license plate.
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
 *     responses:
 *       200:
 *         description: Active package found for the vehicle.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 client_id:
 *                   type: integer
 *                   description: The ID of the client.
 *                   example: 1
 *                 client_name:
 *                   type: string
 *                   description: The full name of the client.
 *                   example: "John Doe"
 *                 client_plate:
 *                   type: string
 *                   description: The license plate of the vehicle.
 *                   example: "ABC123"
 *                 package_active:
 *                   type: boolean
 *                   description: Indicates if the vehicle has an active package.
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Paquete activo encontrado."
 *       400:
 *         description: Vehicle does not have an active package.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El vehículo no tiene un paquete activo."
 *       404:
 *         description: Vehicle not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Vehículo no encontrado."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error verificando paquete activo."
 *
 *   patch:
 *     summary: Update Vehicle Status for Active Package
 *     description: Updates the status of a vehicle with an active package to "E" (Exit) without charging a fee.
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
 *     responses:
 *       200:
 *         description: Vehicle status updated successfully.
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
 *                   description: The updated status of the vehicle.
 *                   example: "E"
 *                 charge:
 *                   type: number
 *                   description: The amount charged for the exit (zero if active package).
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "🚗 El vehículo ABC123 con paquete activo salió sin costo."
 *       400:
 *         description: Vehicle does not have an active package.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El vehículo no tiene un paquete activo."
 *       404:
 *         description: Vehicle not found or already exited.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Vehículo no encontrado o ya salió."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error actualizando estado del vehículo."
 */
export async function POST(req: NextRequest) {
  try {
    const { veh_plate } = await req.json();

    // Verificar si el cliente existe usando la placa
    const client = await prisma.ep_clients.findFirst({
      where: { client_vehicle_plate: veh_plate },
      include: {
        packages: {
          where: {
            status: "activo",
            client_pack_start_date: { lte: new Date() },
            client_pack_end_date: { gte: new Date() },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Vehículo no encontrado." },
        { status: 404 }
      );
    }

    // Verificar si tiene un paquete activo
    const activePackage = client.packages?.[0];
    if (!activePackage) {
      return NextResponse.json(
        { error: "El vehículo no tiene un paquete activo." },
        { status: 400 }
      );
    }

    // Retornar información del cliente si el paquete está activo
    return NextResponse.json({
      client_id: client.client_id,
      client_name: `${client.client_name} ${client.client_lastname}`,
      client_plate: client.client_vehicle_plate,
      package_active: true,
      message: "Paquete activo encontrado.",
    });
  } catch (error) {
    console.error("❌ Error verificando paquete activo:", error);
    return NextResponse.json(
      { error: "Error verificando paquete activo." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { veh_plate } = await req.json();

    // Verificar si el cliente existe usando la placa
    const client = await prisma.ep_clients.findFirst({
      where: { client_vehicle_plate: veh_plate },
      include: {
        packages: {
          where: {
            status: "activo",
            client_pack_start_date: { lte: new Date() },
            client_pack_end_date: { gte: new Date() },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Vehículo no encontrado." },
        { status: 404 }
      );
    }

    // Verificar si tiene un paquete activo
    const activePackage = client.packages?.[0];
    if (!activePackage) {
      return NextResponse.json(
        { error: "El vehículo no tiene un paquete activo." },
        { status: 400 }
      );
    }

    // Buscar el vehículo relacionado
    const vehicle = await prisma.ep_vehicles.findFirst({
      where: {
        veh_plate: veh_plate,
        veh_status: "P", // Solo actualizar si está en estado "P"
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Vehículo no encontrado o ya salió." },
        { status: 404 }
      );
    }

    // Actualizar el estado del vehículo a "E" (Salida) y agregar fecha de salida
    const updatedVehicle = await prisma.ep_vehicles.update({
      where: { veh_id: vehicle.veh_id },
      data: {
        veh_status: "E",
        veh_egress_date: new Date(),
        veh_tax: "0", // Sin costo por tener paquete activo
      },
    });

    return NextResponse.json({
      veh_id: updatedVehicle.veh_id,
      veh_plate: updatedVehicle.veh_plate,
      veh_status: "E",
      charge: 0,
      message: `🚗 El vehículo ${updatedVehicle.veh_plate} con paquete activo salió sin costo.`,
    });
  } catch (error) {
    console.error("❌ Error actualizando estado del vehículo:", error);
    return NextResponse.json(
      { error: "Error actualizando estado del vehículo." },
      { status: 500 }
    );
  }
}
