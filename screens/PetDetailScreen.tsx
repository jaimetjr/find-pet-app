"use client"

import type React from "react"
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { useTheme } from "../context/ThemeContext"
import type { PetDetailScreenRouteProp } from "../types/navigation"

const { width } = Dimensions.get("window")

type PetDetailScreenProps = {
  route: PetDetailScreenRouteProp
}

type InfoItemProps = {
  label: string
  value: string
  theme: ReturnType<typeof useTheme>
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, theme }) => (
  <View style={styles.infoItem}>
    <Text style={[styles.infoLabel, { color: theme.colors.text }]}>{label}</Text>
    <Text style={[styles.infoValue, { color: theme.colors.text }]}>{value}</Text>
  </View>
)

const PetDetailScreen: React.FC<PetDetailScreenProps> = ({ route }) => {
  const pet = route.params
  const theme = useTheme()

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Image source={{ uri: pet.imageUrl }} style={styles.petImage} resizeMode="cover" />

      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.petName, { color: theme.colors.text }]}>{pet.name}</Text>
            <Text style={[styles.petBreed, { color: theme.colors.text }]}>{pet.breed}</Text>
          </View>
          <View style={[styles.ageContainer, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.ageText, { color: theme.colors.text }]}>{pet.age} anos</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <InfoItem label="Sexo" value={pet.gender} theme={theme} />
          <InfoItem label="Porte" value={pet.size} theme={theme} />
          <InfoItem label="Localização" value={pet.location} theme={theme} />
        </View>

        <View style={styles.descriptionSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sobre</Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>{pet.description}</Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Contato</Text>
          <Text style={[styles.contactInfo, { color: theme.colors.text }]}>
            {pet.contactName} • {pet.contactPhone}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.adoptButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => alert(`Iniciando processo de adoção para ${pet.name}!`)}
        >
          <Text style={[styles.adoptButtonText, { color: theme.colors.text }]}>Quero Adotar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  petImage: {
    width: width,
    height: width * 0.8,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  petName: {
    fontSize: 24,
    fontWeight: "bold",
  },
  petBreed: {
    fontSize: 16,
    marginTop: 4,
  },
  ageContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  ageText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  infoSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  contactSection: {
    marginBottom: 24,
  },
  contactInfo: {
    fontSize: 16,
  },
  adoptButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  adoptButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
})

export default PetDetailScreen

