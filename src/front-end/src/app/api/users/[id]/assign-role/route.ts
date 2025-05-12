// /api/users/[id]/assign-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
