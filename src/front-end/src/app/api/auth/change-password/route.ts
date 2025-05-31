import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * @swagger
 * /users/password/reset:
 *   post:
 *     summary: Reset user password
 *     description: Allows a user to reset their password using a generated password and a new password.
 *     parameters:
 *       - name: email
 *         in: query
 *         required: true
 *         description: The email of the user.
 *         schema:
 *           type: string
 *           format: email
 *           example: "john@example.com"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               generatedPassword:
 *                 type: string
 *                 description: The generated password previously provided to the user.
 *                 example: "temporary123"
 *               newPassword:
 *                 type: string
 *                 description: The new password for the user.
 *                 example: "MyNewSecurePassword123!"
 *     responses:
 *       200:
 *         description: Password successfully changed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password successfully changed."
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "All fields are required."
 *       403:
 *         description: Incorrect generated password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "The generated password is not correct."
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User not found."
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while changing the password."
 */
export async function POST(req: NextRequest) {
  try {
    const { generatedPassword, newPassword } = await req.json();
    const email = req.nextUrl.searchParams.get("email");

    // Validación de campos
    if (!email || !generatedPassword || !newPassword) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos." },
        { status: 400 }
      );
    }

    // Buscar usuario
    const user = await prisma.ep_users.findUnique({
      where: { users_email: email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    // Verificar contraseña generada
    const isPasswordValid = await bcrypt.compare(
      generatedPassword,
      user.users_password
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "La contraseña generada no es correcta." },
        { status: 403 }
      );
    }

    // Actualizar con la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.ep_users.update({
      where: { users_email: email },
      data: {
        users_password: hashedNewPassword,
      },
    });

    return NextResponse.json({ message: "Contraseña cambiada con éxito." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Ocurrió un error al cambiar la contraseña." },
      { status: 500 }
    );
  }
}
