import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
/**
 * @swagger
 * /api/users/{id}:
 *   patch:
 *     summary: Update User
 *     description: Updates user details, including the password if provided.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to update.
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
 *               users_name:
 *                 type: string
 *                 description: The updated first name of the user.
 *                 example: "John"
 *               users_lastname:
 *                 type: string
 *                 description: The updated last name of the user.
 *                 example: "Doe"
 *               users_id_card:
 *                 type: string
 *                 description: The updated ID card of the user.
 *                 example: "1234567890"
 *               users_email:
 *                 type: string
 *                 description: The updated email address of the user.
 *                 example: "john.doe@example.com"
 *               users_username:
 *                 type: string
 *                 description: The updated username of the user.
 *                 example: "johndoe"
 *               users_password:
 *                 type: string
 *                 description: The updated password of the user.
 *                 example: "newpassword123"
 *               users_version:
 *                 type: integer
 *                 description: The updated version number of the user.
 *                 example: 2
 *     responses:
 *       200:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users_id:
 *                   type: integer
 *                   description: The ID of the updated user.
 *                   example: 1
 *                 users_name:
 *                   type: string
 *                   description: The updated first name of the user.
 *                   example: "John"
 *                 users_lastname:
 *                   type: string
 *                   description: The updated last name of the user.
 *                   example: "Doe"
 *                 users_id_card:
 *                   type: string
 *                   description: The updated ID card of the user.
 *                   example: "1234567890"
 *                 users_email:
 *                   type: string
 *                   description: The updated email address of the user.
 *                   example: "john.doe@example.com"
 *                 users_username:
 *                   type: string
 *                   description: The updated username of the user.
 *                   example: "johndoe"
 *                 users_version:
 *                   type: integer
 *                   description: The updated version number of the user.
 *                   example: 2
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al actualizar el usuario"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while updating the user."
 *
 *   delete:
 *     summary: Delete User
 *     description: Deletes a user and their associated roles.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to delete.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: User and roles deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario y roles eliminados correctamente."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al eliminar el usuario"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while deleting the user."
 */
// ✅ PATCH con params como promesa
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = parseInt(id);
  const body = await req.json();

  try {
    // Buscar usuario actual
    const existingUser = await prisma.ep_users.findUnique({
      where: { users_id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar si se debe actualizar la contraseña
    let updatedPassword = existingUser.users_password;
    if (
      body.user_password &&
      body.user_password.trim() !== "" &&
      !(await bcrypt.compare(body.users_password, existingUser.users_password))
    ) {
      const salt = await bcrypt.genSalt(10);
      updatedPassword = await bcrypt.hash(body.users_password, salt);
    }

    const updatedUser = await prisma.ep_users.update({
      where: { users_id: userId },
      data: {
        users_name: body.users_name,
        users_lastname: body.users_lastname,
        users_id_card: body.users_id_card,
        users_email: body.users_email,
        users_username: body.users_username,
        users_password: updatedPassword,
        users_version: body.users_version ?? 1,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar el usuario", detail: String(error) },
      { status: 500 }
    );
  }
}

// ✅ DELETE con params como promesa
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const userId = parseInt(id);

  try {
    await prisma.ep_user_roles.deleteMany({
      where: { rol_user_users_id: userId },
    });

    await prisma.ep_users.delete({
      where: { users_id: userId },
    });

    return NextResponse.json({
      message: "Usuario y roles eliminados correctamente.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar el usuario", detail: String(error) },
      { status: 500 }
    );
  }
}
