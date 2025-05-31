// src/app/api/roles-assigned/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/roles-assigned:
 *   get:
 *     summary: Check Role Assignment
 *     description: Checks if a specific role ID is currently assigned to any user.
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         description: The ID of the role to check for assignment.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Role assignment status retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 assigned:
 *                   type: boolean
 *                   description: Indicates whether the role is currently assigned to a user.
 *                   example: true
 *       400:
 *         description: Missing role ID parameter.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID no proporcionado"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al consultar asignación"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while checking role assignment."
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 });
  }

  const rolId = parseInt(id);

  try {
    const assigned = await prisma.ep_user_roles.findFirst({
      where: { rol_user_rol_id: rolId },
    });

    return NextResponse.json({ assigned: !!assigned });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al consultar asignación", detail: `${error}` },
      { status: 500 }
    );
  }
}
