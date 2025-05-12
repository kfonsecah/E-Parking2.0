import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
