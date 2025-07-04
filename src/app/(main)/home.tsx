// app/(main)/home.tsx
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useCallback, useEffect, useState } from "react";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Feather } from "@expo/vector-icons";
import ActiveFilters, {
  emptyFilters,
  FilterOptions,
} from "@/components/Pets/ActiveFilters";
import { Pet } from "@/models/pet";
import { calculateDistance, Coordinates } from "@/types/location";
import PetCard from "@/components/Pets/PetCard";
import FilterModal from "@/components/Pets/FilterModal";
import { LocationService } from "@/services/locationService";
import PetMapView from "@/components/Pets/PetMapView";
import { getPets } from "@/services/petService";
import { PetDTO } from "@/dtos/pet/petDto";
import React from "react";

// Geocoding function to get coordinates from address
const getCoordinatesFromAddress = async (cep: string, address: string, city: string, state: string): Promise<{latitude: number, longitude: number} | null> => {
  try {
    // Use Google Geocoding API
    const addressString = `${address}, ${city}, ${state}, Brasil`;
    const encodedAddress = encodeURIComponent(addressString);
    
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API}`);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      console.log('Coordinates found:', location.lat, location.lng);
      return {
        latitude: location.lat,
        longitude: location.lng
      };
    }
    
    console.log('No coordinates found for address:', addressString);
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
};

export default function HomeScreen() {
  const { signOut,  userId } = useAuth();
  const { getUser } = useUserAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [filteredPets, setFilteredPets] = useState<Pet[]>([]);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false)
  const [showMap, setShowMap] = useState<boolean>(false)
  const [isLoadingPets, setIsLoadingPets] = useState<boolean>(true);

  const [filters, setFilters] = useState<FilterOptions>({
    petType: [],
    gender: [],
    size: [],
    ageRange: [],
    location: [],
    distance: "",
  });

  // Convert PetDTO to Pet model with coordinates
  const convertPetDTOToPet = async (petDTO: PetDTO): Promise<Pet> => {
    // Get coordinates from address
    const coordinates = await getCoordinatesFromAddress(
      petDTO.cep,
      petDTO.address,
      petDTO.city,
      petDTO.state
    );

    return {
      id: parseInt(petDTO.id), // Convert string to number
      name: petDTO.name,
      type: petDTO.type.name,
      breed: petDTO.breed.name,
      size: petDTO.size.toString(), // Convert enum to string
      age: petDTO.age,
      gender: "Não informado", // PetDTO doesn't have gender, using default
      location: `${petDTO.city}`, // Combine city and state
      coordinates: coordinates || {
        latitude: 0, // Default if no coordinates found
        longitude: 0,
      },
      description: petDTO.bio, // Map bio to description
      contactName: "Não informado", // PetDTO doesn't have contact info
      contactPhone: "Não informado",
      imageUrl: petDTO.petImages?.[0]?.imageUrl || "", // First image as main image
      images: petDTO.petImages?.map(img => img.imageUrl) || [],
    };
  };

  // Fetch pets from API
  const fetchPets = async () => {
    try {
      setIsLoadingPets(true);
      const result = await getPets();
      
      if (result.success && result.value) {
        // Convert all pets with coordinates
        const petsPromises = result.value.map(convertPetDTOToPet);
        const pets = await Promise.all(petsPromises);
        
        setAllPets(pets);
        setFilteredPets(pets);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
      Alert.alert('Erro', 'Erro ao carregar pets. Tente novamente.');
    } finally {
      setIsLoadingPets(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    async function getMe() {
      setIsLoading(true);
      const userDto = await getUser(userId!);
      if (!userDto) router.push("/(main)/profile-setup");
      setIsLoading(false);
    }
    getMe();
  }, []); // Empty dependency array to run only once

  // Fetch pets when component mounts
  useEffect(() => {
    fetchPets();
  }, []);

  useEffect(() => {
    const requestLocationPermission = async () => {
      const hasPermission = await LocationService.requestPermissions()
      setHasLocationPermission(hasPermission)

      if (hasPermission) {
        const location = await LocationService.getCurrentLocation()
        setUserLocation(location)
      }
    }

    requestLocationPermission()
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [])
  );

  if (isLoading || isLoadingPets) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            {isLoading ? 'Carregando perfil...' : 'Carregando pets...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSearch = (text: string): void => {
    setSearchQuery(text);
  };

  const handleToggleMap = () => {
    if (!showMap && !hasLocationPermission) {
      Alert.alert(
        "Permissão de localização recomendada",
        "Para uma melhor experiência com o mapa, recomendamos conceder permissão de localização. Deseja continuar mesmo assim?",
        [
          {
            text: "Cancelar",
            style: "cancel",
          },
          {
            text: "Continuar",
            onPress: () => setShowMap(true),
          },
        ],
      )
    } else {
      setShowMap(!showMap)
    }
  };

  const handleRemoveFilter = (category: keyof FilterOptions, value: string) => {
    if (category === "distance") {
      setFilters((prev) => ({
        ...prev,
        distance: "",
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [category]: prev[category].filter((item) => item !== value),
      }));
    }
  };

  const handleClearFilters = () => {
    setFilters(emptyFilters);
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        Nenhum pet encontrado com os filtros atuais.
      </Text>
      <TouchableOpacity
        style={[
          styles.clearFiltersButton,
          { backgroundColor: theme.colors.primary },
        ]}
        onPress={handleClearFilters}
      >
        <Text style={[styles.clearFiltersText, { color: theme.colors.text }]}>
          Limpar Filtros
        </Text>
      </TouchableOpacity>
    </View>
  );

  const handleApplyFilters = (newFilters: FilterOptions) => {
    // If distance filter is applied but no location permission, show alert
    if (newFilters.distance && !hasLocationPermission) {
      Alert.alert(
        "Permissão de localização necessária",
        "Para filtrar por distância, precisamos da sua localização. Por favor, conceda permissão nas configurações do seu dispositivo.",
        [{ text: "OK" }],
      )
      return
    }

    setFilters(newFilters)
  }

  const handleSelectPetFromMap = (pet: Pet) => {
    setShowMap(false)
  }

  if (showMap) {
    return (
      <PetMapView
        pets={filteredPets}
        userLocation={userLocation}
        onPetSelect={handleSelectPetFromMap}
        onClose={() => setShowMap(false)}
      />
    )
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
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
            onChangeText={handleSearch}
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
          onPress={() => setFilterModalVisible(true)}
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
          onPress={handleToggleMap}
        >
          <Feather name="map" size={20} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ActiveFilters
        filters={filters}
        onRemoveFilter={handleRemoveFilter}
        onClearFilters={handleClearFilters}
      />

      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsText, { color: theme.colors.text }]}>
          {filteredPets.length}{" "}
          {filteredPets.length === 1 ? "pet encontrado" : "pets encontrados"}
        </Text>

        {userLocation && (
          <TouchableOpacity
            style={styles.sortButton}
            onPress={() => {
              // Sort pets by distance
              const sortedPets = [...filteredPets].sort((a, b) => {
                const distanceA = calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  a.coordinates.latitude,
                  a.coordinates.longitude
                );
                const distanceB = calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  b.coordinates.latitude,
                  b.coordinates.longitude
                );
                return distanceA - distanceB;
              });
              setFilteredPets(sortedPets);
            }}
          >
            <Text style={[styles.sortText, { color: theme.colors.text }]}>
              Ordenar por distância
            </Text>
            <Feather name="arrow-down" size={14} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredPets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PetCard pet={item} userLocation={userLocation!} />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
      />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        hasLocationPermission={hasLocationPermission}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchFilterContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    marginBottom: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  cardContent: {
    padding: 16,
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 16,
    marginBottom: 8,
  },
  petInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  petAge: {
    fontSize: 14,
  },
  locationContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  petLocation: {
    fontSize: 12,
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  distanceIcon: {
    marginRight: 4,
  },
  distanceText: {
    fontSize: 12,
  },
  resultsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultsText: {
    fontSize: 14,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortText: {
    fontSize: 12,
    marginRight: 4,
  },
  emptyContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  clearFiltersButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  clearFiltersText: {
    fontWeight: "bold",
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageCountBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  imageCountText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
});
