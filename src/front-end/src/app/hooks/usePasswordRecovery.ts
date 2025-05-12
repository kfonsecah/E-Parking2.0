"use client";

import { useState } from "react";

interface UsePasswordRecovery {
  sendRecoveryEmail: (email: string) => Promise<void>;
  isLoading: boolean;
  modalMessage: string;
  setModalMessage: (message: string) => void;
}

export const usePasswordRecovery = (): UsePasswordRecovery => {
  const [isLoading, setIsLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const sendRecoveryEmail = async (email: string) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/recover-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalMessage(data.error || "Ocurrió un error al enviar el correo.");
        return;
      }

      setModalMessage(
        "Correo enviado con éxito. Revisa tu bandeja de entrada."
      );
    } catch (error) {
      setModalMessage("Ocurrió un error, por favor intenta más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendRecoveryEmail,
    isLoading,
    modalMessage,
    setModalMessage,
  };
};
