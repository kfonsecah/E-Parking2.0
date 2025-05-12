import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { NotificationPopup } from "./NotificationPopup";
import { NotificationTrigger } from "./NotificationTrigger";

interface Notification {
    id: number;
    message: string;
}

interface NotificationContextType {
    notifications: Notification[];
    addNotification: (message: string) => void;
    removeNotification: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((message: string) => {
        const newNotification: Notification = { id: Date.now(), message };
        setNotifications((prev) => [...prev, newNotification]);
      
        const audio = new Audio("/media/audio/notification.wav");
        audio.play().catch((e) => console.warn("Error reproduciendo audio:", e));

        setTimeout(() => removeNotification(newNotification.id), 5000);
      }, []);
      

    const removeNotification = useCallback((id: number) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
            {children}
            <NotificationPopup />
            <NotificationTrigger />
        </NotificationContext.Provider>
    );
};

export const useNotify = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotify debe usarse dentro de NotificationProvider");
    }
    return context.addNotification;
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications debe usarse dentro de NotificationProvider");
    }
    return context;
};

