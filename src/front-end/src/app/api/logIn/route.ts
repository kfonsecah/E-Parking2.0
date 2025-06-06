import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User Login
 *     description: Authenticates a user with a username and password, returning a JWT token in a secure cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               users_username:
 *                 type: string
 *                 description: The username of the user.
 *                 example: "johndoe"
 *               users_password:
 *                 type: string
 *                 description: The password of the user.
 *                 example: "mypassword123"
 *     responses:
 *       200:
 *         description: User successfully authenticated.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users_name:
 *                   type: string
 *                   description: The first name of the authenticated user.
 *                   example: "John"
 *                 users_lastname:
 *                   type: string
 *                   description: The last name of the authenticated user.
 *                   example: "Doe"
 *                 users_username:
 *                   type: string
 *                   description: The username of the authenticated user.
 *                   example: "johndoe"
 *                 users_email:
 *                   type: string
 *                   description: The email address of the authenticated user.
 *                   example: "john.doe@example.com"
 *                 role:
 *                   type: string
 *                   description: The role of the authenticated user.
 *                   example: "Administrator"
 *       400:
 *         description: Missing username or password.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuario y contraseña son requeridos."
 *       401:
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Credenciales incorrectas."
 *       404:
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Usuario no registrado. Comuníquese con el administrador."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Hubo un error en el inicio de sesión."
 *                 detail:
 *                   type: string
 *                   example: "An unexpected error occurred during login."
 */
export async function POST(req: NextRequest) {
  try {
    const {
      users_username,
      users_password,
    }: { users_username: string; users_password: string } = await req.json();

    const usernameInput = users_username?.trim();
    const passwordInput = users_password?.trim();

    if (!usernameInput || !passwordInput) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos." },
        { status: 400 }
      );
    }

    const user = await prisma.ep_users.findFirst({
      where: {
        users_username: {
          equals: usernameInput,
          mode: "insensitive",
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no registrado. Comuníquese con el administrador." },
        { status: 404 }
      );
    }

    let validPassword = await bcrypt.compare(
      passwordInput,
      user.users_password
    );

    // Fallback para usuarios sin hash (modo prueba)
    if (!validPassword && passwordInput === user.users_password) {
      validPassword = true;
    }

    if (!validPassword) {
      return NextResponse.json(
        { error: "Credenciales incorrectas." },
        { status: 401 }
      );
    }

    const role = user.roles?.[0]?.role?.rol_name || "Usuario";
    const sessionId = uuidv4();
    const lastActivity = new Date();

    // 📝 Actualizar la sesión activa (si existe)
    await prisma.ep_users.update({
      where: { users_id: user.users_id },
      data: {
        session_id: sessionId,
        session_last_activity: lastActivity,
      },
    });

    // 🔐 Crear JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new SignJWT({
      id: user.users_id,
      username: user.users_username,
      role,
      sessionId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(secret);

    // 🍪 Enviar cookie segura
    const response = NextResponse.json({
      users_name: user.users_name,
      users_lastname: user.users_lastname,
      users_username: user.users_username,
      users_email: user.users_email,
      role,
    });

    response.cookies.set("app-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    console.log("✅ Login exitoso", {
      userId: user.users_id,
      sessionId,
    });

    return response;
  } catch (error) {
    console.error("❌ Error en login:", error);
    return NextResponse.json(
      {
        error: "Hubo un error en el inicio de sesión.",
        detail: `${(error as Error).message}`,
      },
      { status: 500 }
    );
  }
}
