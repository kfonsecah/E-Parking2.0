import { PrismaClient } from "@prisma/client";
import { toZonedTime, format } from "date-fns-tz";
import { sendMail } from "./mailer";

const prisma = new PrismaClient();
const timeZone = "America/Costa_Rica";

export async function startCleanupCron() {
  try {
    const now = toZonedTime(new Date(), timeZone);

    const expiredPackages = await prisma.ep_clients_packages.findMany({
      where: {
        client_pack_end_date: { lt: now },
      },
      include: { client: true, package: true },
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
      const formattedDate = format(
        toZonedTime(new Date(pack.client_pack_end_date), timeZone),
        "dd-MM-yyyy",
        { timeZone }
      );

      const message = `...`; // tu HTML de correo aquí

      await sendMail(
        pack.client.client_email,
        "⚠️ Tu paquete ha vencido",
        message
      );

      console.log(`📧 Correo enviado a ${pack.client.client_email}`);
    }

    const deletedReminders = await prisma.ep_reminder_emails.deleteMany({
      where: {
        client_package: {
          client_pack_end_date: { lt: now },
        },
      },
    });

    const deletedPackages = await prisma.ep_clients_packages.deleteMany({
      where: {
        client_pack_end_date: { lt: now },
      },
    });

    console.log(`🗑️ Recordatorios eliminados: ${deletedReminders.count}`);
    console.log(`🗑️ Paquetes expirados eliminados: ${deletedPackages.count}`);
  } catch (error) {
    console.error("❌ Error ejecutando limpieza:", error);
  }
}
