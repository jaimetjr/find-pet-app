// app/(main)/home.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  //SafeAreaView,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import ActiveFilters from "@/components/Pets/ActiveFilters";
import PetCard from "@/components/Pets/PetCard";
import FilterModal from "@/components/Pets/FilterModal";
import PetMapView from "@/components/Pets/PetMapView";
import SearchFilterHeader from "@/components/Pets/SearchFilterHeader";
import ResultsHeader from "@/components/Pets/ResultsHeader";
import EmptyState from "@/components/Pets/EmptyState";
import LoadingSpinner from "@/components/LoadingSpinner";
import { usePets } from "@/hooks/usePets";
import { useLocation } from "@/hooks/useLocation";
import { useUser } from "@/hooks/useUser";
import { usePetFilters } from "@/hooks/usePetFilters";
import { useMapToggle } from "@/hooks/useMapToggle";
import { usePerformance } from "@/hooks/usePerformance";
import { useRetry } from "@/hooks/useRetry";
import { useAuth } from "@clerk/clerk-expo";

export default function HomeScreen() {
 
  const theme = useTheme();
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);

  // Performance monitoring
  const performance = usePerformance('HomeScreen', {
    trackRenders: true,
    trackApiCalls: true,
    logToConsole: true,
  });
  
  // Retry logic for failed API calls
  const retry = useRetry({ maxAttempts: 3, delay: 1000 });

  // Custom hooks for data management
  const { pets, isLoading: isLoadingPets, refetch: refetchPets, togglePetFavorite } = usePets();
  const { userLocation, hasLocationPermission } = useLocation();
  const { isLoading: isLoadingUser } = useUser();

  // Custom hooks for business logic
  const {
    searchQuery,
    filters,
    filteredPets,
    handleSearch,
    handleRemoveFilter,
    handleClearFilters,
    handleApplyFilters,
    sortByDistance,
  } = usePetFilters(pets, userLocation);

  const {
    showMap,
    handleToggleMap,
    handleCloseMap,
    handleSelectPetFromMap,
  } = useMapToggle(hasLocationPermission);

  // Refresh pets when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetchPets();
    }, [refetchPets])
  );

  // Show loading state only if we're still checking user or loading pets
  if (isLoadingUser || isLoadingPets) {
    return (
      <SafeAreaView edges={['left','right','bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  // Show map view
  if (showMap) {
    return (
      <PetMapView
        pets={filteredPets}
        userLocation={userLocation}
        onPetSelect={handleSelectPetFromMap}
        onClose={handleCloseMap}
      />
    );
  }

  // Handle filter application with location permission check
  const handleApplyFiltersWithPermission = (newFilters: any) => {
    if (newFilters.distance && !hasLocationPermission) {
      Alert.alert(
        "Permissão de localização necessária",
        "Para filtrar por distância, precisamos da sua localização. Por favor, conceda permissão nas configurações do seu dispositivo.",
        [{ text: "OK" }]
      );
      return;
    }
    handleApplyFilters(newFilters);
  };

  return (
    <SafeAreaView edges={['left','right','bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SearchFilterHeader
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onFilterPress={() => setFilterModalVisible(true)}
        onMapPress={handleToggleMap}
      />

      <ActiveFilters
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        onClearFilters={handleClearFilters}
      />

      <ResultsHeader
        petsCount={filteredPets.length}
        userLocation={userLocation}
        onSortByDistance={sortByDistance}
      />

      <FlatList
        data={filteredPets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PetCard 
            pet={item} 
            userLocation={userLocation!} 
            onFavoriteToggle={togglePetFavorite}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState onClearFilters={handleClearFilters} />}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApplyFilters={handleApplyFiltersWithPermission}
        hasLocationPermission={hasLocationPermission}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
});

