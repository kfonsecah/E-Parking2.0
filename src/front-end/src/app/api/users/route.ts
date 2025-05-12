import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();

  if ("users_id" in body) {
    return NextResponse.json(
      { error: "El campo 'users_id' no debe ser enviado. Es autogenerado." },
      { status: 400 }
    );
  }

  const {
    users_name,
    users_lastname,
    users_id_card,
    users_version,
    users_username,
    users_password,
    users_email,
  } = body;

  if (
    !users_name ||
    !users_lastname ||
    !users_id_card ||
    !users_version ||
    !users_username ||
    !users_password ||
    !users_email
  ) {
    return NextResponse.json(
      { error: "Todos los campos son requeridos, incluyendo la contraseña" },
      { status: 400 }
    );
  }

  const existingUser = await prisma.ep_users.findFirst({
    where: {
      OR: [{ users_email }, { users_username }, { users_id_card }],
    },
  });

  if (existingUser) {
    return NextResponse.json(
      {
        error:
          "El usuario ya está registrado con ese correo, cédula o nombre de usuario.",
      },
      { status: 409 }
    );
  }

  try {
    const hashedPassword = await bcrypt.hash(users_password, 10);

    const user = await prisma.ep_users.create({
      data: {
        users_name,
        users_lastname,
        users_id_card,
        users_version,
        users_username,
        users_password: hashedPassword, // 🔐 guardar contraseña encriptada
        users_email,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al crear el usuario", detail: `${error}` },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const users = await prisma.ep_users.findMany({
      select: {
        users_id: true,
        users_name: true,
        users_lastname: true,
        users_email: true,
        users_id_card: true,
        users_username: true,
        users_password: true,
        users_version: true,
        roles: {
          include: {
            role: {
              select: {
                rol_id: true,
                rol_name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching users", detail: `${error}` },
      { status: 500 }
    );
  }
}
