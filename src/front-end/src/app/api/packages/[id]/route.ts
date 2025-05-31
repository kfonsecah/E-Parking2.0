import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/packages/{id}:
 *   patch:
 *     summary: Update Package
 *     description: Updates the name and price of an existing package.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the package to update.
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pack_name:
 *                 type: string
 *                 description: The new name of the package.
 *                 example: "Premium Package"
 *               pack_price:
 *                 type: number
 *                 description: The new price of the package.
 *                 example: 99.99
 *     responses:
 *       200:
 *         description: Package updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pack_id:
 *                   type: integer
 *                   description: The ID of the updated package.
 *                   example: 1
 *                 pack_name:
 *                   type: string
 *                   description: The updated name of the package.
 *                   example: "Premium Package"
 *                 pack_price:
 *                   type: number
 *                   description: The updated price of the package.
 *                   example: 99.99
 *                 pack_version:
 *                   type: integer
 *                   description: The updated version of the package.
 *                   example: 2
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
 *       404:
 *         description: Package not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Paquete no encontrado"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al editar paquete"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while updating the package."
 *
 *   delete:
 *     summary: Delete Package
 *     description: Deletes a package by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the package to delete.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Package deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Paquete eliminado"
 *       404:
 *         description: Package not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Paquete no encontrado"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al eliminar paquete"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while deleting the package."
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const packId = parseInt(id);
  const { pack_name, pack_price } = await req.json();

  if (!pack_name || typeof pack_price !== "number") {
    return NextResponse.json(
      { error: "Nombre y precio son requeridos." },
      { status: 400 }
    );
  }

  try {
    const paquete = await prisma.ep_packages.findUnique({
      where: { pack_id: packId },
    });

    if (!paquete) {
      return NextResponse.json(
        { error: "Paquete no encontrado" },
        { status: 404 }
      );
    }

    const actualizado = await prisma.ep_packages.update({
      where: { pack_id: packId },
      data: {
        pack_name,
        pack_price,
        pack_version: paquete.pack_version + 1,
      },
    });

    return NextResponse.json(actualizado, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al editar paquete", detail: `${error}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const packId = parseInt(id);

  try {
    await prisma.ep_packages.delete({
      where: { pack_id: packId },
    });

    return NextResponse.json({ message: "Paquete eliminado" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error al eliminar paquete",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
