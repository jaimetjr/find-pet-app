import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

export function useNotificationListener() {
    const router = useRouter();

    useEffect(() => {
        const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
            console.log("Notification received:", notification);
        });

        const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log("Notification response received:", response);
            const data = response.notification.request.content.data;
            console.log("Notification data:", data);
        });

        return () => {
            foregroundSub.remove();
            responseSub.remove();
        }
    }, []);

    
}