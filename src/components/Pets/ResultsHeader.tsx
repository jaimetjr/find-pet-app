import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Pet } from '@/models/pet';
import { Coordinates } from '@/utils/locationUtils';
import { calculateDistance } from '@/utils/locationUtils';

interface ResultsHeaderProps {
  petsCount: number;
  userLocation: Coordinates | null;
  onSortByDistance: () => void;
}

export default function ResultsHeader({
  petsCount,
  userLocation,
  onSortByDistance,
}: ResultsHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.resultsContainer}>
      <Text style={[styles.resultsText, { color: theme.colors.text }]}>
        {petsCount} {petsCount === 1 ? 'pet encontrado' : 'pets encontrados'}
      </Text>

      {userLocation && (
        <TouchableOpacity style={styles.sortButton} onPress={onSortByDistance}>
          <Text style={[styles.sortText, { color: theme.colors.text }]}>
            Ordenar por distância
          </Text>
          <Feather name="arrow-down" size={14} color={theme.colors.text} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  resultsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsText: {
    fontSize: 14,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortText: {
    fontSize: 12,
    marginRight: 4,
  },
}); 