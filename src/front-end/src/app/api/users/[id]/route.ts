import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
