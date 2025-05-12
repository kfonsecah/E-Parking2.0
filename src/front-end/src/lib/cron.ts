import nodeCron from "node-cron";
import fetch from "node-fetch";

export function startReminderCron() {
  const endpoint =
    process.env.NOTIFICATION_ENDPOINT ||
    "http://localhost:3000/api/notifications/reminder";

  // Cambiar el schedule para cada 1 minuto
  const schedule = "*/1 * * * *";

  nodeCron.schedule(schedule, async () => {
    console.log("🔔 Iniciando recordatorio de vencimiento de paquetes...");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Error en el envío de recordatorios:", errorData);
        return;
      }

      console.log("✅ Recordatorios enviados correctamente.");
    } catch (error) {
      console.error(
        "❌ Error en la solicitud al endpoint de recordatorios:",
        error
      );
    }
  });

  console.log(
    `🚀 Cron job configurado para ejecutarse cada 5 minutos: ${schedule}`
  );
}
