import React, { useMemo } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface SearchFilterHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onFilterPress: () => void;
  onMapPress: () => void;
}

const SearchFilterHeader = React.memo(({
  searchQuery,
  onSearchChange,
  onFilterPress,
  onMapPress,
}: SearchFilterHeaderProps) => {
  const theme = useTheme();

  // Memoize styles to prevent unnecessary re-renders
  const searchContainerStyles = useMemo(() => [
    styles.searchContainer,
    {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
    },
  ], [theme.colors.card, theme.colors.border, theme.borderRadius.md]);

  const iconButtonStyles = useMemo(() => [
    styles.iconButton,
    {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
    },
  ], [theme.colors.card, theme.colors.border, theme.borderRadius.md]);

  const searchInputStyles = useMemo(() => [
    styles.searchInput, 
    { color: theme.colors.text }
  ], [theme.colors.text]);

  return (
    <View style={styles.searchFilterContainer}>
      <View style={searchContainerStyles}>
        <TextInput
          style={searchInputStyles}
          placeholder="Buscar pets..."
          placeholderTextColor={`${theme.colors.text}80`}
          value={searchQuery}
          onChangeText={onSearchChange}
        />
      </View>

      <TouchableOpacity
        style={iconButtonStyles}
        onPress={onFilterPress}
      >
        <Feather name="sliders" size={20} color={theme.colors.text} />
      </TouchableOpacity>

      <TouchableOpacity
        style={iconButtonStyles}
        onPress={onMapPress}
      >
        <Feather name="map" size={20} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );
});

SearchFilterHeader.displayName = 'SearchFilterHeader';

export default SearchFilterHeader;

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