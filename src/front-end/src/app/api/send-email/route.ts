// src/app/api/send-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendMail } from "@/lib/mailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
/**
 * @swagger
 * /api/send-email:
 *   post:
 *     summary: Send Welcome Email
 *     description: Sends a welcome email to a newly registered client with their package details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 description: The email address of the recipient.
 *                 example: "cliente@example.com"
 *               client_name:
 *                 type: string
 *                 description: The name of the client.
 *                 example: "Juan Pérez"
 *               package_name:
 *                 type: string
 *                 description: The name of the package the client subscribed to.
 *                 example: "Premium Package"
 *               package_price:
 *                 type: number
 *                 description: The price of the package.
 *                 example: 99.99
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: The start date of the package.
 *                 example: "2025-05-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: The end date of the package.
 *                 example: "2025-05-31"
 *     responses:
 *       200:
 *         description: Email sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Correo enviado correctamente"
 *       400:
 *         description: Missing required fields.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Faltan campos"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al enviar correo"
 */
export async function POST(req: NextRequest) {
  try {
    const {
      to,
      client_name,
      package_name,
      package_price,
      start_date,
      end_date,
    } = await req.json();

    if (
      !to ||
      !client_name ||
      !package_name ||
      !package_price ||
      !start_date ||
      !end_date
    ) {
      return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

    // ✅ Obtener la información del propietario
    const ownerInfo = await prisma.ep_information.findUnique({
      where: { info_id: 1 },
    });

    if (!ownerInfo || !ownerInfo.info_owner_phone || !ownerInfo.info_schedule) {
      return NextResponse.json(
        { error: "No se pudo obtener la información del propietario" },
        { status: 500 }
      );
    }

    const { info_owner_phone, info_schedule } = ownerInfo;

    // ✅ HTML del correo
    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <img src="https://parkxpress.vercel.app/media/bienvenida.png" alt="ParkXpress" style="width: 100%; border-bottom: 2px solid #004AAD;" />

          <div style="padding: 20px;">
            <h2 style="color: #004AAD; font-size: 24px;">¡Bienvenido/a a ParkXpress, ${client_name}!</h2>
            <p style="color: #555;">Gracias por registrarte. Aquí están los detalles de tu paquete:</p>
            
            <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
              <tr>
                <td style="font-weight: bold; padding: 10px; border-bottom: 1px solid #ddd; color: #333;">Paquete:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555;">${package_name}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding: 10px; border-bottom: 1px solid #ddd; color: #333;">Precio:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555;">${package_price}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding: 10px; border-bottom: 1px solid #ddd; color: #333;">Inicio:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555;">${start_date}</td>
              </tr>
              <tr>
                <td style="font-weight: bold; padding: 10px; border-bottom: 1px solid #ddd; color: #333;">Fin:</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555;">${end_date}</td>
              </tr>
            </table>

            <p style="margin-top: 20px; color: #555;">Si tienes alguna pregunta o deseas obtener más información, no dudes en contactarnos al:</p>
            <p style="font-weight: bold; color: #004AAD; font-size: 18px;">${info_owner_phone}</p>
            <p style="margin-top: 5px; color: #555;">Horario de atención: ${info_schedule}</p>

            <p style="color: #555;">¡Gracias por confiar en ParkXpress!</p>
          </div>

          <div style="background-color: #f1f1f1; padding: 15px; text-align: center; border-top: 1px solid #ddd;">
            <small style="color: #666;">© 2025 ParkXpress. Todos los derechos reservados.</small>
          </div>
        </div>
      </div>
    `;

    // ✅ Enviar el correo
    await sendMail(to, "Bienvenido a ParkXpress 🚗", html);
    return NextResponse.json({
      ok: true,
      message: "Correo enviado correctamente",
    });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    return NextResponse.json(
      { error: "Error al enviar correo" },
      { status: 500 }
    );
  }
}
