import { useNotifications } from "@/components/NotificationProvider";

export const useNotify = () => {
  const { addNotification } = useNotifications();
  return addNotification;
};
