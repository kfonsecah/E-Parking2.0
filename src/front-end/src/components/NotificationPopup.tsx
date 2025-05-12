import { useNotifications } from "./NotificationProvider";
import { motion, AnimatePresence } from "framer-motion";
import { LucideFileText, LucideX } from "lucide-react";

export const NotificationPopup = () => {
    const { notifications, removeNotification } = useNotifications();

    return (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 space-y-4 w-full max-w-md">
            <AnimatePresence>
                {notifications.map((notification) => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.4 }}
                        className="bg-gray-900 text-white shadow-lg rounded-xl p-3 flex items-center gap-3 relative"
                    >
                        {/* Icono de nota */}
                        <div className="bg-blue-600 rounded-full p-2 flex items-center justify-center">
                            <LucideFileText size={22} className="text-white" />
                        </div>

                        <div className="flex-grow">
                            <p className="font-semibold text-base">Nueva Nota</p>
                            <p className="text-sm text-gray-300">
                                {notification.message}
                            </p>
                        </div>

                        {/* Botón de cerrar */}
                        <button
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-200"
                            onClick={() => removeNotification(notification.id)}
                        >
                            <LucideX size={18} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
