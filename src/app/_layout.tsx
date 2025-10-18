import { Stack } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { UserAuthProvider } from "@/contexts/UserAuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { useNotificationListener } from "@/hooks/useNotificationListener";
import { useRegisterPushToken } from "@/hooks/useRegisterPushToken";
import { useEffect } from "react";
import * as Notifications from "expo-notifications";

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
        <UserAuthProvider>
          <AppBootstrap />
          <ChatProvider>
            <NotificationNavGate />
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(main)" options={{ headerShown: false }} />
            </Stack>
          </ChatProvider>
        </UserAuthProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
