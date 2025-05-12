"use client";

import React, { useState } from "react";

interface ReasonModalProps {
    isOpen: boolean;
    message: string;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
}

const ReasonModal: React.FC<ReasonModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
    const [reason, setReason] = useState("");

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            <div className="relative z-10 bg-white rounded-xl p-6 shadow-lg w-[400px] text-center border border-gray-300 space-y-4">
                <div className="text-3xl">📝</div>
                <p className="text-gray-800">{message}</p>

                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describa el motivo de la modificación..."
                    className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
                    rows={4}
                />

                <div className="flex justify-center gap-4">
                    <button
                        onClick={onCancel}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded transition"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(reason)}
                        disabled={reason.trim().length < 10} // 🔥 mínimo 10 caracteres
                        className={`px-4 py-2 rounded transition ${reason.trim().length >= 10 ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-300 text-gray-500"}`}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReasonModal;
