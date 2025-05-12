"use client";

import { useState, FormEvent, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UserForm {
  users_id: number | null;
  users_name: string;
  users_lastname: string;
  users_email: string;
  users_id_card: string;
  users_username: string;
  users_password: string;
  users_version: number;
  rol_id: string;
}

interface User {
  users_id: number;
  users_name: string;
  users_lastname: string;
  users_email: string;
  users_id_card: string;
  users_username: string;
  users_password?: string;
  users_version: number;
  roles?: { role?: Role }[];
}

interface Role {
  rol_id: number;
  rol_name: string;
}

export const useUserRegistration = () => {
  const queryClient = useQueryClient();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<UserForm>({
    users_id: null,
    users_name: "",
    users_lastname: "",
    users_email: "",
    users_id_card: "",
    users_username: "",
    users_password: "",
    users_version: 1,
    rol_id: "",
  });

  const [modalMessage, setModalMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const showModal = (message: string) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al cargar los usuarios.");
      return data;
    },
  });

  const { data: roles = [] } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await fetch("/api/roles");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar los roles.");
      return data;
    },
  });

  const assignRole = useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`/api/users/${userId}/assign-role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rol_id: parseInt(form.rol_id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al asignar rol.");
    },
    onError: (error: any) => {
      showModal(error.message);
    },
  });

  const registerUser = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          users_name: form.users_name,
          users_lastname: form.users_lastname,
          users_email: form.users_email,
          users_id_card: form.users_id_card,
          users_username: form.users_username,
          users_password: form.users_password,
          users_version: 1,
        }),
      });
      const user = await res.json();
      if (!res.ok)
        throw new Error(user.error || "Error al registrar el usuario.");
      return user;
    },
    onSuccess: async (user) => {
      await assignRole.mutateAsync(user.users_id);
      showModal("✅ Usuario registrado con éxito.");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      resetForm();
    },
    onError: (error: any) => {
      showModal(error.message || "Error de conexión.");
    },
  });

  const updateUser = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/users/${form.users_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          users_name: form.users_name,
          users_lastname: form.users_lastname,
          users_email: form.users_email,
          users_id_card: form.users_id_card,
          users_username: form.users_username,
          users_password: form.users_password,
          users_version: form.users_version + 1,
        }),
      });
      const user = await res.json();
      if (!res.ok)
        throw new Error(user.error || "Error al actualizar el usuario.");
      return user;
    },
    onSuccess: async () => {
      if (form.users_id) {
        await assignRole.mutateAsync(form.users_id);
        showModal("✅ Usuario actualizado con éxito.");
        await queryClient.invalidateQueries({ queryKey: ["users"] });
        resetForm();
      }
    },
    onError: (error: any) => {
      showModal(error.message || "Error de conexión.");
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: number) => {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al eliminar el usuario.");
    },
    onSuccess: async () => {
      showModal("✅ Usuario eliminado correctamente.");
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      resetForm();
      setIsConfirmOpen(false);
      setConfirmId(null);
    },
    onError: (error: any) => {
      showModal(error.message || "Error de conexión.");
    },
  });

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    registerUser.mutate();
  };

  const handleUpdate = (e: FormEvent) => {
    e.preventDefault();
    if (!form.users_id) return showModal("Usuario no seleccionado.");
    updateUser.mutate();
  };

  const confirmDelete = () => {
    if (form.users_id !== null) {
      setConfirmId(form.users_id);
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (confirmId) deleteUser.mutate(confirmId);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRowClick = (user: User) => {
    const role = user.roles?.[0]?.role?.rol_id ?? "";
    setForm({
      users_id: user.users_id,
      users_name: user.users_name,
      users_lastname: user.users_lastname,
      users_email: user.users_email,
      users_id_card: user.users_id_card,
      users_username: user.users_username,
      users_password: user.users_password ?? "",
      users_version: user.users_version,
      rol_id: role.toString(),
    });
  };

  const resetForm = () => {
    setForm({
      users_id: null,
      users_name: "",
      users_lastname: "",
      users_email: "",
      users_id_card: "",
      users_username: "",
      users_password: "",
      users_version: 1,
      rol_id: "",
    });
  };

  return {
    form,
    users,
    roles,
    showPassword,
    setShowPassword,
    isModalOpen,
    modalMessage,
    isConfirmOpen,
    handleChange,
    handleRegister,
    handleUpdate,
    confirmDelete,
    handleConfirmDelete,
    handleRowClick,
    closeModal,
    setIsConfirmOpen,
    setConfirmId,
  };
};
