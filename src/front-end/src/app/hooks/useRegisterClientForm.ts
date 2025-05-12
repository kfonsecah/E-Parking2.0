"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Package {
  pack_id: number;
  pack_name: string;
  pack_price: number;
}

type ModalState = {
  isOpen: boolean;
  message: string;
};

export const useRegisterClientForm = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    client_name: "",
    client_lastname: "",
    client_id_card: "",
    client_email: "",
    client_phone: "",
    client_address: "",
    client_vehicle_plate: "",
    selectedPackage: "",
    client_pack_start_date: "",
    client_pack_end_date: "",
  });

  const [packages, setPackages] = useState<Package[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    message: "",
  });

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch("/api/packages");
        const data = await response.json();
        setPackages(data);
      } catch (error) {
        console.error("Error al obtener paquetes:", error);
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setForm({
      client_name: "",
      client_lastname: "",
      client_id_card: "",
      client_email: "",
      client_phone: "",
      client_address: "",
      client_vehicle_plate: "",
      selectedPackage: "",
      client_pack_start_date: "",
      client_pack_end_date: "",
    });
  };

  const handleSubmit = async () => {
    try {
      setModal({ isOpen: true, message: "Registrando cliente..." });

      // 🔄 Registrar cliente en la base de datos
      const response = await fetch("/api/clients/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          selectedPackage: parseInt(form.selectedPackage),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setModal({
          isOpen: true,
          message: `Error al registrar cliente: ${
            result.message || result.error
          }`,
        });
        return;
      }

      // ✅ Cliente registrado correctamente
      const { client_slug } = result;

      // 🔄 Buscar el paquete seleccionado para incluir en el correo
      const selectedPack = packages.find(
        (pkg) => pkg.pack_id === parseInt(form.selectedPackage)
      );

      if (selectedPack) {
        // 🔄 Enviar correo al cliente
        const emailResponse = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: form.client_email,
            client_name: `${form.client_name} ${form.client_lastname}`,
            package_name: selectedPack.pack_name,
            package_price: `${selectedPack.pack_price.toLocaleString()} colones`,
            start_date: form.client_pack_start_date,
            end_date: form.client_pack_end_date,
          }),
        });

        if (!emailResponse.ok) {
          console.error("Error al enviar correo:", await emailResponse.text());
          setModal({
            isOpen: true,
            message:
              "Cliente registrado, pero ocurrió un error al enviar el correo.",
          });
          return;
        }
      }

      // ✅ Todo correcto, redirigir a cashier-exit con el ID del cliente y paquete
      setModal({
        isOpen: true,
        message: "Cliente registrado correctamente y correo enviado.",
      });

      setTimeout(() => {
        setModal({ isOpen: false, message: "" });
        router.push(
          `/parking/cashier-exit?client=${result.client_slug}&package=${form.selectedPackage}`
        );
      }, 2000);
    } catch (err) {
      console.error("Error registrando cliente:", err);
      setModal({ isOpen: true, message: "Error al registrar cliente." });
    }
  };

  const closeModal = () => {
    setModal({ isOpen: false, message: "" });
  };

  return {
    form,
    packages,
    loadingPackages,
    handleChange,
    handleReset,
    handleSubmit,
    modal,
    closeModal,
  };
};
