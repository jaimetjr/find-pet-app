import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function AuthLayout() {
  const theme = useTheme();
  const { isSignedIn, isLoaded } = useAuth();

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  // If user is signed in, redirect to home
  if (isSignedIn) {
    return <Redirect href="/(main)/home" />;
  }

  // If user is not signed in, show auth screens
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="sign-in" 
        options={{ 
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitle: '',
          headerShadowVisible: false,
        }} 
      />
      <Stack.Screen 
        name="sign-up" 
        options={{ 
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitle: '',
          headerShadowVisible: false,
        }} 
      />
      <Stack.Screen 
        name="verify" 
        options={{ 
          headerStyle: { backgroundColor: theme.colors.background },
          headerTitle: '',
          headerShadowVisible: false,
        }} 
      />
    </Stack>
  );
}