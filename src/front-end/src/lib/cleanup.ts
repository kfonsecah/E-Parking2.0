import nodeCron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { toZonedTime, format } from "date-fns-tz";
import { sendMail } from "./mailer";

const prisma = new PrismaClient();
const timeZone = "America/Costa_Rica";

// Configurar el cron job para que se ejecute cada minuto entre 10 PM y 11:59 PM
export function startCleanupCron() {
  nodeCron.schedule("*/1 22-23 * * *", async () => {
    try {
      const now = toZonedTime(new Date(), timeZone);

      // 🔄 Buscar paquetes que han expirado para enviar correos
      const expiredPackages = await prisma.ep_clients_packages.findMany({
        where: {
          client_pack_end_date: {
            lt: now,
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

      if (
        !ownerInfo ||
        !ownerInfo.info_owner_phone ||
        !ownerInfo.info_schedule
      ) {
        console.error("❌ No se pudo obtener la información del propietario");
        return;
      }

      const { info_owner_phone, info_schedule } = ownerInfo;

      for (const pack of expiredPackages) {
        const { client, package: packDetails, client_pack_end_date } = pack;

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
                <h2 style="color: #004AAD; font-size: 24px;">Paquete Vencido</h2>
                <p style="color: #555;">Estimado/a <strong>${client.client_name} ${client.client_lastname}</strong>,</p>
                <p style="color: #555;">Tu paquete <strong>${packDetails.pack_name}</strong> ha vencido el <strong>${formattedDate}</strong>.</p>
                <p style="color: #555;">Te invitamos a comunicarte con nosotros para renovarlo o cambiar de paquete para seguir disfrutando de nuestros servicios.</p>

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
          "⚠️ Tu paquete ha vencido",
          message
        );

        console.log(
          `📧 Correo de paquete vencido enviado a ${client.client_name} ${client.client_lastname} (${client.client_email}) para el paquete ${packDetails.pack_name}`
        );
      }

      // 🔄 Eliminar los recordatorios de paquetes expirados primero
      const deletedReminders = await prisma.ep_reminder_emails.deleteMany({
        where: {
          client_package: {
            client_pack_end_date: {
              lt: now,
            },
          },
        },
      });

      console.log(`🗑️ Recordatorios eliminados: ${deletedReminders.count}`);

      // 🔄 Eliminar todos los paquetes que ya han expirado
      const deletedPackages = await prisma.ep_clients_packages.deleteMany({
        where: {
          client_pack_end_date: {
            lt: now,
          },
        },
      });

      console.log(`🗑️ Paquetes expirados eliminados: ${deletedPackages.count}`);
    } catch (error) {
      console.error("❌ Error eliminando paquetes expirados:", error);
    }
  });

  console.log(
    "🚀 Cron job para limpiar paquetes expirados configurado para las 10 PM"
  );
}
