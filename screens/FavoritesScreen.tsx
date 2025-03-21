"use client"

import type React from "react"
import { View, Text, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, type ListRenderItem } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useTheme } from "../context/ThemeContext"
import { useFavorites } from "../context/FavoritesContext"
import type { Pet } from "../data/pets"
import type { FavoritesScreenNavigationProp } from "../types/navigation"
import ImageCarousel from "../components/ImageCarousel"

type FavoritesScreenProps = {
  navigation: FavoritesScreenNavigationProp
}

const FavoritesScreen: React.FC<FavoritesScreenProps> = ({ navigation }) => {
  const theme = useTheme()
  const { favoritePets, removeFavorite, isLoading } = useFavorites()

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
      <View style={styles.imageContainer}>
        <ImageCarousel
          images={item.images}
          height={200}
          showControls={true}
          showIndicators={true}
          onImagePress={() => navigation.navigate("PetDetail", item)}
        />
        <TouchableOpacity
          style={[styles.favoriteButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => removeFavorite(item.id)}
        >
          <MaterialCommunityIcons name="heart" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        <View style={[styles.imageCountBadge, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.imageCountText, { color: theme.colors.text }]}>{item.images.length} fotos</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={[styles.petName, { color: theme.colors.text }]}>{item.name}</Text>
            <Text style={[styles.petBreed, { color: theme.colors.text }]}>{item.breed}</Text>
          </View>
        </View>
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
      <MaterialCommunityIcons name="heart" size={64} color={theme.colors.primary} style={styles.emptyIcon} />
      <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Nenhum favorito ainda</Text>
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        Adicione pets aos seus favoritos para encontrá-los facilmente depois.
      </Text>
      <TouchableOpacity
        style={[styles.browseButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("HomeTab")}
      >
        <Text style={[styles.browseButtonText, { color: theme.colors.text }]}>Explorar Pets</Text>
      </TouchableOpacity>
    </View>
  )

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Carregando favoritos...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={favoritePets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPetCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyList}
        ListHeaderComponent={
          favoritePets.length > 0 ? (
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Seus Favoritos</Text>
              <Text style={[styles.headerSubtitle, { color: theme.colors.text }]}>
                {favoritePets.length} {favoritePets.length === 1 ? "pet salvo" : "pets salvos"}
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    marginTop: 100,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
})

export default FavoritesScreen

