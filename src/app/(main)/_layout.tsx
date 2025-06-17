import { Redirect, Stack, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { useUserAuth } from '@/contexts/UserAuthContext';
import { useEffect } from 'react';

export default function ProtectedLayout() {
  const { isSignedIn, isLoaded} = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <Stack>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="profile-setup" options={{ headerShown: false }} />
    </Stack>
  );
}
