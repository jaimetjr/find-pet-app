import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface SearchFilterHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onFilterPress: () => void;
  onMapPress: () => void;
}

export default function SearchFilterHeader({
  searchQuery,
  onSearchChange,
  onFilterPress,
  onMapPress,
}: SearchFilterHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.searchFilterContainer}>
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderRadius: theme.borderRadius.md,
          },
        ]}
      >
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder="Buscar pets..."
          placeholderTextColor={`${theme.colors.text}80`}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.iconButton,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderRadius: theme.borderRadius.md,
          },
        ]}
        onPress={onFilterPress}
      >
        <Feather name="sliders" size={20} color={theme.colors.text} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.iconButton,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderRadius: theme.borderRadius.md,
          },
        ]}
        onPress={onMapPress}
      >
        <Feather name="map" size={20} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
  },
  searchContainer: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  searchInput: {
    padding: 8,
    fontSize: 16,
  },
  iconButton: {
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
}); 