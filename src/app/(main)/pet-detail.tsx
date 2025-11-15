import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import ImageCarousel from '@/components/ImageCarousel';
import { Pet } from '@/data/pets';
import { calculateDistance, Coordinates, getCoordinatesFromAddress } from '@/utils/locationUtils';
import { useLocation } from '@/hooks/useLocation';
import { getPet, setPetFavorite } from '@/services/petService';
import { PetDTO } from '@/dtos/pet/petDto';
import { PetGender } from '@/enums/petGender-enum';
import { PetSizeHelper } from '@/enums/petSize-enum';
import { ContactType } from '@/enums/contactType';
import { useToast } from '@/hooks/useToast';

export default function PetDetailScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { userLocation } = useLocation();
  const [pet, setPet] = useState<PetDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [petCoordinates, setPetCoordinates] = useState<Coordinates | null>(null);
  const { showToast } = useToast();

  // Fetch pet data function
  const fetchPet = useCallback(async (showLoading = true) => {
    if (!petId) {
      setError('Pet ID is required');
      setLoading(false);
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      const result = await getPet(petId);
      if (result.success) {
        setPet(result.value);
        
        // Calculate coordinates from pet address
        if (result.value) {
          const coordinates = await getCoordinatesFromAddress(
            result.value.cep,
            result.value.address,
            result.value.city,
            result.value.state
          );
          setPetCoordinates(coordinates);
        }
      } else {
        setError(result.errors.join(', ') || 'Failed to load pet details');
      }
    } catch (err) {
      setError('Failed to load pet details');
      console.error('Error fetching pet:', err);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [petId]);

  // Fetch pet data on component mount
  useEffect(() => {
    fetchPet(true); // Show loading on initial fetch
  }, [fetchPet]);

  // Refetch pet data when screen comes into focus (to get updated favorite status)
  // Silent refresh - don't show loading if we already have pet data
  useFocusEffect(
    useCallback(() => {
      if (pet) {
        fetchPet(false); // Silent refresh if we already have data
      }
    }, [fetchPet, pet])
  );

  // Calculate favorite status from petFavorites
  const petIsFavorite = useMemo(() => {
    return pet?.petFavorites?.some(favorite => favorite.isFavorite === true) || false;
  }, [pet?.petFavorites]);

  // Calculate distance if user location and pet coordinates are available
  const petDistance = useMemo(() => {
    if (!userLocation || !petCoordinates) return null;
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      petCoordinates.latitude,
      petCoordinates.longitude,
    );
    
    return distance.toFixed(1);
  }, [userLocation, petCoordinates]);

  // Memoize styles
  const containerStyles = useMemo(() => [
    styles.container,
    { backgroundColor: theme.colors.background }
  ], [theme.colors.background]);

  const cardStyles = useMemo(() => [
    styles.card,
    { backgroundColor: theme.colors.card, borderColor: theme.colors.border }
  ], [theme.colors.card, theme.colors.border]);

  const favoriteButtonStyles = useMemo(() => [
    styles.favoriteButton,
    {
      backgroundColor: petIsFavorite ? theme.colors.primary : "rgba(255, 255, 255, 0.9)",
    },
  ], [petIsFavorite, theme.colors.primary]);

  const contactButtonStyles = useMemo(() => [
    styles.contactButton,
    { backgroundColor: theme.colors.primary }
  ], [theme.colors.primary]);

  const handleCall = () => {
    if (!pet?.user?.phone) {
      Alert.alert('Erro', 'Telefone não disponível');
      return;
    }
    Linking.openURL(`tel:${pet.user.phone}`).catch(() => {
      Alert.alert('Erro', 'Não foi possível fazer a chamada');
    });
  };

  const handleWhatsApp = () => {
    if (!pet?.user?.phone) {
      Alert.alert('Erro', 'Telefone não disponível');
      return;
    }
    const message = `Olá! Vi o ${pet.name} no Find Pet e gostaria de saber mais sobre ele.`;
    const whatsappUrl = `whatsapp://send?phone=${pet.user.phone.replace(/\D/g, '')}&text=${encodeURIComponent(message)}`;
    
    Linking.openURL(whatsappUrl).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp');
    });
  };

  const toggleFavorite = async () => {
    if (!pet || isTogglingFavorite) return;
    
    setIsTogglingFavorite(true);
    try {
      const result = await setPetFavorite(pet.id);
      if (result.success) {
        // Update local pet state by toggling the favorite status
        setPet((prevPet) => {
          if (!prevPet) return prevPet;
          
          const currentFavoriteStatus = prevPet.petFavorites?.some(f => f.isFavorite === true) || false;
          const updatedFavorites = prevPet.petFavorites 
            ? prevPet.petFavorites.map(f => ({
                ...f,
                isFavorite: !currentFavoriteStatus
              }))
            : [{
                isFavorite: true,
                petId: prevPet.id
              }];
          
          return {
            ...prevPet,
            petFavorites: updatedFavorites
          };
        });
        
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
  };

  // Show loading state
  if (loading) {
    return (
      <View style={[containerStyles, styles.centerContainer]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Carregando...</Text>
      </View>
    );
  }

  // Show error state
  if (error || !pet) {
    return (
      <View style={[containerStyles, styles.centerContainer]}>
        <Text style={[styles.errorText, { color: theme.colors.text }]}>
          {error || 'Pet não encontrado'}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={containerStyles}>
      {/* Image Section */}
      <View style={styles.imageSection}>
        <ImageCarousel
          images={pet.petImages?.map(img => img.imageUrl) || []}
          height={300}
          showControls={true}
          showIndicators={true}
          onImagePress={() => {}}
        />
        <TouchableOpacity
          style={favoriteButtonStyles}
          onPress={toggleFavorite}
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
              size={24}
              color={petIsFavorite ? theme.colors.text : theme.colors.primary}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Pet Info Section */}
      <View style={styles.contentContainer}>
        <View style={cardStyles}>
          <Text style={[styles.petName, { color: theme.colors.text }]}>{pet.name}</Text>
          <Text style={[styles.petBreed, { color: theme.colors.textSecondary }]}>{pet.breed.name}</Text>
          
          {/* Basic Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Feather name="calendar" size={16} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>{pet.age} anos</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="gender-male-female" size={16} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>{pet.gender === PetGender.Male ? 'Macho' : 'Fêmea'}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="ruler" size={16} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>{ PetSizeHelper.getLabel(pet.size) }</Text>
            </View>
            <View style={styles.infoItem}>
              <Feather name="map-pin" size={16} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>{pet.city}</Text>
            </View>
          </View>

          {petDistance && (
            <View style={styles.distanceContainer}>
              <Feather name="map-pin" size={14} color={theme.colors.textSecondary} />
              <Text style={[styles.distanceText, { color: theme.colors.textSecondary }]}>
                {petDistance} km de distância
              </Text>
            </View>
          )}
        </View>

        {/* Description Section */}
        <View style={[cardStyles, styles.descriptionCard]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sobre o {pet.name}</Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>{pet.bio}</Text>
        </View>

        {/* History Section */}
        <View style={[cardStyles, styles.descriptionCard]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Histórico Veterinário</Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>{pet.history}</Text>
        </View>

        {/* Contact Section */}
        <View style={[cardStyles, styles.contactCard]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Informações de Contato</Text>
          <Text style={[styles.contactName, { color: theme.colors.text }]}>{pet.user?.name || 'Nome não disponível'}</Text>
          
          {/* Contact buttons container */}
          <View style={styles.contactButtons}>
            {/* Chat button for App and Both contact types */}
            {(pet.user?.contactType === ContactType.App || pet.user?.contactType === ContactType.Both) && (
              <TouchableOpacity
                style={[contactButtonStyles, styles.chatButton]}
                onPress={() => {
                  router.push({
                    pathname: '/chat',
                    params: {
                      userId: pet.user?.clerkId || '',
                      userName: pet.user?.name || 'Usuário',
                      userAvatar: pet.user?.avatar || '',
                      petId: petId
                    }
                  });
                }}
              >
                <MaterialCommunityIcons name="chat" size={20} color={theme.colors.text} />
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>Conversar</Text>
              </TouchableOpacity>
            )}
            
            {/* Phone buttons for Phone and Both contact types */}
            {(pet.user?.contactType === ContactType.Phone || pet.user?.contactType === ContactType.Both) && pet.user?.phone && (
              <>
                <TouchableOpacity
                  style={[contactButtonStyles, styles.callButton]}
                  onPress={handleCall}
                >
                  <Ionicons name="call" size={20} color={theme.colors.text} />
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>Ligar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[contactButtonStyles, styles.whatsappButton]}
                  onPress={handleWhatsApp}
                >
                  <MaterialCommunityIcons name="whatsapp" size={20} color={theme.colors.text} />
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>WhatsApp</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          
          {/* Error message for Phone contact type without phone */}
          {pet.user?.contactType === ContactType.Phone && !pet.user?.phone && (
            <Text style={[styles.noContactText, { color: theme.colors.textSecondary }]}>
              Telefone não disponível
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageSection: {
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 18,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    marginLeft: 4,
  },
  descriptionCard: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  contactCard: {
    marginTop: 8,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  contactButtons: {
    flexDirection: 'column',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  callButton: {
    backgroundColor: '#4CAF50',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
  },
  chatButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  noContactText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
}); 