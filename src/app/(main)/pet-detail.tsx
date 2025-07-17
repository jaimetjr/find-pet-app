import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import ImageCarousel from '@/components/ImageCarousel';
import { Pet } from '@/data/pets';
import { calculateDistance, Coordinates } from '@/utils/locationUtils';
import { useLocation } from '@/hooks/useLocation';
import { getPet } from '@/services/petService';
import { PetDTO } from '@/dtos/pet/petDto';
import { PetGender } from '@/enums/petGender-enum';
import { PetSizeHelper } from '@/enums/petSize-enum';
import { ContactType } from '@/enums/contactType';

export default function PetDetailScreen() {
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { userLocation } = useLocation();
  const [pet, setPet] = useState<PetDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pet data on component mount
  useEffect(() => {
    const fetchPet = async () => {
      if (!petId) {
        setError('Pet ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getPet(petId);
        if (result.success) {
          console.log(result.value.user.contactType);
          setPet(result.value);
        } else {
          setError(result.errors.join(', ') || 'Failed to load pet details');
        }
      } catch (err) {
        setError('Failed to load pet details');
        console.error('Error fetching pet:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [petId]);

  const petIsFavorite = false; // TODO: Replace with actual favorite state

  // Calculate distance if user location is available
  const petDistance = useMemo(() => {
    if (!userLocation || !pet) return null;
    
    // TODO: Get coordinates from pet data when available
    // For now, using mock coordinates - this should be replaced with real coordinates from pet data
    const petCoordinates = { latitude: -23.5505, longitude: -46.6333 }; // Mock coordinates
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      petCoordinates.latitude,
      petCoordinates.longitude,
    );
    
    return distance.toFixed(1);
  }, [userLocation, pet]);

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

  const toggleFavorite = () => {
    // TODO: Implement favorite toggle functionality
    console.log('Toggle favorite for pet:', pet?.id);
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
        >
          <MaterialCommunityIcons
            name={petIsFavorite ? "heart" : "heart-outline"}
            size={24}
            color={petIsFavorite ? theme.colors.text : theme.colors.primary}
          />
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