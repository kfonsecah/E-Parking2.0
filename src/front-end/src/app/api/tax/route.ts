import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/tax:
 *   post:
 *     summary: Create or Update Tax
 *     description: Creates a new tax record or updates the existing tax record with a new price.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tax_price:
 *                 type: number
 *                 description: The price of the tax.
 *                 example: 1500.00
 *     responses:
 *       200:
 *         description: Tax created or updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tax_id:
 *                   type: integer
 *                   description: The ID of the tax record.
 *                   example: 1
 *                 tax_price:
 *                   type: number
 *                   description: The current price of the tax.
 *                   example: 1500.00
 *                 tax_version:
 *                   type: integer
 *                   description: The current version of the tax record.
 *                   example: 2
 *       400:
 *         description: Invalid tax price.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Precio inválido"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error interno del servidor"
 *
 *   get:
 *     summary: Get Current Tax
 *     description: Retrieves the current tax record.
 *     responses:
 *       200:
 *         description: Tax retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tax_id:
 *                   type: integer
 *                   description: The ID of the tax record.
 *                   example: 1
 *                 tax_price:
 *                   type: number
 *                   description: The current price of the tax.
 *                   example: 1500.00
 *                 tax_version:
 *                   type: integer
 *                   description: The current version of the tax record.
 *                   example: 2
 *       404:
 *         description: Tax record not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "No hay registro de impuesto"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al obtener el impuesto"
 */
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
