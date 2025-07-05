import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
}

export default function LoadingSpinner({ 
  size = 'large', 
  color 
}: LoadingSpinnerProps) {
  const theme = useTheme();
  const spinnerColor = color || theme.colors.primary;

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={spinnerColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 