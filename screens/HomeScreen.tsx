"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  type ListRenderItem,
  Alert,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { petData, type Pet } from "../data/pets"
import type { HomeScreenNavigationProp, HomeScreenRouteProp } from "../types/navigation"
import FilterModal from "../components/FilterModal"
import ActiveFilters from "../components/ActiveFilters"
import PetMapView from "../components/PetMapView"
import { type FilterOptions, emptyFilters, matchesFilters } from "../types/filters"
import { LocationService } from "../services/LocationService"
import type { Coordinates } from "../types/location"
import { useFavorites } from "../context/FavoritesContext"
import ImageCarousel from "../components/ImageCarousel"
import { useRoute } from "@react-navigation/native"

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const theme = useTheme()
  const route = useRoute<HomeScreenRouteProp>()
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filters, setFilters] = useState<FilterOptions>(emptyFilters)
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false)
  const [filteredPets, setFilteredPets] = useState<Pet[]>(petData)
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null)
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false)
  const [showMap, setShowMap] = useState<boolean>(false)

  const { isFavorite, addFavorite, removeFavorite } = useFavorites()

  // Request location permission on mount
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

  // Check for filters from route params
  useEffect(() => {
    // Safely access route params
    const routeParams = route.params || {}
    const routeFilters = routeParams.filters
    const routeSearchQuery = routeParams.searchQuery

    if (routeFilters) {
      // If distance filter is applied but no location permission, show alert
      if (routeFilters.distance && !hasLocationPermission) {
        Alert.alert(
          "Permissão de localização necessária",
          "Para filtrar por distância, precisamos da sua localização. Por favor, conceda permissão nas configurações do seu dispositivo.",
          [
            {
              text: "OK",
              onPress: () => {
                // Apply filters without the distance filter
                const filtersWithoutDistance = {
                  ...routeFilters,
                  distance: "",
                }
                setFilters(filtersWithoutDistance)
              },
            },
          ],
        )
      } else {
        setFilters(routeFilters)
      }
    }

    if (routeSearchQuery) {
      setSearchQuery(routeSearchQuery)
    }
  }, [route.params, hasLocationPermission])

  // Apply both search and filters whenever they change
  useEffect(() => {
    applyFiltersAndSearch()
  }, [searchQuery, filters, userLocation])

  const applyFiltersAndSearch = () => {
    let results = petData

    // Apply filters
    results = results.filter((pet) => matchesFilters(pet, filters, userLocation))

    // Apply search query
    if (searchQuery) {
      results = results.filter(
        (pet) =>
          pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pet.type.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredPets(results)
  }

  const handleSearch = (text: string): void => {
    setSearchQuery(text)
  }

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

  const handleRemoveFilter = (category: keyof FilterOptions, value: string) => {
    if (category === "distance") {
      setFilters((prev) => ({
        ...prev,
        distance: "",
      }))
    } else {
      setFilters((prev) => ({
        ...prev,
        [category]: prev[category].filter((item) => item !== value),
      }))
    }
  }

  const handleClearFilters = () => {
    setFilters(emptyFilters)
  }

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
  }

  const handleSelectPetFromMap = (pet: Pet) => {
    navigation.navigate("PetDetail", pet)
    setShowMap(false)
  }

  const renderPetCard: ListRenderItem<Pet> = ({ item }) => {
    const petIsFavorite = isFavorite(item.id)

    return (
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderRadius: theme.borderRadius.md,
          },
        ]}
        onPress={() => navigation.navigate("PetDetail", item)}
      >
        <View style={styles.imageContainer}>
          <ImageCarousel
            images={item.images}
            height={200}
            showControls={true}
            showIndicators={true}
            onImagePress={() => navigation.navigate("PetDetail", item)}
          />
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              {
                backgroundColor: petIsFavorite ? theme.colors.primary : "rgba(255, 255, 255, 0.8)",
              },
            ]}
            onPress={() => {
              if (petIsFavorite) {
                removeFavorite(item.id)
              } else {
                addFavorite(item.id)
              }
            }}
          >
            <MaterialCommunityIcons
              name={petIsFavorite ? "heart" : "heart-outline"}
              size={20}
              color={petIsFavorite ? theme.colors.text : theme.colors.primary}
            />
          </TouchableOpacity>
          <View style={[styles.imageCountBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.imageCountText, { color: theme.colors.text }]}>{item.images.length} fotos</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.petName, { color: theme.colors.text }]}>{item.name}</Text>
          <Text style={[styles.petBreed, { color: theme.colors.text }]}>{item.breed}</Text>
          <View style={styles.petInfo}>
            <Text style={[styles.petAge, { color: theme.colors.text }]}>{item.age} anos</Text>
            <View style={[styles.locationContainer, { backgroundColor: theme.colors.secondary }]}>
              <Text style={[styles.petLocation, { color: theme.colors.text }]}>{item.location}</Text>
            </View>
          </View>

          {userLocation && (
            <View style={styles.distanceContainer}>
              <Feather name="map-pin" size={14} color={theme.colors.text} style={styles.distanceIcon} />
              <Text style={[styles.distanceText, { color: theme.colors.text }]}>{calculatePetDistance(item)} km</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  const calculatePetDistance = (pet: Pet): string => {
    if (!userLocation) return ""

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      pet.coordinates.latitude,
      pet.coordinates.longitude,
    )

    return distance.toFixed(1)
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return d
  }

  const deg2rad = (deg: number): number => {
    return deg * (Math.PI / 180)
  }

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>Nenhum pet encontrado com os filtros atuais.</Text>
      <TouchableOpacity
        style={[styles.clearFiltersButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleClearFilters}
      >
        <Text style={[styles.clearFiltersText, { color: theme.colors.text }]}>Limpar Filtros</Text>
      </TouchableOpacity>
    </View>
  )

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
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

      <ActiveFilters filters={filters} onRemoveFilter={handleRemoveFilter} onClearFilters={handleClearFilters} />

      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsText, { color: theme.colors.text }]}>
          {filteredPets.length} {filteredPets.length === 1 ? "pet encontrado" : "pets encontrados"}
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
                  a.coordinates.longitude,
                )
                const distanceB = calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  b.coordinates.latitude,
                  b.coordinates.longitude,
                )
                return distanceA - distanceB
              })
              setFilteredPets(sortedPets)
            }}
          >
            <Text style={[styles.sortText, { color: theme.colors.text }]}>Ordenar por distância</Text>
            <Feather name="arrow-down" size={14} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredPets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPetCard}
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
  )
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
})

export default HomeScreen

