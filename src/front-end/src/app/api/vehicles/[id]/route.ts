import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
