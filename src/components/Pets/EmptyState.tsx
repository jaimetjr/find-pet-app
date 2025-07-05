import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface EmptyStateProps {
  onClearFilters: () => void;
}

export default function EmptyState({ onClearFilters }: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        Nenhum pet encontrado com os filtros atuais.
      </Text>
      <TouchableOpacity
        style={[
          styles.clearFiltersButton,
          { backgroundColor: theme.colors.primary },
        ]}
        onPress={onClearFilters}
      >
        <Text style={[styles.clearFiltersText, { color: theme.colors.text }]}>
          Limpar Filtros
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  clearFiltersButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 