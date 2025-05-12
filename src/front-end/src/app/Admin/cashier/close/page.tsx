"use client";

import { useCashierClose } from "@/app/hooks/useCashierClose";
import ConfirmModal from "@/components/ui/ConfirmModal";
import ReasonModal from "@/components/ui/reasonModal";

export default function CashierClosePage() {
  const {
    isLoading,
    result,
    expectedAmount,
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
  } = useCashierClose();

  const totalRegistrado = coins + bills + sinpe + transfer;
  const difference = totalRegistrado - expectedAmount;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">Cerrar Caja</h1>

        <p className="text-gray-600 mb-2">
          Saldo esperado: <strong>₵{expectedAmount.toFixed(2)}</strong>
        </p>

        <p className="text-gray-600 mb-2">
          Monto registrado: <strong>₵{totalRegistrado.toFixed(2)}</strong>
        </p>

        <p
          className={`mb-4 font-semibold ${Math.abs(difference) > 0.01 ? "text-red-600" : "text-green-600"
            }`}
        >
          Diferencia: {difference >= 0 ? "+" : "-"}₵{Math.abs(difference).toFixed(2)}
        </p>

        {/* 💰 Desglose */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monedas</label>
            <input
              type="text"
              value={coins}
              onChange={(e) => setCoins(parseFloat(e.target.value) || 0)}
              placeholder="₵0"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billetes</label>
            <input
              type="text"
              value={bills}
              onChange={(e) => setBills(parseFloat(e.target.value) || 0)}
              placeholder="₵0"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SINPE</label>
            <input
              type="text"
              value={sinpe}
              onChange={(e) => setSinpe(parseFloat(e.target.value) || 0)}
              placeholder="₵0"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transferencia</label>
            <input
              type="text"
              value={transfer}
              onChange={(e) => setTransfer(parseFloat(e.target.value) || 0)}
              placeholder="₵0"
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <button
          onClick={handleCashierClose}
          disabled={isLoading}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition"
        >
          {isLoading ? "Cerrando..." : "Cerrar Caja"}
        </button>

        {result && (
          <div
            className={`mt-6 p-4 rounded-lg ${result.success
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
              }`}
          >
            {result.message}
          </div>
        )}

        <ConfirmModal
          isOpen={confirmNeeded}
          message="⚠️ El monto ingresado no coincide exactamente con el saldo esperado. ¿Desea continuar?"
          onConfirm={confirmForceClose}
          onCancel={cancelForceClose}
        />

        <ReasonModal
          isOpen={reasonNeeded}
          message="⚠️ Debe indicar el motivo del ajuste en el monto contado."
          onConfirm={confirmWithReason}
          onCancel={cancelWithReason}
        />
      </div>
    </div>
  );
}
