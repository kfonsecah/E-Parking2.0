"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLoader } from "@/context/LoaderContext";
import { useQuery } from "@tanstack/react-query";

// 🔵 Interfaces
interface TaxResponse {
  tax_price: number;
}
interface Vehicle {
  veh_ingress_date: string;
  veh_owner: string;
  veh_plate: string;
  veh_reference: string;
}
interface Package {
  pack_id: number;
  pack_name: string;
  pack_price: number;
}
interface CashierStatus {
  hasActiveSession: boolean;
  openingAmount: number;
  totalIngresos: number;
  totalEgresos: number;
  saldoActual: number;
}
interface CashierSession {
  sessionId: number;
  cashType: string;
  openTime: string;
}

// 🔵 Tipos válidos de método de pago
type PaymentMethod = "cash" | "card" | "sinpe" | "otros";
type PaymentMethodTranslated =
  | "efectivo"
  | "tarjeta"
  | "transferencia"
  | "otros";

export function usePaymentInterface() {
  const { setIsLoading } = useLoader();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("id");
  const router = useRouter();
  const clientSlug = searchParams.get("client");
  const packageId = searchParams.get("package");

  // 🔵 Estados
  const [amountToPay, setAmountToPay] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [amountReceived, setAmountReceived] = useState<number | string>("");
  const [hasPackage, setHasPackage] = useState<boolean>(false);
  const [selectedCashType, setSelectedCashType] = useState<string>("");
  const [inputAmountToPay, setInputAmountToPay] = useState<string>("0.00");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(3);

  // 🔵 Fetch impuestos
  const { data: taxData } = useQuery<TaxResponse>({
    queryKey: ["baseTax"],
    queryFn: async () => {
      const res = await fetch("/api/tax", { credentials: "include" });
      if (!res.ok) throw new Error("Error al obtener impuesto");
      return res.json();
    },
  });

  // 🔵 Fetch paquetes
  const { data: packages = [] } = useQuery<Package[]>({
    queryKey: ["packages"],
    queryFn: async () => {
      const res = await fetch("/api/packages", { credentials: "include" });
      if (!res.ok) throw new Error("Error al obtener paquetes");
      return res.json();
    },
  });

  // 🔵 Fetch sesión abierta
  const { data: openCashierSession } = useQuery<CashierSession | null>({
    queryKey: ["openCashierSession"],
    queryFn: async () => {
      const res = await fetch("/api/cashier/open-sessions", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al obtener sesión");
      return res.json();
    },
  });

  // 🔵 Fetch estado de la caja seleccionada
  const { data: cashierStatus } = useQuery<CashierStatus>({
    queryKey: ["cashierStatus", selectedCashType],
    queryFn: async () => {
      const res = await fetch(
        `/api/cashier/status?cashType=${encodeURIComponent(selectedCashType)}`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Error al consultar estado de caja");
      return res.json();
    },
    enabled: !!selectedCashType,
  });

  useEffect(() => {
    if (packageId && packages.length > 0) {
      const selectedPack = packages.find(
        (pkg) => pkg.pack_id === parseInt(packageId)
      );
      if (selectedPack) {
        setAmountToPay(selectedPack.pack_price);
        setInputAmountToPay(selectedPack.pack_price.toFixed(2));
        setHasPackage(true); // Marca que es un cliente con paquete
      }
    }
  }, [packageId, packages]);

  // 🔵 Detectar si no hay caja abierta
  useEffect(() => {
    if (openCashierSession === undefined) return; // ⬅️ Primero proteger

    if (openCashierSession === null) {
      setModalMessage("No hay cajas abiertas. Redirigiendo...");
      setShowModal(true);

      const interval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            router.push("/Admin/cashier");
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setSelectedCashType(openCashierSession.cashType);
    }
  }, [openCashierSession, router]);

  useEffect(() => {
    const loadVehicle = async () => {
      // ✅ Solo carga vehículo si tiene ID y NO es un cliente con paquete
      if (!vehicleId || hasPackage || !taxData?.tax_price) return;

      try {
        setIsLoading(true);
        const res = await fetch(`/api/vehicles/${vehicleId}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Error al cargar vehículo");
        const data: Vehicle = await res.json();
        setVehicle(data);

        // ✅ Calcular tarifa
        const ingressDate = new Date(data.veh_ingress_date);
        const nowCR = new Date(new Date().getTime() - 6 * 60 * 60 * 1000);

        const minutesElapsed = Math.floor(
          (nowCR.getTime() - ingressDate.getTime()) / (1000 * 60)
        );

        let fare = taxData.tax_price;
        if (minutesElapsed > 60) {
          fare += (minutesElapsed - 60) * 10;
        }

        setAmountToPay(fare);
        setInputAmountToPay(fare.toFixed(2));
      } catch (err) {
        console.error(err);
        setModalMessage("Error al calcular tarifa.");
        setShowModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicle();
  }, [vehicleId, taxData, hasPackage, setIsLoading]);

  // 🔵 Traductor de método de pago
  const translatePaymentMethod = (
    method: PaymentMethod
  ): PaymentMethodTranslated => {
    switch (method) {
      case "cash":
        return "efectivo";
      case "card":
        return "tarjeta";
      case "sinpe":
        return "transferencia";
      case "otros":
        return "otros";
      default:
        throw new Error("Método de pago inválido");
    }
  };

  // 🔵 Registrar salida
  const registerExit = async (): Promise<string | null> => {
    // 🔍 Validaciones básicas
    if ((!vehicleId && !clientSlug) || !paymentMethod) return null;
    const nowCR = new Date(new Date().getTime() - 6 * 60 * 60 * 1000);

    try {
      const payload = {
        cashType: selectedCashType,
        paymentMethod: translatePaymentMethod(paymentMethod as PaymentMethod),
        totalToPay: amountToPay,
        totalReceived: amountReceived || amountToPay,
      };

      // ✅ Registrar transacción (siempre)
      const transactionRes = await fetch("/api/cashier/transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!transactionRes.ok) {
        const data = await transactionRes.json();
        setModalMessage(data.error || "Error al registrar movimiento");
        setShowModal(true);
        return null;
      }

      // ✅ Manejo de paquetes sin vehículo
      if (hasPackage && packageId && clientSlug) {
        const packageRes = await fetch("/api/clients/packages/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            client_slug: clientSlug,
            packageId: parseInt(packageId),
          }),
        });

        const packageData = await packageRes.json();
        if (!packageRes.ok) {
          setModalMessage(packageData.message || "Error actualizando paquete");
          setShowModal(true);
          return null;
        }

        setModalMessage("Paquete activado correctamente");
        setShowModal(true);
        return "Paquete activado correctamente";
      }

      // ✅ Manejo de salida de vehículo (solo si no tiene paquete)
      if (!hasPackage && vehicleId) {
        const vehicleRes = await fetch(`/api/vehicles/${vehicleId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            veh_exit_date: nowCR.toISOString(),
            veh_tax: amountToPay.toString(),
          }),
        });

        const updatedVehicle = await vehicleRes.json();
        if (!vehicleRes.ok) {
          throw new Error(updatedVehicle.error || "Error registrando salida");
        }

        setModalMessage("Salida registrada exitosamente");
        setShowModal(true);
        return updatedVehicle.veh_exit_date;
      }

      // ✅ Manejo de casos donde no hay paquete ni vehículo (error lógico)
      setModalMessage("Movimiento registrado correctamente");
      setShowModal(true);
      return null;
    } catch (err) {
      console.error(err);
      setModalMessage("Error registrando salida.");
      setShowModal(true);
      return null;
    }
  };

  const calculateChange = () => {
    if (paymentMethod !== "cash") {
      // Si el método de pago NO es efectivo, no hay vuelto
      return 0;
    }

    const received = Number(amountReceived);
    if (isNaN(received)) return 0;

    return received > amountToPay ? received - amountToPay : 0;
  };

  const handlePaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setAmountReceived("");
  };

  const resetForm = () => {
    setAmountReceived("");
    setAmountToPay(0);
    setPaymentMethod("");
    setHasPackage(false);
  };

  const handleModalClose = useCallback(() => {
    router.push("/parking/overview");
  }, [router]);

  return {
    cashTotal: cashierStatus?.saldoActual ?? 0,
    totalExpenses: cashierStatus?.totalEgresos ?? 0,
    openCashierSession,
    amountToPay,
    paymentMethod,
    amountReceived,
    hasPackage,
    selectedCashType,
    inputAmountToPay,
    showModal,
    modalMessage,
    showConfirmModal,
    redirectCountdown,
    packages,
    setInputAmountToPay,
    setSelectedCashType,
    handlePaymentMethod,
    calculateChange,
    setShowModal,
    setModalMessage,
    setShowConfirmModal,
    resetForm,
    setAmountToPay,
    setHasPackage,
    setAmountReceived,
    vehicle,
    registerExit,
    handleModalClose,
  };
}
