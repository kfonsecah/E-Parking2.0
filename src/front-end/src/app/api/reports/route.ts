import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
