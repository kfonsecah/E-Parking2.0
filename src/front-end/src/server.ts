import { startReminderCron } from "./lib/cron";
import { startCleanupCron } from "./lib/cleanup";

// Iniciar el cron job para recordatorios
if (
  typeof global.__cronReminderStarted === "undefined" ||
  !global.__cronReminderStarted
) {
  startReminderCron();
  global.__cronReminderStarted = true;
  console.log("🚀 Cron job de recordatorios inicializado");
}

// Iniciar el cron job para limpiar paquetes expirados
if (
  typeof global.__cronCleanupStarted === "undefined" ||
  !global.__cronCleanupStarted
) {
  startCleanupCron();
  global.__cronCleanupStarted = true;
  console.log("🚀 Cron job de limpieza de paquetes inicializado");
}
