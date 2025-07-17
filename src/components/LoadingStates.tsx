import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface LoadingStatesProps {
  type?: 'spinner' | 'skeleton' | 'dots' | 'pulse';
  message?: string;
  size?: 'small' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingStatesProps> = ({ 
  message, 
  size = 'large', 
  color 
}) => {
  const theme = useTheme();
  const spinnerColor = color || theme.colors.primary;

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {message && (
        <Text style={[styles.message, { color: theme.colors.text }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  const theme = useTheme();
  
  return (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={[styles.skeletonItem, { backgroundColor: theme.colors.border }]} />
      ))}
    </View>
  );
};

export const LoadingDots: React.FC<LoadingStatesProps> = ({ message }) => {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              { backgroundColor: theme.colors.primary },
            ]}
          />
        ))}
      </View>
      {message && (
        <Text style={[styles.message, { color: theme.colors.text }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

export const LoadingPulse: React.FC<LoadingStatesProps> = ({ message }) => {
  const theme = useTheme();
  
  return (
    <View style={styles.container}>
      <View style={[styles.pulse, { backgroundColor: theme.colors.primary }]} />
      {message && (
        <Text style={[styles.message, { color: theme.colors.text }]}>
          {message}
        </Text>
      )}
    </View>
  );
};

export default function LoadingStates({ 
  type = 'spinner', 
  message, 
  size, 
  color 
}: LoadingStatesProps) {
  switch (type) {
    case 'skeleton':
      return <LoadingSkeleton />;
    case 'dots':
      return <LoadingDots message={message} />;
    case 'pulse':
      return <LoadingPulse message={message} />;
    case 'spinner':
    default:
      return <LoadingSpinner message={message} size={size} color={color} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonItem: {
    height: 60,
    marginBottom: 12,
    borderRadius: 8,
    opacity: 0.3,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    opacity: 0.6,
  },
  pulse: {
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.6,
  },
}); 