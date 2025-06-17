
// app/(main)/home.tsx
import { View, Text, Button, ActivityIndicator } from 'react-native';
//import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';
import { useUserAuth } from '@/contexts/UserAuthContext';

export default function HomeScreen() {
  const { signOut, isSignedIn, isLoaded, userId } = useAuth();
  const { user } = useUser();
  const { getUser } = useUserAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    if (!userId) return;

    async function getMe() {
      setIsLoading(true);
      const userDto = await getUser(userId!);
      if (!userDto) router.push("/(main)/profile-setup");
      setIsLoading(false);
    }
    getMe();
  }, [userId]);

  if (isLoading) return <ActivityIndicator size="large" color="#0000ff" />;

  return (
    <View style={{ padding: 20 }}>
      <Text>Welcome to the Home Screen!</Text>
      <Button
        title="Logout"
        onPress={() => {
          signOut();
        }}
      />
    </View>
  );
}
