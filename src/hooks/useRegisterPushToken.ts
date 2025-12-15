import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useAuth } from "@clerk/clerk-expo";
import { updateExpoPushToken } from "@/services/authService";
import { useUser } from "./useUser";
import Constants from "expo-constants";
import { Platform } from "react-native";

export function useRegisterPushToken() {
  const { userId, isLoaded } = useAuth();
  const { user, isLoading, hasCheckedUser } = useUser();

  useEffect(() => {
    console.log('useRegisterPushToken effect triggered', {
      userId,
      hasUser: !!user,
      isLoading,
      hasCheckedUser,
      isLoaded,
    });

    // Wait for auth to be loaded and user check to complete
    if (!isLoaded || !userId) {
      console.log('Waiting for auth to load...');
      return;
    }

    // Wait for user check to complete
    if (!hasCheckedUser || isLoading) {
      console.log('Waiting for user to load...');
      return;
    }

    // Only proceed if user exists (user might be null if profile not set up)
    if (!user) {
      console.log('User not found, skipping push token registration');
      return;
    }

    async function registerToken() {
      try {
        console.log('Starting push token registration...');
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
  }, [user, userId, isLoaded, isLoading, hasCheckedUser]);
}
