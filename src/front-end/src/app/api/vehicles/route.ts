import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
