"use client"
import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import type { AdvancedSearchScreenNavigationProp } from "../types/navigation"

type AdvancedSearchScreenProps = {
  navigation: AdvancedSearchScreenNavigationProp
}

const AdvancedSearchScreen: React.FC<AdvancedSearchScreenProps> = ({ navigation }) => {
  const theme = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([])
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [maxDistance, setMaxDistance] = useState("")

  const toggleSelection = (
    value: string,
    currentSelections: string[],
    setSelections: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    if (currentSelections.includes(value)) {
      setSelections(currentSelections.filter((item) => item !== value))
    } else {
      setSelections([...currentSelections, value])
    }
  }

  const handleSearch = () => {
    // Create a filter object based on selections
    const filters = {
      petType: selectedTypes,
      gender: selectedGenders,
      size: selectedSizes,
      ageRange: selectedAgeRanges,
      location: selectedLocations,
      distance: maxDistance,
    }

    // Navigate to home screen with filters and search query
    navigation.navigate("Main", {
      filters,
      searchQuery,
    })
  }

  const renderFilterOption = (label: string, value: string, isSelected: boolean, onToggle: () => void) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        {
          backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onToggle}
    >
      <Text
        style={[
          styles.filterOptionText,
          {
            color: theme.colors.text,
            fontWeight: isSelected ? "bold" : "normal",
          },
        ]}
      >
        {label}
      </Text>
      {isSelected && <Feather name="check" size={16} color={theme.colors.text} />}
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Busca Avançada</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            Utilize os filtros abaixo para encontrar o pet ideal
          </Text>
        </View>

        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchInputContainer,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
          >
            <Feather name="search" size={20} color={theme.colors.text} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: theme.colors.text }]}
              placeholder="Buscar por nome, raça..."
              placeholderTextColor={`${theme.colors.text}80`}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Tipo de Pet</Text>
            <View style={styles.filterOptionsContainer}>
              {["Cachorro", "Gato", "Ave", "Roedor", "Outro"].map((type) =>
                renderFilterOption(type, type, selectedTypes.includes(type), () =>
                  toggleSelection(type, selectedTypes, setSelectedTypes),
                ),
              )}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Sexo</Text>
            <View style={styles.filterOptionsContainer}>
              {["Macho", "Fêmea"].map((gender) =>
                renderFilterOption(gender, gender, selectedGenders.includes(gender), () =>
                  toggleSelection(gender, selectedGenders, setSelectedGenders),
                ),
              )}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Porte</Text>
            <View style={styles.filterOptionsContainer}>
              {["Pequeno", "Médio", "Grande"].map((size) =>
                renderFilterOption(size, size, selectedSizes.includes(size), () =>
                  toggleSelection(size, selectedSizes, setSelectedSizes),
                ),
              )}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Idade</Text>
            <View style={styles.filterOptionsContainer}>
              {[
                { label: "Filhote (< 1 ano)", value: "0-1" },
                { label: "Jovem (1-3 anos)", value: "1-3" },
                { label: "Adulto (4-8 anos)", value: "4-8" },
                { label: "Idoso (9+ anos)", value: "9+" },
              ].map((age) =>
                renderFilterOption(age.label, age.value, selectedAgeRanges.includes(age.value), () =>
                  toggleSelection(age.value, selectedAgeRanges, setSelectedAgeRanges),
                ),
              )}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Localização</Text>
            <View style={styles.filterOptionsContainer}>
              {["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Brasília"].map((location) =>
                renderFilterOption(location, location, selectedLocations.includes(location), () =>
                  toggleSelection(location, selectedLocations, setSelectedLocations),
                ),
              )}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>Distância Máxima (km)</Text>
            <View style={styles.filterOptionsContainer}>
              {["5", "10", "25", "50", "100"].map((distance) =>
                renderFilterOption(`Até ${distance} km`, distance, maxDistance === distance, () =>
                  setMaxDistance(maxDistance === distance ? "" : distance),
                ),
              )}
            </View>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: theme.colors.border }]}
            onPress={() => {
              setSearchQuery("")
              setSelectedTypes([])
              setSelectedGenders([])
              setSelectedSizes([])
              setSelectedAgeRanges([])
              setSelectedLocations([])
              setMaxDistance("")
            }}
          >
            <Text style={[styles.clearButtonText, { color: theme.colors.text }]}>Limpar Filtros</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSearch}
          >
            <Text style={[styles.searchButtonText, { color: theme.colors.text }]}>Buscar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  filtersContainer: {
    flex: 1,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  filterOptionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    margin: 4,
  },
  filterOptionText: {
    marginRight: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1,
  },
  clearButtonText: {
    fontWeight: "bold",
  },
  searchButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  searchButtonText: {
    fontWeight: "bold",
  },
})

export default AdvancedSearchScreen

