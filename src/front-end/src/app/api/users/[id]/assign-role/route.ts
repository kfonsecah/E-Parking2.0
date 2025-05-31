// /api/users/[id]/assign-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/users/{id}/assign-role:
 *   patch:
 *     summary: Assign Role to User
 *     description: Assigns a specific role to a user by their ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to assign the role to.
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
 *               rol_id:
 *                 type: integer
 *                 description: The ID of the role to assign.
 *                 example: 2
 *     responses:
 *       201:
 *         description: Role assigned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rol asignado correctamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     rol_user_users_id:
 *                       type: integer
 *                       description: The ID of the user to whom the role was assigned.
 *                       example: 1
 *                     rol_user_rol_id:
 *                       type: integer
 *                       description: The ID of the assigned role.
 *                       example: 2
 *       200:
 *         description: Role already assigned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El usuario ya tiene asignado ese rol"
 *       400:
 *         description: Invalid role ID or user ID.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Debe enviar un rol_id válido y un userId numérico"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al asignar rol"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while assigning the role."
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = parseInt(id);
  const { rol_id } = await req.json();

  if (!rol_id || isNaN(userId)) {
    return NextResponse.json(
      { error: "Debe enviar un rol_id válido y un userId numérico" },
      { status: 400 }
    );
  }

  try {
    const exists = await prisma.ep_user_roles.findUnique({
      where: {
        rol_user_users_id_rol_user_rol_id: {
          rol_user_users_id: userId,
          rol_user_rol_id: rol_id,
        },
      },
    });

    if (exists) {
      return NextResponse.json(
        { message: "El usuario ya tiene asignado ese rol" },
        { status: 200 }
      );
    }

    const assigned = await prisma.ep_user_roles.create({
      data: {
        rol_user_users_id: userId,
        rol_user_rol_id: rol_id,
      },
    });

    return NextResponse.json(
      { message: "Rol asignado correctamente", data: assigned },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Error al asignar rol", detail: `${error}` },
      { status: 500 }
    );
  }
}
