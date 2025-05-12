import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
