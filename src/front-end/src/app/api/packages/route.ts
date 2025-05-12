// /api/packages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ✅ Create a new package
export async function POST(req: NextRequest) {
  const { packageName, packagePrice } = await req.json();

  // Validate input
  if (!packageName || typeof packagePrice !== "number") {
    return NextResponse.json(
      { error: "Nombre y precio son requeridos." },
      { status: 400 }
    );
  }

  try {
    // Insert new package into the database
    const newPackage = await prisma.ep_packages.create({
      data: {
        pack_name: packageName,
        pack_price: packagePrice,
        pack_version: 1,
      },
    });
    return NextResponse.json(newPackage, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear paquete", detail: `${error}` },
      { status: 500 }
    );
  }
}

// ✅ Get all packages
export async function GET() {
  try {
    const packages = await prisma.ep_packages.findMany();
    return NextResponse.json(packages, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener paquetes", detail: `${error}` },
      { status: 500 }
    );
  }
}
