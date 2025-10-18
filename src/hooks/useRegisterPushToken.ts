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


  useEffect(() => {
    if (!userId || !user) return;

    async function registerToken() {

      try {
        console.log('registering token');
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
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          console.warn("Permission for push notifications was denied");
          return;
        }
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        console.log('projectId', projectId);
        const expoPushToken = await Notifications.getExpoPushTokenAsync({projectId});
        token = expoPushToken.data;
        console.log('token', token);
        if (token) {
            const response = await updateExpoPushToken({
              clerkId: userId!,
              expoPushToken: token,
            });
            console.log('response', response.success);
          }
        //}
      } catch (error) {
        console.error('Error registering push token', error);
      }


    }

    registerToken();
  }, [user, userId]);
}
