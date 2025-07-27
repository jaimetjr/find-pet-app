import { Stack } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { UserAuthProvider } from "@/contexts/UserAuthContext";
import { ChatProvider } from "@/contexts/ChatContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserAuthProvider>
        <ClerkProvider tokenCache={tokenCache}>
          <ChatProvider>
            <Stack>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(main)" options={{ headerShown: false }} />
            </Stack>
          </ChatProvider>
        </ClerkProvider>
      </UserAuthProvider>
    </ThemeProvider>
  );
}
