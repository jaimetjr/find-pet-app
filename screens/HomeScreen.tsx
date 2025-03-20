"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  type ListRenderItem,
} from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { petData, type Pet } from "../data/pets"
import type { HomeScreenNavigationProp } from "../types/navigation"
import FilterModal from "../components/FilterModal"
import ActiveFilters from "../components/ActiveFilters"
import { type FilterOptions, emptyFilters, matchesFilters } from "../types/filters"

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const theme = useTheme()
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [filters, setFilters] = useState<FilterOptions>(emptyFilters)
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false)
  const [filteredPets, setFilteredPets] = useState<Pet[]>(petData)

  // Apply both search and filters whenever they change
  useEffect(() => {
    applyFiltersAndSearch()
  }, [searchQuery, filters])

  const applyFiltersAndSearch = () => {
    let results = petData

    // Apply filters
    results = results.filter((pet) => matchesFilters(pet, filters))

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
    setFilters(newFilters)
  }

  const handleRemoveFilter = (category: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item !== value),
    }))
  }

  const handleClearFilters = () => {
    setFilters(emptyFilters)
  }

  const renderPetCard: ListRenderItem<Pet> = ({ item }) => (
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
      <Image source={{ uri: item.imageUrl }} style={styles.petImage} resizeMode="cover" />
      <View style={styles.cardContent}>
        <Text style={[styles.petName, { color: theme.colors.text }]}>{item.name}</Text>
        <Text style={[styles.petBreed, { color: theme.colors.text }]}>{item.breed}</Text>
        <View style={styles.petInfo}>
          <Text style={[styles.petAge, { color: theme.colors.text }]}>{item.age} anos</Text>
          <View style={[styles.locationContainer, { backgroundColor: theme.colors.secondary }]}>
            <Text style={[styles.petLocation, { color: theme.colors.text }]}>{item.location}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )

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
            styles.filterButton,
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
      </View>

      <ActiveFilters filters={filters} onRemoveFilter={handleRemoveFilter} onClearFilters={handleClearFilters} />

      <View style={styles.resultsContainer}>
        <Text style={[styles.resultsText, { color: theme.colors.text }]}>
          {filteredPets.length} {filteredPets.length === 1 ? "pet encontrado" : "pets encontrados"}
        </Text>
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
  filterButton: {
    padding: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
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
  petImage: {
    width: "100%",
    height: 200,
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
  resultsContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  resultsText: {
    fontSize: 14,
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
})

export default HomeScreen

