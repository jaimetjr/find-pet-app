import { Stack } from "expo-router";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { UserAuthProvider } from "@/contexts/UserAuthContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <UserAuthProvider>
        <ClerkProvider tokenCache={tokenCache}>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(main)" options={{ headerShown: false }} />
          </Stack>
        </ClerkProvider>
      </UserAuthProvider>
    </ThemeProvider>
  );
}
