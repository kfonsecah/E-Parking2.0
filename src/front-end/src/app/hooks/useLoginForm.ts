import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { signIn } from "next-auth/react";
import { useMutation } from "@tanstack/react-query";

interface LoginFormData {
  users_username: string;
  users_password: string;
}

export const useLoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useUser();

  const showModal = (message: string) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
  };

  const mutation = useMutation({
    mutationFn: async (formData: LoginFormData) => {
      const res = await fetch("/api/logIn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Hubo un error en el inicio de sesión.");
      }

      return data;
    },
    onSuccess: (data) => {
      setUser({
        name: data.users_name + " " + data.users_lastname,
        email: data.users_email,
        role: data.role || "Usuario",
      });
      router.push("/main");
    },
    onError: (error: any) => {
      showModal(error.message || "Hubo un error en el inicio de sesión.");
    },
  });

  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    mutation.mutate({
      users_username: username.trim(),
      users_password: password.trim(),
    });
  };

  const handleGoogleLogin = () => {
    signIn("google", { callbackUrl: "/main" });
  };

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      showModal("Hubo un error en el inicio de sesión.");
    }
  }, [searchParams]);

  return {
    username,
    password,
    showPassword,
    modalMessage,
    isModalOpen,
    setUsername,
    setPassword,
    setShowPassword,
    handleLogin,
    handleGoogleLogin,
    closeModal,
    isSubmitting: mutation.isPending,
  };
};
