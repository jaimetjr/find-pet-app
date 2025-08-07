import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useAuth } from "@clerk/clerk-expo";
import { updateExpoPushToken } from "@/services/authService";
import { useUser } from "./useUser";
import Constants from "expo-constants";
import { Platform } from "react-native";

export function useRegisterPushToken() {
  const { userId } = useAuth();
  const { user } = useUser();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
      visibility: Notifications.AndroidNotificationVisibility.PUBLIC,

    }),
  });

  useEffect(() => {
    if (!userId || !user) return;

    async function registerToken() {

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Encontrando um Lar',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }


      let token: string | undefined;
      //if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
          console.log('existingStatus', existingStatus);
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          console.warn("Permission for push notifications was denied");
          return;
        }
        console.log('jura ne');
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        const expoPushToken = await Notifications.getExpoPushTokenAsync(projectId);
        token = expoPushToken.data;
        console.log('token', token);
        if (token) {
            await updateExpoPushToken({
              clerkId: userId!,
              expoPushToken: token,
            });
          }
      //}

    }

    registerToken();
  }, [user, userId]);
}
