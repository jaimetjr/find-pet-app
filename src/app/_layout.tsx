import { Stack } from "expo-router";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from '@clerk/clerk-expo/token-cache';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ClerkProvider tokenCache={tokenCache}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
        </Stack>
      </ClerkProvider>
    </ThemeProvider>
  );
}
