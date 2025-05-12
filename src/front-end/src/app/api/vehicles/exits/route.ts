import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
