import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendMail } from "@/lib/mailer";
import { format, toZonedTime } from "date-fns-tz";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/reminders/send:
 *   post:
 *     summary: Send Package Expiration Reminders
 *     description: Sends email reminders to clients with packages that are about to expire within the next 7 days.
 *     responses:
 *       200:
 *         description: Reminders sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Recordatorios enviados correctamente"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al enviar recordatorios"
 */
export async function POST() {
  try {
    // 📅 Configurar la zona horaria para Costa Rica
    const timeZone = "America/Costa_Rica";

    // 🔄 Obtener la fecha actual en la zona horaria correcta
    const today = toZonedTime(new Date(), timeZone);
    const endDateLimit = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 🔍 Buscar paquetes que vencen entre hoy y los próximos 7 días
    const upcomingExpirations = await prisma.ep_clients_packages.findMany({
      where: {
        client_pack_end_date: {
          gte: today,
          lte: endDateLimit,
        },
      },
      include: {
        client: true,
        package: true,
      },
    });

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

    for (const pack of upcomingExpirations) {
      const {
        client_pack_id,
        client,
        package: packDetails,
        client_pack_end_date,
      } = pack;

      // 📅 Verificar si ya se envió un correo hoy para este paquete
      const emailAlreadySent = await prisma.ep_reminder_emails.findFirst({
        where: {
          client_pack_id: client_pack_id,
          email_sent_at: {
            gte: new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
              0,
              0,
              0
            ),
            lt: new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
              23,
              59,
              59
            ),
          },
        },
      });

      if (emailAlreadySent) {
        console.log(
          `🔄 Correo ya enviado para el paquete ${client_pack_id}, saltando...`
        );
        continue;
      }

      // Formatear la fecha de vencimiento
      const formattedDate = format(
        toZonedTime(new Date(client_pack_end_date), timeZone),
        "dd-MM-yyyy",
        { timeZone }
      );

      // Construir el contenido del correo
      const message = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <img src="https://parkxpress.vercel.app/media/bienvenida.png" alt="ParkXpress" style="width: 100%; border-bottom: 2px solid #004AAD;" />

      <div style="padding: 20px;">
        <h2 style="color: #004AAD; font-size: 24px;">Recordatorio de Vencimiento de Paquete</h2>
        <p style="color: #555;">Estimado/a <strong>${client.client_name} ${client.client_lastname}</strong>,</p>
        <p style="color: #555;">Esperamos que estés disfrutando de nuestros servicios en ParkXpress. Queremos recordarte que tu paquete está próximo a vencer.</p>
        <p style="color: #555;">A continuación, te proporcionamos los detalles de tu paquete:</p>
        <p style="color: #555;">Tu paquete <strong>${packDetails.pack_name}</strong> está próximo a vencer el <strong>${formattedDate}</strong>. Te invitamos a renovarlo para seguir disfrutando de nuestros servicios.</p>

        <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
          <tr>
            <td style="font-weight: bold; padding: 10px; border-bottom: 1px solid #ddd; color: #333;">Paquete:</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555;">${packDetails.pack_name}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 10px; border-bottom: 1px solid #ddd; color: #333;">Fecha de Vencimiento:</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555;">${formattedDate}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; padding: 10px; border-bottom: 1px solid #ddd; color: #333;">Estado:</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555;">${pack.status}</td>
          </tr>
        </table>

        <p style="margin-top: 20px; color: #555;">Si tienes alguna pregunta o deseas obtener más información, no dudes en contactarnos al:</p>
        <p style="font-weight: bold; color: #004AAD; font-size: 18px;">${info_owner_phone}</p>
        <p style="margin-top: 5px; color: #555;">Horario de atención: ${info_schedule}</p>

        <p style="color: #555; font-size: 12px; margin-top: 20px;">Este es un correo generado automáticamente. Por favor, no respondas a este mensaje.</p>
      </div>

      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; border-top: 1px solid #ddd;">
        <small style="color: #666;">© 2025 ParkXpress. Todos los derechos reservados.</small>
      </div>
    </div>
  </div>
`;

      // Enviar el correo
      await sendMail(
        client.client_email,
        "🕒 Recordatorio de Vencimiento del Paquete",
        message
      );

      // 📥 Registrar el envío en la tabla de historial
      await prisma.ep_reminder_emails.create({
        data: {
          client_pack_id: client_pack_id,
        },
      });

      console.log(
        `📧 Correo enviado a ${client.client_name} ${client.client_lastname} (${client.client_email}) para el paquete ${packDetails.pack_name}`
      );
    }

    return NextResponse.json({
      message: "Recordatorios enviados correctamente",
    });
  } catch (error) {
    console.error("❌ Error al enviar recordatorios:", error);
    return NextResponse.json(
      { error: "Error al enviar recordatorios" },
      { status: 500 }
    );
  }
}
