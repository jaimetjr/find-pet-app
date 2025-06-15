
// app/(main)/home.tsx
import { View, Text, Button } from 'react-native';
//import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function HomeScreen() {
  const { signOut } = useAuth();
  const router = useRouter();

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
