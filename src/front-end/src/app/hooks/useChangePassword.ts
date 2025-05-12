import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ChangePasswordResponse {
  message?: string;
  error?: string;
}

export const useChangePassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");

  const changePassword = async (
    generatedPassword: string,
    newPassword: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await fetch(`/api/auth/change-password?email=${email}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ generatedPassword, newPassword }),
      });

      const data: ChangePasswordResponse = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al cambiar la contraseña.");
        return false;
      }

      setSuccess(data.message || "Contraseña cambiada con éxito.");
      return true;
    } catch (err) {
      setError("Ocurrió un error inesperado.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading, error, success, email };
};
