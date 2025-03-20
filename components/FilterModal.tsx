"use client"

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, SafeAreaView } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import type { FilterOptions } from "../types/filters"

type FilterModalProps = {
  visible: boolean
  onClose: () => void
  filters: FilterOptions
  onApplyFilters: (filters: FilterOptions) => void
}

const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose, filters, onApplyFilters }) => {
  const theme = useTheme()
  const [tempFilters, setTempFilters] = React.useState<FilterOptions>(filters)

  React.useEffect(() => {
    setTempFilters(filters)
  }, [filters, visible])

  const handleSelectFilter = (category: keyof FilterOptions, value: string) => {
    setTempFilters((prev) => {
      // If the value is already selected, remove it
      if (prev[category].includes(value)) {
        return {
          ...prev,
          [category]: prev[category].filter((item) => item !== value),
        }
      }
      // Otherwise, add it
      return {
        ...prev,
        [category]: [...prev[category], value],
      }
    })
  }

  const handleClearFilters = () => {
    setTempFilters({
      petType: [],
      gender: [],
      size: [],
      ageRange: [],
      location: [],
    })
  }

  const handleApplyFilters = () => {
    onApplyFilters(tempFilters)
    onClose()
  }

  const isFilterSelected = (category: keyof FilterOptions, value: string) => {
    return tempFilters[category].includes(value)
  }

  const FilterOption = ({
    category,
    value,
    label,
  }: {
    category: keyof FilterOptions
    value: string
    label: string
  }) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        {
          backgroundColor: isFilterSelected(category, value) ? theme.colors.primary : theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={() => handleSelectFilter(category, value)}
    >
      <Text
        style={[
          styles.filterOptionText,
          {
            color: isFilterSelected(category, value) ? theme.colors.text : theme.colors.text,
            fontWeight: isFilterSelected(category, value) ? "bold" : "normal",
          },
        ]}
      >
        {label}
      </Text>
      {isFilterSelected(category, value) && <Feather name="check" size={16} color={theme.colors.text} />}
    </TouchableOpacity>
  )

  const FilterSection = ({
    title,
    category,
    options,
  }: {
    title: string
    category: keyof FilterOptions
    options: { value: string; label: string }[]
  }) => (
    <View style={styles.filterSection}>
      <Text style={[styles.filterSectionTitle, { color: theme.colors.text }]}>{title}</Text>
      <View style={styles.filterOptionsContainer}>
        {options.map((option) => (
          <FilterOption key={option.value} category={category} value={option.value} label={option.label} />
        ))}
      </View>
    </View>
  )

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Filtrar Pets</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filtersScrollView}>
              <FilterSection
                title="Tipo de Pet"
                category="petType"
                options={[
                  { value: "Cachorro", label: "Cachorro" },
                  { value: "Gato", label: "Gato" },
                  { value: "Ave", label: "Ave" },
                  { value: "Roedor", label: "Roedor" },
                  { value: "Outro", label: "Outro" },
                ]}
              />

              <FilterSection
                title="Sexo"
                category="gender"
                options={[
                  { value: "Macho", label: "Macho" },
                  { value: "Fêmea", label: "Fêmea" },
                ]}
              />

              <FilterSection
                title="Porte"
                category="size"
                options={[
                  { value: "Pequeno", label: "Pequeno" },
                  { value: "Médio", label: "Médio" },
                  { value: "Grande", label: "Grande" },
                ]}
              />

              <FilterSection
                title="Idade"
                category="ageRange"
                options={[
                  { value: "0-1", label: "Filhote (< 1 ano)" },
                  { value: "1-3", label: "Jovem (1-3 anos)" },
                  { value: "4-8", label: "Adulto (4-8 anos)" },
                  { value: "9+", label: "Idoso (9+ anos)" },
                ]}
              />

              <FilterSection
                title="Localização"
                category="location"
                options={[
                  { value: "São Paulo", label: "São Paulo" },
                  { value: "Rio de Janeiro", label: "Rio de Janeiro" },
                  { value: "Belo Horizonte", label: "Belo Horizonte" },
                  { value: "Curitiba", label: "Curitiba" },
                  { value: "Brasília", label: "Brasília" },
                ]}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.footerButton, styles.clearButton, { borderColor: theme.colors.border }]}
                onPress={handleClearFilters}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>Limpar Filtros</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.footerButton, styles.applyButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleApplyFilters}
              >
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  filtersScrollView: {
    flex: 1,
  },
  filterSection: {
    marginBottom: 24,
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
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  clearButton: {
    marginRight: 8,
    borderWidth: 1,
  },
  applyButton: {
    marginLeft: 8,
  },
  buttonText: {
    fontWeight: "bold",
  },
})

export default FilterModal

