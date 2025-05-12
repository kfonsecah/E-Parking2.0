import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "El campo de correo es requerido." },
        { status: 400 }
      );
    }

    // Verificar si el usuario existe usando el campo único `users_email`
    const user = await prisma.ep_users.findUnique({
      where: { users_email: email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No se encontró un usuario con este correo." },
        { status: 404 }
      );
    }

    // Generar contraseña temporal
    const tempPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Actualizar la contraseña temporal en la base de datos
    await prisma.ep_users.update({
      where: { users_email: email },
      data: {
        users_password: hashedPassword,
      },
    });

    // Enlace de recuperación
    const resetUrl = `http://localhost:3000/password/recovery?email=${encodeURIComponent(
      email
    )}`;

    // Formato del mensaje de correo
    const message = `
          <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <img src="https://parkxpress.vercel.app/media/bienvenida.png" alt="ParkXpress" style="width: 100%; border-bottom: 2px solid #004AAD;" />

              <div style="padding: 20px;">
                <h2 style="color: #004AAD; font-size: 24px;">Cambio de Contraseña</h2>
                <p style="color: #555;">Estimado/a <strong>${user.users_name} ${user.users_lastname}</strong>,</p>
                <p style="color: #555;">Hemos generado una contraseña temporal para que puedas restablecer tu acceso:</p>
                
                <div style="background-color: #f4f4f4; padding: 15px; margin: 20px 0; border-radius: 5px;">
                  <strong style="font-size: 18px; color: #004AAD;">${tempPassword}</strong>
                </div>

                <p style="color: #555;">Puedes usar esta contraseña para ingresar a tu cuenta y luego cambiarla en el siguiente enlace:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #004AAD; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">Cambiar Contraseña</a>

                <p style="color: #555; margin-top: 20px;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
              </div>

              <div style="background-color: #f1f1f1; padding: 15px; text-align: center; border-top: 1px solid #ddd;">
                <small style="color: #666;">© 2025 ParkXpress. Todos los derechos reservados.</small>
              </div>
            </div>
          </div>
        `;

    // Enviar el correo
    // Enviar el correo
    await sendMail(email, "Cambio de Contraseña - ParkXpress", message);

    return NextResponse.json({ message: "Correo enviado con éxito." });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Ocurrió un error al enviar el correo." },
      { status: 500 }
    );
  }
}
