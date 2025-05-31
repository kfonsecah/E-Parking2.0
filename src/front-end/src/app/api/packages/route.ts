// /api/packages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/packages:
 *   post:
 *     summary: Create Package
 *     description: Creates a new package with a name and price.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packageName:
 *                 type: string
 *                 description: The name of the package.
 *                 example: "Basic Package"
 *               packagePrice:
 *                 type: number
 *                 description: The price of the package.
 *                 example: 49.99
 *     responses:
 *       201:
 *         description: Package created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pack_id:
 *                   type: integer
 *                   description: The ID of the created package.
 *                   example: 1
 *                 pack_name:
 *                   type: string
 *                   description: The name of the package.
 *                   example: "Basic Package"
 *                 pack_price:
 *                   type: number
 *                   description: The price of the package.
 *                   example: 49.99
 *                 pack_version:
 *                   type: integer
 *                   description: The version of the package.
 *                   example: 1
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Nombre y precio son requeridos."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al crear paquete"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while creating the package."
 *
 *   get:
 *     summary: Get All Packages
 *     description: Retrieves a list of all available packages.
 *     responses:
 *       200:
 *         description: Packages retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   pack_id:
 *                     type: integer
 *                     description: The ID of the package.
 *                     example: 1
 *                   pack_name:
 *                     type: string
 *                     description: The name of the package.
 *                     example: "Basic Package"
 *                   pack_price:
 *                     type: number
 *                     description: The price of the package.
 *                     example: 49.99
 *                   pack_version:
 *                     type: integer
 *                     description: The version of the package.
 *                     example: 1
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener paquetes"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while retrieving the packages."
 */
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
