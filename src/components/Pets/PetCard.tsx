import { MaterialCommunityIcons, Feather } from "@expo/vector-icons"
import React, { useMemo, useState } from "react"
import { Text, TouchableOpacity, View, StyleSheet, ActivityIndicator } from "react-native"
import { useTheme } from "@/contexts/ThemeContext"
import { useRouter } from "expo-router"
import { Pet } from "@/data/pets"
import { calculateDistance, Coordinates } from "@/utils/locationUtils"
import ImageCarousel from "../ImageCarousel"
import { setPetFavorite } from "@/services/petService"
import { useToast } from "@/hooks/useToast"

export type PetCardProps = {
    pet: Pet
    userLocation: Coordinates
    onFavoriteToggle?: (petId: string) => void
}

const PetCard = React.memo(({ pet, userLocation, onFavoriteToggle }: PetCardProps) => {
    const petIsFavorite = pet.isFavorite;
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
    const theme = useTheme()
    const router = useRouter();
    const { showToast } = useToast();

    // Memoize distance calculation
    const petDistance = useMemo(() => {
        if (!userLocation) return "";
    
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          pet.coordinates.latitude,
          pet.coordinates.longitude,
        )
    
        return distance.toFixed(1);
    }, [userLocation, pet.coordinates.latitude, pet.coordinates.longitude]);

    // Memoize card styles
    const cardStyles = useMemo(() => [
        styles.card,
        {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            borderRadius: theme.borderRadius.md,
        },
    ], [theme.colors.card, theme.colors.border, theme.borderRadius.md]);

    // Memoize favorite button styles
    const favoriteButtonStyles = useMemo(() => [
        styles.favoriteButton,
        {
            backgroundColor: petIsFavorite ? theme.colors.primary : "rgba(255, 255, 255, 0.8)",
        },
    ], [petIsFavorite, theme.colors.primary]);

    // Memoize image count badge styles
    const imageCountBadgeStyles = useMemo(() => [
        styles.imageCountBadge, 
        { backgroundColor: theme.colors.primary }
    ], [theme.colors.primary]);

    // Memoize location container styles
    const locationContainerStyles = useMemo(() => [
        styles.locationContainer, 
        { backgroundColor: theme.colors.secondary }
    ], [theme.colors.secondary]);

    return (
      <TouchableOpacity
        style={cardStyles}
        onPress={() => {
          router.push(`/pet-detail?petId=${pet.id}`);
        }}
      >
        <View style={styles.imageContainer}>
          <ImageCarousel
            images={pet.images}
            height={200}
            showControls={true}
            showIndicators={true}
            onImagePress={() => {}}
          />
          <TouchableOpacity
            style={favoriteButtonStyles}
            onPress={async (e) => {
              e.stopPropagation();
              if (isTogglingFavorite) return;
              
              setIsTogglingFavorite(true);
              try {
                const result = await setPetFavorite(pet.id);
                if (result.success) {
                  // Update local state
                  onFavoriteToggle?.(pet.id);
                  showToast(
                    petIsFavorite 
                      ? "Pet removido dos favoritos" 
                      : "Pet adicionado aos favoritos",
                    "success"
                  );
                } else {
                  showToast(
                    result.errors?.join(", ") || "Erro ao atualizar favoritos. Tente novamente.",
                    "failure"
                  );
                }
              } catch (error) {
                showToast(
                  "Erro ao atualizar favoritos. Tente novamente.",
                  "failure"
                );
              } finally {
                setIsTogglingFavorite(false);
              }
            }}
            disabled={isTogglingFavorite}
          >
            {isTogglingFavorite ? (
              <ActivityIndicator 
                size="small" 
                color={petIsFavorite ? theme.colors.text : theme.colors.primary}
              />
            ) : (
              <MaterialCommunityIcons
                name={petIsFavorite ? "heart" : "heart-outline"}
                size={20}
                color={petIsFavorite ? theme.colors.text : theme.colors.primary}
              />
            )}
          </TouchableOpacity>
          <View style={imageCountBadgeStyles}>
            <Text style={[styles.imageCountText, { color: theme.colors.text }]}>{pet.images.length} fotos</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.petName, { color: theme.colors.text }]}>{pet.name}</Text>
          <Text style={[styles.petBreed, { color: theme.colors.text }]}>{pet.breed}</Text>
          <View style={styles.petInfo}>
            <Text style={[styles.petAge, { color: theme.colors.text }]}>{pet.age} anos</Text>
            <View style={locationContainerStyles}>
              <Text style={[styles.petLocation, { color: theme.colors.text }]}>{pet.location}</Text>
            </View>
          </View>

          {userLocation && (
            <View style={styles.distanceContainer}>
              <Feather name="map-pin" size={14} color={theme.colors.text} style={styles.distanceIcon} />
              <Text style={[styles.distanceText, { color: theme.colors.text }]}>{petDistance} km</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
});

PetCard.displayName = 'PetCard';

export default PetCard;

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