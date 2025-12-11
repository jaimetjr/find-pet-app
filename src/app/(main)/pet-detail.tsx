import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, ActivityIndicator, Modal, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
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
import { useAdoptionRequests } from '@/hooks/useAdoptionRequests';
import { useUser } from '@/hooks/useUser';
import { AdoptionRequestStatusHelper } from '@/enums/adoptionRequestStatus-enum';
import { AdoptionRequestDTO } from '@/dtos/adoptionRequestDto';

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
  const { user } = useUser();
  const { checkPendingRequest, createRequest } = useAdoptionRequests();
  const [pendingRequest, setPendingRequest] = useState<AdoptionRequestDTO | null>(null);
  const [checkingRequest, setCheckingRequest] = useState(false);
  const [requestingAdoption, setRequestingAdoption] = useState(false);
  const [showAdoptionModal, setShowAdoptionModal] = useState(false);
  const [adoptionMessage, setAdoptionMessage] = useState('');
  const hasCheckedRequestRef = useRef<string | null>(null); // Track checked petId
  const isCheckingRef = useRef(false); // Prevent concurrent checks
  const lastCheckTimeRef = useRef<number>(0); // Track last check time to prevent rapid checks
  const petRef = useRef<PetDTO | null>(null); // Store pet in ref to avoid dependency issues
  const userRef = useRef(user); // Store user in ref to avoid dependency issues

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

  // Update refs when pet or user changes
  useEffect(() => {
    petRef.current = pet;
  }, [pet]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Reset when petId changes
  useEffect(() => {
    hasCheckedRequestRef.current = null;
    setPendingRequest(null);
    lastCheckTimeRef.current = 0; // Reset debounce timer for new pet
    isCheckingRef.current = false; // Reset checking flag
  }, [petId]);

  // Fetch pet data on component mount
  useEffect(() => {
    fetchPet(true); // Show loading on initial fetch
  }, [fetchPet]);

  // Function to check pending request - use refs to avoid dependency issues
  const checkPendingRequestForPet = useCallback(async () => {
    // Prevent concurrent checks
    if (isCheckingRef.current || !petId) return;
    
    // Prevent rapid successive checks (debounce)
    const now = Date.now();
    if (now - lastCheckTimeRef.current < 1000) {
      return;
    }
    lastCheckTimeRef.current = now;
    
    // Get current values from refs to avoid dependency issues
    const currentPet = petRef.current;
    const currentUser = userRef.current;
    if (!currentPet || !currentUser) return;
    
    // Don't check if user is the owner
    if (currentUser.clerkId === currentPet.user?.clerkId) {
      setPendingRequest(null);
      return;
    }
    
    isCheckingRef.current = true;
    setCheckingRequest(true);
    try {
      const request = await checkPendingRequest(petId);
      // Explicitly set to null if no request found (to clear stale state)
      setPendingRequest(request || null);
    } catch (err) {
      console.error('Error checking pending request:', err);
      // Clear state on error to avoid showing stale data
      setPendingRequest(null);
    } finally {
      setCheckingRequest(false);
      isCheckingRef.current = false;
    }
  }, [petId, checkPendingRequest]);

  // Check for pending adoption request when pet is loaded (only once per pet)
  useEffect(() => {
    // Skip if already checked for this petId
    if (!petId || hasCheckedRequestRef.current === petId) return;
    
    // Need both pet and user to proceed
    if (!pet || !user) return;
    
    hasCheckedRequestRef.current = petId; // Mark as checked before API call
    // Small delay to ensure refs are updated
    const timeoutId = setTimeout(() => {
      checkPendingRequestForPet();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [petId, pet?.id, user?.clerkId, checkPendingRequestForPet]);

  // Refetch pet data when screen comes into focus
  // Silent refresh - don't show loading if we already have pet data
  useFocusEffect(
    useCallback(() => {
      if (!pet || !petId) return;
      
      fetchPet(false); // Silent refresh if we already have data
    }, [fetchPet, petId])
  );

  // Re-check pending request when screen comes into focus (separate effect to avoid glitching)
  useFocusEffect(
    useCallback(() => {
      // Only re-check if enough time has passed since last check
      const now = Date.now();
      if (now - lastCheckTimeRef.current < 2000) {
        return; // Don't re-check if checked recently
      }
      
      // Get current values from refs
      const currentPet = petRef.current;
      const currentUser = userRef.current;
      if (!currentPet || !currentUser || !petId) return;
      
      // Don't check if user is the owner
      if (currentUser.clerkId === currentPet.user?.clerkId) {
        setPendingRequest(null);
        return;
      }
      
      // Reset the check flag to allow re-checking on focus
      hasCheckedRequestRef.current = null;
      
      // Use a delay to batch with pet fetch and prevent rapid successive checks
      const timeoutId = setTimeout(async () => {
        if (isCheckingRef.current) return;
        
        isCheckingRef.current = true;
        setCheckingRequest(true);
        try {
          const request = await checkPendingRequest(petId);
          setPendingRequest(request || null);
        } catch (err) {
          console.error('Error checking pending request:', err);
          setPendingRequest(null);
        } finally {
          setCheckingRequest(false);
          isCheckingRef.current = false;
          lastCheckTimeRef.current = Date.now();
        }
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }, [petId, checkPendingRequest])
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

  const handleAdoptionRequest = () => {
    if (!pet || !petId) return;
    
    Alert.alert(
      'Solicitar Adoção',
      'Você deseja enviar uma solicitação de adoção para este pet?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          onPress: () => {
            setAdoptionMessage('');
            setShowAdoptionModal(true);
          },
        },
      ]
    );
  };

  const handleSubmitAdoptionRequest = async () => {
    if (!petId) return;
    
    const trimmedMessage = adoptionMessage.trim();
    
    if (!trimmedMessage || trimmedMessage.length < 20) {
      showToast('Por favor, escreva uma mensagem com pelo menos 20 caracteres', 'failure');
      return;
    }
    
    setRequestingAdoption(true);
    try {
      const result = await createRequest({
        petId: petId,
        message: trimmedMessage,
      });
      
      if (result.success && result.data) {
        showToast('Solicitação enviada com sucesso!', 'success');
        setPendingRequest(result.data);
        // Mark as checked to prevent immediate re-check, but focus effect will still verify
        hasCheckedRequestRef.current = petId;
        setShowAdoptionModal(false);
        setAdoptionMessage('');
      } else {
        showToast(result.error || 'Erro ao enviar solicitação', 'failure');
        // Clear any stale pending request state on error
        setPendingRequest(null);
      }
    } catch (err) {
      console.error('Error creating adoption request:', err);
      showToast('Erro ao enviar solicitação', 'failure');
    } finally {
      setRequestingAdoption(false);
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
    <>
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

        {/* Adoption Request Section - Only show if user is not the owner */}
        {user && pet.user && user.clerkId !== pet.user.clerkId && (
          <View style={[cardStyles, styles.adoptionCard]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Adoção</Text>
            
            {checkingRequest && !pendingRequest ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : pendingRequest ? (
              <View>
                <View style={styles.requestStatusContainer}>
                  <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.requestStatusTitle, { color: theme.colors.text }]}>
                      Solicitação Enviada
                    </Text>
                    <Text style={[styles.requestStatusText, { color: theme.colors.textSecondary }]}>
                      Status: {AdoptionRequestStatusHelper.getLabel(pendingRequest.status)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.viewRequestButton, { borderColor: theme.colors.primary }]}
                  onPress={() => router.push({
                    pathname: '/adoption-request-detail',
                    params: { requestId: pendingRequest.id }
                  })}
                >
                  <Text style={[styles.viewRequestText, { color: theme.colors.primary }]}>
                    Ver Solicitação
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={[styles.adoptionDescription, { color: theme.colors.textSecondary }]}>
                  Interessado em adotar este pet? Envie uma solicitação para o dono!
                </Text>
                <TouchableOpacity
                  style={[styles.adoptionButton, { backgroundColor: theme.colors.primary }]}
                  onPress={handleAdoptionRequest}
                  disabled={requestingAdoption}
                >
                  {requestingAdoption ? (
                    <ActivityIndicator size="small" color={theme.colors.text} />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="heart-plus" size={20} color={theme.colors.text} />
                      <Text style={[styles.adoptionButtonText, { color: theme.colors.text }]}>
                        Solicitar Adoção
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>

    {/* Adoption Request Modal */}
    <Modal
      visible={showAdoptionModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAdoptionModal(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAdoptionModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.modalContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Solicitar Adoção
              </Text>
              <TouchableOpacity onPress={() => setShowAdoptionModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
              Conte ao dono por que você gostaria de adotar este pet:
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }
              ]}
              placeholder="Escreva sua mensagem aqui... (mínimo 20 caracteres)"
              placeholderTextColor={theme.colors.textSecondary}
              value={adoptionMessage}
              onChangeText={setAdoptionMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />

            <Text style={[styles.modalCharCount, { color: theme.colors.textSecondary }]}>
              {adoptionMessage.length}/500 caracteres
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalCancelButton, { borderColor: theme.colors.border }]}
                onPress={() => {
                  setShowAdoptionModal(false);
                  setAdoptionMessage('');
                }}
              >
                <Text style={[styles.modalCancelText, { color: theme.colors.text }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalSubmitButton,
                  {
                    backgroundColor: theme.colors.primary,
                    opacity: adoptionMessage.trim().length >= 20 && !requestingAdoption ? 1 : 0.5,
                  }
                ]}
                onPress={handleSubmitAdoptionRequest}
                disabled={adoptionMessage.trim().length < 20 || requestingAdoption}
              >
                {requestingAdoption ? (
                  <ActivityIndicator size="small" color={theme.colors.text} />
                ) : (
                  <Text style={[styles.modalSubmitText, { color: theme.colors.text }]}>Enviar</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
    </>
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
  adoptionCard: {
    marginTop: 8,
  },
  adoptionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  adoptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  adoptionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  requestStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#4CAF5015',
    borderRadius: 8,
    marginBottom: 12,
  },
  requestStatusTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  requestStatusText: {
    fontSize: 13,
  },
  viewRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
  },
  viewRequestText: {
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderWidth: 1,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 8,
  },
  modalCharCount: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 