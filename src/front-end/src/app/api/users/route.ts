import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create User
 *     description: Creates a new user with encrypted password and associated role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               users_name:
 *                 type: string
 *                 description: The first name of the user.
 *                 example: "John"
 *               users_lastname:
 *                 type: string
 *                 description: The last name of the user.
 *                 example: "Doe"
 *               users_id_card:
 *                 type: string
 *                 description: The ID card number of the user.
 *                 example: "1234567890"
 *               users_version:
 *                 type: integer
 *                 description: The version number of the user.
 *                 example: 1
 *               users_username:
 *                 type: string
 *                 description: The username of the user.
 *                 example: "johndoe"
 *               users_password:
 *                 type: string
 *                 description: The password of the user.
 *                 example: "mypassword123"
 *               users_email:
 *                 type: string
 *                 description: The email address of the user.
 *                 example: "john.doe@example.com"
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users_id:
 *                   type: integer
 *                   description: The ID of the created user.
 *                   example: 1
 *                 users_name:
 *                   type: string
 *                   description: The first name of the user.
 *                   example: "John"
 *                 users_lastname:
 *                   type: string
 *                   description: The last name of the user.
 *                   example: "Doe"
 *                 users_id_card:
 *                   type: string
 *                   description: The ID card number of the user.
 *                   example: "1234567890"
 *                 users_email:
 *                   type: string
 *                   description: The email address of the user.
 *                   example: "john.doe@example.com"
 *                 users_username:
 *                   type: string
 *                   description: The username of the user.
 *                   example: "johndoe"
 *                 users_version:
 *                   type: integer
 *                   description: The version number of the user.
 *                   example: 1
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Todos los campos son requeridos, incluyendo la contraseña"
 *       409:
 *         description: User already exists.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "El usuario ya está registrado con ese correo, cédula o nombre de usuario."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al crear el usuario"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while creating the user."
 *
 *   get:
 *     summary: Get All Users
 *     description: Retrieves a list of all registered users along with their assigned roles.
 *     responses:
 *       200:
 *         description: Users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   users_id:
 *                     type: integer
 *                     description: The ID of the user.
 *                     example: 1
 *                   users_name:
 *                     type: string
 *                     description: The first name of the user.
 *                     example: "John"
 *                   users_lastname:
 *                     type: string
 *                     description: The last name of the user.
 *                     example: "Doe"
 *                   users_email:
 *                     type: string
 *                     description: The email address of the user.
 *                     example: "john.doe@example.com"
 *                   users_id_card:
 *                     type: string
 *                     description: The ID card number of the user.
 *                     example: "1234567890"
 *                   users_username:
 *                     type: string
 *                     description: The username of the user.
 *                     example: "johndoe"
 *                   users_version:
 *                     type: integer
 *                     description: The version number of the user.
 *                     example: 1
 *                   roles:
 *                     type: array
 *                     description: The list of roles assigned to the user.
 *                     items:
 *                       type: object
 *                       properties:
 *                         rol_id:
 *                           type: integer
 *                           description: The ID of the role.
 *                           example: 1
 *                         rol_name:
 *                           type: string
 *                           description: The name of the role.
 *                           example: "Administrator"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error fetching users"
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred while fetching the users."
 */
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
