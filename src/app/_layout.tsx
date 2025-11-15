import { Stack } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { UserAuthProvider } from "@/contexts/UserAuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { useNotificationListener } from "@/hooks/useNotificationListener";
import { useRegisterPushToken } from "@/hooks/useRegisterPushToken";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import Toast from "@/components/common/Toast";

function AppBootstrap() {
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

  useRegisterPushToken();

  return null;
}

function NotificationNavGate() {
  useNotificationListener();
  return null;
}

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <ThemeProvider>
        <ToastProvider>
          <UserAuthProvider>
            <AppBootstrap />
            <ChatProvider>
              <NotificationNavGate />
              <Stack>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(main)" options={{ headerShown: false }} />
              </Stack>
              <Toast />
            </ChatProvider>
          </UserAuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
