import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { addPetImages, getPet, deletePetImage } from '@/services/petService';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@clerk/clerk-expo';
import { useChat } from '@/contexts/ChatContext';

export default function AddPetImagesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { petId, fromMyPets } = useLocalSearchParams<{ petId: string; fromMyPets?: string }>();
  const [photos, setPhotos] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{id: string, imageUrl: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPet, setIsLoadingPet] = useState(true);
  const { safeInvoke} = useChat();
  const isFromMyPets = fromMyPets === 'true';
  const { userId } = useAuth();
  // Load existing pet images
  useEffect(() => {
    const loadPetImages = async () => {
      if (!petId) return;
      
      try {
        setIsLoadingPet(true);
        const result = await getPet(petId);
        
        if (result.success && result.value && result.value.petImages) {
          const imagesWithIds = result.value.petImages.map(img => ({
            id: img.id,
            imageUrl: img.imageUrl
          }));
          setExistingImages(imagesWithIds);
        }
      } catch (error) {
        console.error('Error loading pet images:', error);
      } finally {
        setIsLoadingPet(false);
      }
    };

    loadPetImages();
  }, [petId]);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'Precisamos de permissão para acessar sua galeria de fotos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'Precisamos de permissão para acessar sua câmera.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhoto = result.assets[0].uri;
        setPhotos(prev => [...prev, newPhoto]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erro', 'Erro ao tirar foto. Tente novamente.');
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPhotos = result.assets.map(asset => asset.uri);
        setPhotos(prev => [...prev, ...newPhotos]);
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
      Alert.alert('Erro', 'Erro ao selecionar foto. Tente novamente.');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imageId: string) => {
    if (!petId) return;
    
    Alert.alert(
      'Remover Foto',
      'Tem certeza que deseja remover esta foto?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deletePetImage(petId, imageId);
              
              // Remove from local state only after successful API call
              setExistingImages(prev => prev.filter(img => img.id !== imageId));
              
              Alert.alert('Sucesso', 'Foto removida com sucesso!');
            } catch (error) {
              console.error('Error removing image:', error);
              let errorMessage = 'Erro ao remover foto';
              
              if (Array.isArray(error)) {
                errorMessage = error.join('\n');
              } else if (typeof error === 'string') {
                errorMessage = error;
              }
              
              Alert.alert('Erro', errorMessage);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSaveImages = async () => {
    if (photos.length === 0) {
      Alert.alert('Fotos Necessárias', 'Por favor, adicione pelo menos uma foto do pet.');
      return;
    }

    if (!petId) {
      Alert.alert('Erro', 'ID do pet não encontrado.');
      return;
    }

    setIsLoading(true);
    
    try {
      await addPetImages(petId, userId!, photos);
      safeInvoke("SendPetNotification", userId, petId);
      Alert.alert(
        'Sucesso',
        'Fotos adicionadas com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(main)/my-pets'),
          },
        ]
      );
    } catch (error) {
      console.error('Error uploading images:', error);
      let errorMessage = 'Erro ao fazer upload das fotos';
      
      if (Array.isArray(error)) {
        errorMessage = error.join('\n');
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Pular Adição de Fotos',
      'Tem certeza que deseja pular a adição de fotos? O pet apenas ficará visivel caso adicione as imagens.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Pular',
          onPress: () => router.push('/(main)/my-pets'),
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['left','right','bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(main)/my-pets')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Adicionar Fotos</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Fotos do Pet
          </Text>
          
          <Text style={[styles.subtitle, { color: theme.colors.text + '80' }]}>
            Adicione fotos do seu pet para ajudar na adoção. Você pode adicionar múltiplas fotos.
          </Text>

          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
            <Text style={[styles.infoText, { color: theme.colors.text + '80' }]}>
              Importante: O pet só aparecerá no mapa de adoção se houver fotos cadastradas.
            </Text>
          </View>

          {(photos.length > 0 || existingImages.length > 0) && (
            <Text style={[styles.photoCounter, { color: theme.colors.text }]}>
              {existingImages.length > 0 && (
                <Text>{existingImages.length} foto{existingImages.length !== 1 ? 's' : ''} existente{existingImages.length !== 1 ? 's' : ''}</Text>
              )}
              {photos.length > 0 && (
                <Text>
                  {existingImages.length > 0 ? ' + ' : ''}
                  {photos.length} nova{photos.length !== 1 ? 's' : ''} foto{photos.length !== 1 ? 's' : ''}
                </Text>
              )}
            </Text>
          )}

          <View style={styles.photoContainer}>
            {photos.length === 0 && existingImages.length === 0 ? (
              <View style={[styles.photoPlaceholder, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Ionicons name="camera" size={48} color={theme.colors.text + '80'} />
                <Text style={[styles.photoPlaceholderText, { color: theme.colors.text + '80' }]}>
                  Nenhuma foto adicionada
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                {/* Existing images */}
                {existingImages.map((image, index) => (
                  <View key={`existing-${image.id}`} style={styles.photoItem}>
                    <Image source={{ uri: image.imageUrl }} style={styles.photoImage} />
                    <TouchableOpacity 
                      style={styles.removePhotoButton}
                      onPress={() => removeExistingImage(image.id)}
                    >
                      <Ionicons name="close-circle" size={24} color="red" />
                    </TouchableOpacity>
                    <View style={styles.existingImageBadge}>
                      <Text style={styles.existingImageText}>Existente</Text>
                    </View>
                  </View>
                ))}
                
                {/* New photos */}
                {photos.map((photo, index) => (
                  <View key={`new-${index}`} style={styles.photoItem}>
                    <Image source={{ uri: photo }} style={styles.photoImage} />
                    <TouchableOpacity 
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="red" />
                    </TouchableOpacity>
                    <View style={styles.newImageBadge}>
                      <Text style={styles.newImageText}>Nova</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.photoButtons}>
            <TouchableOpacity 
              style={[styles.photoButton, { backgroundColor: theme.colors.primary }]}
              onPress={takePhoto}
            >
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.photoButtonText}>Tirar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.photoButton, { backgroundColor: theme.colors.primary }]}
              onPress={pickFromGallery}
            >
              <Ionicons name="images" size={20} color="white" />
              <Text style={styles.photoButtonText}>Galeria</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {!isFromMyPets && (
            <TouchableOpacity 
              style={[styles.secondaryButton, { borderColor: theme.colors.primary }]}
              onPress={handleSkip}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.primary }]}>Pular</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[
              styles.primaryButton, 
              { 
                backgroundColor: theme.colors.primary
              }
            ]}
            onPress={handleSaveImages}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.primaryButtonText}>Salvar Fotos</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  photoCounter: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  photoContainer: {
    height: 200,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 20,
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  photoScroll: {
    flex: 1,
  },
  photoItem: {
    width: 200,
    height: '100%',
    marginRight: 10,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  photoButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  secondaryButton: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '90%',
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
  },
  existingImageBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  existingImageText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  newImageBadge: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: 'rgba(0, 255, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newImageText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 