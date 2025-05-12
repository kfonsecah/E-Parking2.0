'use client';

import Image from "next/image";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { usePaymentInterface } from "@/app/hooks/usePaymentInterface";
import { useGenerateEgressTicket } from "@/app/hooks/useGenerateEgressTicket";
import { useLoader } from "@/context/LoaderContext";
import GlobalLoader from "@/components/GlobalLoader";

export default function PaymentInterface() {
    const {
        handleModalClose,
        openCashierSession,
        cashTotal,
        totalExpenses,
        amountToPay,
        paymentMethod,
        amountReceived,
        hasPackage,
        selectedCashType,
        showModal,
        modalMessage,
        showConfirmModal,
        redirectCountdown,
        packages,
        inputAmountToPay,
        setInputAmountToPay,
        setSelectedCashType,
        handlePaymentMethod,
        calculateChange,
        setShowModal,
        setModalMessage,
        setShowConfirmModal,
        registerExit,
        resetForm,
        setAmountToPay,
        setAmountReceived,
        setHasPackage,
        vehicle,
    } = usePaymentInterface();

    const { printEgressTicket } = useGenerateEgressTicket();
    const { isLoading } = useLoader();

    if (isLoading) {
        return <GlobalLoader />;
    }

    return (
        <div>
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
                {/* Column: Summary + Packages */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-4 grid grid-cols-2 text-center shadow-sm">
                        <div>
                            <p className="text-sm text-gray-500">Total en caja</p>
                            <span className="text-3xl font-bold">
                                ₡{cashTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Gastado</p>
                            <span className="text-3xl font-bold text-red-500">
                                ₡{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {packages.map((pack, i) => {
                            const images = [
                                { color: "bg-blue-100", src: "/media/blue_car.png" },
                                { color: "bg-red-100", src: "/media/red_car.png" },
                                { color: "bg-gray-200", src: "/media/grey_pack.png" },
                                { color: "bg-yellow-100", src: "/media/gold_pack.png" },
                            ];
                            const img = images[i % images.length];

                            return (
                                <div
                                    key={pack.pack_id}
                                    className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow cursor-pointer"
                                    onClick={() => {
                                        if (hasPackage) {
                                            // Si ya tenía paquete, restarlo
                                            setAmountToPay(prev => {
                                                const newAmount = Math.max(prev - pack.pack_price, 0);
                                                setInputAmountToPay(newAmount.toFixed(2));
                                                return newAmount;
                                            });
                                            setHasPackage(false);
                                        } else {
                                            // Si no tenía paquete, sumarlo
                                            setAmountToPay(prev => {
                                                const newAmount = prev + pack.pack_price;
                                                setInputAmountToPay(newAmount.toFixed(2));
                                                return newAmount;
                                            });
                                            setHasPackage(true);
                                        }
                                    }}

                                >
                                    <div className={`${img.color} rounded-xl w-28 h-20 relative overflow-visible`}>
                                        <Image
                                            src={img.src}
                                            alt={pack.pack_name}
                                            width={200}
                                            height={140}
                                            className="absolute -right-4 top-14 -translate-y-1/2 scale-[1.5]"
                                        />
                                    </div>
                                    <div>
                                        <p className="font-medium">{pack.pack_name}</p>
                                        <p className="text-sm text-gray-500">₡{pack.pack_price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Column: Payment */}
                <div className="bg-white rounded-[30px] shadow p-6 space-y-6">
                    <div>
                        <p className="text-gray-500 text-sm mb-1">Total a pagar</p>
                        <input
                            type="text"
                            value={inputAmountToPay}
                            onChange={(e) => setInputAmountToPay(e.target.value)}
                            onBlur={() => {
                                const parsed = parseFloat(inputAmountToPay);
                                const value = isNaN(parsed) ? 0 : parsed;
                                setAmountToPay(value);
                                setInputAmountToPay(value.toFixed(2));
                            }}
                            className="bg-transparent text-4xl font-bold text-left outline-none w-full"
                        />
                        <div className="text-sm mt-4 space-y-2 text-gray-700">
                            <div className="flex justify-between border-b border-dashed border-gray-400 pb-1">
                                <span>Paquete</span>
                                <span>{hasPackage ? "Sí" : "No"}</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-gray-500 mb-1 text-sm">Tipo de caja</p>
                        <select
                            value={selectedCashType ?? ""}
                            onChange={(e) => setSelectedCashType(e.target.value)}
                            className="bg-gray-100 rounded-xl px-4 py-2 shadow-inner w-full"
                        >
                            {openCashierSession ? (
                                <option value={openCashierSession.cashType}>
                                    {openCashierSession.cashType} ({openCashierSession.openTime.slice(11, 16)})
                                </option>
                            ) : (
                                <option disabled>No hay cajas abiertas</option>
                            )}
                        </select>
                    </div>

                    <div>
                        <p className="text-gray-500 mb-2 text-sm">Método de pago</p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            {(["cash", "sinpe", "card", "otros"] as const).map((method) => (
                                <button
                                    key={method}
                                    className="bg-white rounded-xl shadow flex items-center gap-2 px-3 py-2"
                                    onClick={() => handlePaymentMethod(method)}
                                >
                                    <Image
                                        src={`/media/${method === "cash" ? "Cash" : method === "sinpe" ? "Sinpe" : method === "card" ? "Card" : "Card"}.png`}
                                        alt={method}
                                        width={24}
                                        height={24}
                                    />
                                    <span>
                                        {method === "cash" ? "Efectivo" : method === "sinpe" ? "Sinpe" : method === "card" ? "Tarjeta" : "Otros"}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {paymentMethod && (
                        <div>
                            <p className="text-sm">
                                {paymentMethod === "cash"
                                    ? "Total recibido"
                                    : paymentMethod === "sinpe"
                                        ? "Número SINPE"
                                        : paymentMethod === "card"
                                            ? "Número de comprobante"
                                            : "Referencia"}
                            </p>
                            <input
                                type="text"
                                value={amountReceived}
                                onChange={(e) => setAmountReceived(e.target.value)}
                                className="border-dashed border-2 border-gray-300 mt-2 h-12 rounded-xl px-4 w-full"
                            />
                        </div>
                    )}

                    <div className="flex justify-between items-center border-t pt-4">
                        <span className="text-gray-500">Cambio</span>
                        <span className="text-3xl font-bold">
                            ₡{calculateChange().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <button
                            onClick={() => {
                                if (!paymentMethod) {
                                    setModalMessage("Seleccione un método de pago.");
                                    setShowModal(true);
                                    return;
                                }
                                if (paymentMethod === "cash") {
                                    const received = Number(amountReceived);
                                    if (received < amountToPay) {
                                        setModalMessage("El monto recibido es insuficiente.");
                                        setShowModal(true);
                                        return;
                                    }
                                }
                                setShowConfirmModal(true);
                            }}
                            className="bg-green-200 text-green-800 px-6 py-2 rounded-full font-semibold shadow"
                        >
                            Pagar
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal
                message={modalMessage}
                isOpen={showModal}
                onClose={handleModalClose}
            />

            <ConfirmModal
                message="¿Desea imprimir el tiquete de salida?"
                isOpen={showConfirmModal}
                onCancel={() => {
                    setShowConfirmModal(false);
                    resetForm();
                    registerExit();
                }}
                onConfirm={async () => {
                    setShowConfirmModal(false);
                    resetForm();
                    await registerExit();
                    if (vehicle) {
                        await printEgressTicket({
                            owner: vehicle.veh_owner,
                            plate: vehicle.veh_plate,
                            reference: vehicle.veh_reference,
                            ingressDate: vehicle.veh_ingress_date,
                            egressDate: new Date().toISOString(),
                            fare: amountToPay,
                        });
                    }
                }}
            />
        </div>
    );
}
