"use client";

import { useEffect, useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { colorMap } from "@/lib/colors";
import { generateIngressTicket } from "@/lib/entryTicket";
import { useLoader } from "@/context/LoaderContext";

export function useVehicleManagement() {
  const { setIsLoading } = useLoader();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isDetectingPlate, setIsDetectingPlate] = useState(false);

  // Memoize getCurrentDate
  const getCurrentDate = useCallback(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  // Memoize getCurrentTime
  const getCurrentTime = useCallback(() => {
    return new Date().toTimeString().slice(0, 5);
  }, []);

  const formatPlateInput = (value: string): string => {
    const clean = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const prefix = validPrefixes.find((abbr) => clean.startsWith(abbr));
    let formatted = "";

    if (prefix) {
      const rest = clean.slice(prefix.length);
      const letters = rest.match(/^[A-Z]+/)?.[0] || "";
      const numbers = rest.slice(letters.length);
      formatted = `${prefix}${letters ? "-" + letters : ""}${
        numbers ? "-" + numbers : ""
      }`;
    } else if (/^[A-Z]{1,3}[0-9]{1,6}$/.test(clean)) {
      const letters = clean.match(/^[A-Z]{1,3}/)?.[0];
      const numbers = clean.slice(letters?.length || 0);
      formatted = letters ? `${letters}-${numbers}` : numbers;
    } else {
      formatted = clean;
    }

    return formatted.slice(0, 10);
  };

  const validPrefixes = ["CL", "AGV", "MT"];

  const normalizePlateForAPI = (plate: string): string => {
    const plain = plate.replace(/-/g, "");
    return plain.length > 10 ? plain : plate;
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [stats, setStats] = useState({ available: 0, occupied: 0 });

  const [newEntry, setNewEntry] = useState({
    plate: "",
    owner: "",
    time: getCurrentTime(),
    date: getCurrentDate(),
    color: "",
  });

  const showModal = (msg: string) => {
    setModalMessage(msg);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMessage("");
  };

  const { refetch: fetchStats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Error al obtener estadísticas");
      return data;
    },
    enabled: false,
  });

  const { refetch: fetchVehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await fetch("/api/vehicles");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al obtener vehículos");
      return data;
    },
    enabled: false,
  });

  const fetchAndFormatStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchStats();
      const value = data.data;
      setStats({
        available: value.availableSpaces,
        occupied: value.parkedCars || 0,
      });
    } catch (error) {
      console.error("Error al obtener estadísticas:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchStats, setIsLoading]);

  const fetchAndFormatVehicles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchVehicles();
      const value = data.data;
      const formatted = value.map((veh: any) => {
        const utcDate = new Date(veh.veh_ingress_date);
        const crTime = new Date(utcDate.getTime() - 6 * 60 * 60 * 1000);
        const formattedTime = crTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
        const formattedDate = crTime.toISOString().split("T")[0]; // Formato "YYYY-MM-DD"

        return {
          id: veh.veh_id.toString(),
          plate: veh.veh_plate,
          reference: veh.veh_reference,
          owner: veh.veh_owner,
          color: colorMap[veh.veh_color?.toLowerCase()] || "gray",
          time: formattedTime,
          date: formattedDate, // Agregado aquí
          status: "IN",
        };
      });
      setEntries(formatted);
    } catch (err) {
      showModal("Error al cargar los vehículos");
    } finally {
      setIsLoading(false);
    }
  }, [fetchVehicles, setIsLoading]);

  useEffect(() => {
    fetchAndFormatStats();
    fetchAndFormatVehicles();
  }, [fetchAndFormatStats, fetchAndFormatVehicles]);

  useEffect(() => {
    const interval = setInterval(() => {
      setNewEntry((prev) => ({ ...prev, time: getCurrentTime() }));
    }, 1000);
    return () => clearInterval(interval);
  }, [getCurrentTime]); // Added getCurrentTime to the dependency array

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "plate") {
      const formatted = formatPlateInput(value);
      setNewEntry((prev) => ({ ...prev, plate: formatted }));
    } else {
      setNewEntry((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleReset = useCallback(() => {
    setNewEntry({
      plate: "",
      owner: "",
      time: getCurrentTime(),
      date: getCurrentDate(),
      color: "",
    });
  }, [setNewEntry, getCurrentTime, getCurrentDate]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newEntry.plate || !newEntry.owner) {
        showModal("Por favor, completa todos los campos obligatorios");
        return;
      }
      try {
        const res = await fetch("/api/vehicles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            veh_plate: normalizePlateForAPI(newEntry.plate),
            veh_owner: newEntry.owner,
            veh_color: newEntry.color,
            veh_version: 1,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          showModal(data.error || "Error al registrar el vehículo");
          return;
        }

        showModal("Vehículo registrado exitosamente");
        await fetchAndFormatVehicles();
        await fetchAndFormatStats();
        await generateIngressTicket({
          owner: newEntry.owner,
          plate: newEntry.plate,
          reference: data.veh_reference,
          ingressDate: new Date().toISOString(),
        });
        handleReset();
      } catch (error) {
        showModal("Error al conectar con la API");
      }
    },
    [newEntry, fetchAndFormatVehicles, fetchAndFormatStats, handleReset] // handleReset is now memoized
  );

  const recognizePlateFromImage = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/recognize-plates", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setNewEntry((prev) => ({
          ...prev,
          plate: formatPlateInput(data.plate || ""),
          color: data.color || "",
        }));
      } else {
        showModal(data.error || "Error detectando la placa");
      }
    } catch (error) {
      showModal("Error al conectar con el servicio de reconocimiento");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        showModal("Vehículo eliminado correctamente.");
        await fetchAndFormatVehicles();
      } else {
        showModal(data.error || "Error al eliminar el vehículo.");
      }
    } catch (error) {
      showModal("Error al conectar con la API.");
    }
  };

  const handleRemoveEntry = (id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const filteredEntries = entries.filter(
    (entry) =>
      entry.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    router,
    searchQuery,
    setSearchQuery,
    newEntry,
    setNewEntry,
    stats,
    modalOpen,
    modalMessage,
    showModal,
    closeModal,
    entries,
    filteredEntries,
    handleInputChange,
    handleSubmit,
    handleDelete,
    handleReset,
    handleRemoveEntry,
    colorMap,
    isDetectingPlate,
    setIsDetectingPlate,
    recognizePlateFromImage,
  };
}
