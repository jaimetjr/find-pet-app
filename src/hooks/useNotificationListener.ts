import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";

export function useNotificationListener() {
    const router = useRouter();

    useEffect(() => {
        console.log("useNotificationListener");
        const foregroundSub = Notifications.addNotificationReceivedListener((notification) => {
            console.log("Notification received:", notification);
        });

        const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
            console.log("Notification response received:", response);
            const data = response.notification.request.content.data;
            console.log("Notification data:", data);
            if (data.screen === "chat") {
                router.push(`/chat?userId=${data.userId}&userName=${data.userName}&userAvatar=${data.userAvatar}&petId=${data.petId}`);
            } else if (data.screen === "pet-detail") {
                router.push(`/pet-detail?petId=${data.petId}`);
            }
        });

        return () => {
            foregroundSub.remove();
            responseSub.remove();
        }
    }, []);

    
}