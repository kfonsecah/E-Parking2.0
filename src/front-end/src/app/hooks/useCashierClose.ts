"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useCashierClose() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [expectedAmount, setExpectedAmount] = useState(0);
  const [coins, setCoins] = useState(0);
  const [bills, setBills] = useState(0);
  const [sinpe, setSinpe] = useState(0);
  const [transfer, setTransfer] = useState(0);
  const [confirmNeeded, setConfirmNeeded] = useState(false);
  const [reasonNeeded, setReasonNeeded] = useState(false);
  const [pendingClose, setPendingClose] = useState<{
    realAmount: number;
    breakdown: {
      coins: number;
      bills: number;
      sinpe: number;
      transfer: number;
    };
  } | null>(null);

  const router = useRouter();

  const realAmount = coins + bills + sinpe + transfer;

  const loadStatus = async () => {
    try {
      const res = await fetch("/api/cashier/status", {
        credentials: "include",
      });

      if (!res.ok) {
        console.error("❌ Error al cargar estado:", await res.json());
        return;
      }

      const data = await res.json();

      if (data?.hasActiveSession) {
        setExpectedAmount(data.saldoActual);
      } else {
        setExpectedAmount(0);
      }
    } catch (err) {
      console.error("❌ Error cargando estado de caja:", err);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleCashierClose = () => {
    const breakdown = { coins, bills, sinpe, transfer };

    if (Math.abs(realAmount - expectedAmount) > 1) {
      setReasonNeeded(true);
      setPendingClose({ realAmount, breakdown });
    } else if (Math.abs(realAmount - expectedAmount) > 0.01) {
      setConfirmNeeded(true);
      setPendingClose({ realAmount, breakdown });
    } else {
      closeCashier({ realAmount, breakdown });
    }
  };

  const closeCashier = async (params: {
    realAmount: number;
    reason?: string;
    breakdown: {
      coins: number;
      bills: number;
      sinpe: number;
      transfer: number;
    };
  }) => {
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/cashier/close", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al cerrar la caja");
      }

      setResult({
        success: true,
        message: `Caja cerrada exitosamente con saldo de ₵${data.data.realBalance.toFixed(
          2
        )}`,
      });

      await loadStatus();
      router.refresh();
      setCoins(0);
      setBills(0);
      setSinpe(0);
      setTransfer(0);
    } catch (error: any) {
      console.error(error);
      setResult({
        success: false,
        message: error.message || "Error inesperado",
      });
    } finally {
      setIsLoading(false);
      setConfirmNeeded(false);
      setReasonNeeded(false);
      setPendingClose(null);
    }
  };

  const confirmForceClose = () => {
    if (pendingClose) {
      closeCashier({
        realAmount: pendingClose.realAmount,
        breakdown: pendingClose.breakdown,
      });
    }
  };

  const cancelForceClose = () => {
    setConfirmNeeded(false);
    setPendingClose(null);
  };

  const confirmWithReason = (reason: string) => {
    if (pendingClose) {
      closeCashier({
        realAmount: pendingClose.realAmount,
        reason,
        breakdown: pendingClose.breakdown,
      });
    }
  };

  const cancelWithReason = () => {
    setReasonNeeded(false);
    setPendingClose(null);
  };

  return {
    isLoading,
    result,
    expectedAmount,
    realAmount, // calculado
    coins,
    bills,
    sinpe,
    transfer,
    setCoins,
    setBills,
    setSinpe,
    setTransfer,
    handleCashierClose,
    confirmNeeded,
    reasonNeeded,
    confirmForceClose,
    cancelForceClose,
    confirmWithReason,
    cancelWithReason,
  };
}
