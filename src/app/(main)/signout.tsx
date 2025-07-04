import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function SignOutScreen() {
  const { signOut } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    // Sign out immediately when this screen is mounted
    signOut();
  }, [signOut]);

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: theme.colors.background 
    }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={{ 
        marginTop: 16, 
        color: theme.colors.text,
        fontSize: 16 
      }}>
        Saindo...
      </Text>
    </View>
  );
} 