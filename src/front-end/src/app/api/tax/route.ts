import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tax_price } = body;

    if (typeof tax_price !== "number" || tax_price < 0) {
      return NextResponse.json({ error: "Precio inválido" }, { status: 400 });
    }

    const existingTax = await prisma.ep_tax.findUnique({
      where: { tax_id: 1 },
    });

    let result;

    if (existingTax) {
      // Si existe, se actualiza y tax_version incrementa
      result = await prisma.ep_tax.update({
        where: { tax_id: 1 },
        data: {
          tax_price,
          tax_version: existingTax.tax_version + 1,
        },
      });
    } else {
      // Si no existe, se crea con tax_version en 1
      result = await prisma.ep_tax.create({
        data: {
          tax_id: 1,
          tax_price,
          tax_version: 1,
        },
      });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const tax = await prisma.ep_tax.findUnique({
      where: { tax_id: 1 },
    });

    if (!tax) {
      return NextResponse.json(
        { error: "No hay registro de impuesto" },
        { status: 404 }
      );
    }

    return NextResponse.json(tax);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al obtener el impuesto" },
      { status: 500 }
    );
  }
}
