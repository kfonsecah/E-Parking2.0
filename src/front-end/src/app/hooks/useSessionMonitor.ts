"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const useSessionMonitor = () => {
  const [sessionExpired, setSessionExpired] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const hasAppSession = document.cookie.includes("app-session");

      // ⏳ Espera inicial si no se ha establecido la cookie aún
      if (!hasAppSession && !initialized) {
        console.warn("⏳ Esperando cookie de sesión...");
        return;
      }

      try {
        const res = await fetch("/api/session/validate", {
          credentials: "include",
        });

        if (res.status === 401) {
          console.warn("⚠️ Sesión inválida o expirada");
          setSessionExpired(true);
        } else {
          setInitialized(true);
        }
      } catch (err) {
        console.error("❌ Error verificando sesión:", err);
      }
    };

    const delay = setTimeout(checkSession, 1500); // 🕒 Delay inicial tras login
    const interval = setInterval(checkSession, 60 * 1000); // 🔁 Cada minuto

    return () => {
      clearTimeout(delay);
      clearInterval(interval);
    };
  }, [initialized]); // Dependencia mínima y segura

  const handleCloseModal = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      document.cookie = "app-session=; Max-Age=0; path=/"; // 🧽 Borra cookie
    } catch (err) {
      console.error("❌ Error cerrando sesión:", err);
    } finally {
      setSessionExpired(false);
      router.push("/auth");
    }
  };

  return {
    sessionExpired,
    handleCloseModal,
  };
};
