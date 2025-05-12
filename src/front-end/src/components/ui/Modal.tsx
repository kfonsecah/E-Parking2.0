"use client";

import React from "react";

interface ModalProps {
    message: string;
    isOpen: boolean;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ message, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
            <div className="relative z-10 bg-white rounded-xl p-6 shadow-lg w-[320px] text-center border border-gray-300">
                <div className="text-3xl mb-2">ℹ️</div>
                <p className="text-gray-800 mb-4">{message}</p>
                <button
                    onClick={onClose}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default Modal;
