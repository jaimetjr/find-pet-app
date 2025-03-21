"use client"

import type React from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import type { FilterOptions } from "../types/filters"

type ActiveFiltersProps = {
  filters: FilterOptions
  onRemoveFilter: (category: keyof FilterOptions, value: string) => void
  onClearFilters: () => void
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({ filters, onRemoveFilter, onClearFilters }) => {
  const theme = useTheme()

  // Get all active filters as a flat array of {category, value} objects
  const activeFilters = Object.entries(filters)
    .flatMap(([category, values]) => {
      // Handle distance filter (which is a string, not an array)
      if (category === "distance" && values) {
        return [
          {
            category: category as keyof FilterOptions,
            value: values as string,
            displayValue: getDistanceDisplayValue(values as string),
          },
        ]
      }

      // Handle array-based filters (make sure values is an array before mapping)
      if (Array.isArray(values) && values.length > 0) {
        return values.map((value) => ({
          category: category as keyof FilterOptions,
          value,
          displayValue: getDisplayValue(category as keyof FilterOptions, value),
        }))
      }

      // Return empty array if values is not valid
      return []
    })
    .filter((filter) => filter.value !== "") // Filter out empty values

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeFilters.map(({ category, value, displayValue }) => (
          <TouchableOpacity
            key={`${category}-${value}`}
            style={[styles.filterTag, { backgroundColor: theme.colors.secondary }]}
            onPress={() => onRemoveFilter(category, value)}
          >
            <Text style={[styles.filterText, { color: theme.colors.text }]}>{displayValue}</Text>
            <Feather name="x" size={14} color={theme.colors.text} />
          </TouchableOpacity>
        ))}

        {activeFilters.length > 0 && (
          <TouchableOpacity style={[styles.clearButton, { borderColor: theme.colors.border }]} onPress={onClearFilters}>
            <Text style={[styles.clearText, { color: theme.colors.text }]}>Limpar todos</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  )
}

// Helper function to convert raw filter values to display labels
function getDisplayValue(category: keyof FilterOptions, value: string): string {
  // Age range needs special handling
  if (category === "ageRange") {
    switch (value) {
      case "0-1":
        return "Filhote"
      case "1-3":
        return "Jovem"
      case "4-8":
        return "Adulto"
      case "9+":
        return "Idoso"
      default:
        return value
    }
  }

  // For locations, we might want to strip the state code
  if (category === "location" && value.includes(",")) {
    return value.split(",")[0].trim()
  }

  return value
}

// Helper function to convert distance values to display labels
function getDistanceDisplayValue(value: string): string {
  if (!value) return ""

  return `Até ${value} km`
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  filterTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  filterText: {
    marginRight: 6,
    fontSize: 12,
    fontWeight: "500",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  clearText: {
    fontSize: 12,
    fontWeight: "500",
  },
})

export default ActiveFilters

