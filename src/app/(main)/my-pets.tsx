import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { deletePet, getPetsById } from "@/services/petService";
import { PetDTO } from '@/dtos/pet/petDto';

export default function MyPetsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [pets, setPets] = useState<PetDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchPets = useCallback(async () => {
    try {
      setIsLoading(true);
      const pets = await getPetsById();
      setPets(pets.value);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch pets when component mounts
  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  // Refresh pets when screen comes into focus (e.g., when returning from add-pet)
  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [fetchPets])
  );

  const handleDeletePet = async (id: string) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este pet? Esta ação não pode ser desfeita.",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePet(id);
              setPets(pets.filter(pet => pet.id !== id));
            } catch (error) {
              Alert.alert("Erro", "Erro ao excluir pet. Tente novamente.");
            }
          },
        },
      ]
    );
  }

  const renderPetItem = ({ item }: { item: PetDTO }) => (
    <View style={[styles.petCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.petInfo}>
        <Ionicons name="paw" size={24} color={theme.colors.primary} />
        <View style={styles.petDetails}>
          <Text style={[styles.petName, { color: theme.colors.text }]}>{item.name}</Text>
          <Text style={[styles.petBreed, { color: theme.colors.text }]}>{item.breed.name}</Text>
          <Text style={[styles.petAge, { color: theme.colors.text }]}>{item.age} anos</Text>
          
          {/* Image status indicator */}
          <View style={styles.imageStatus}>
            <Ionicons 
              name={item.petImages && item.petImages.length > 0 ? "images" : "image-outline"} 
              size={16} 
              color={item.petImages && item.petImages.length > 0 ? theme.colors.primary : theme.colors.text + "60"} 
            />
            <Text style={[styles.imageStatusText, { color: theme.colors.text + "60" }]}>
              {item.petImages && item.petImages.length > 0 
                ? `${item.petImages.length} foto${item.petImages.length > 1 ? 's' : ''}` 
                : 'Sem fotos'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push({
            pathname: '/(main)/add-pet',
            params: { petId: item.id }
          })}
        >
          <Ionicons name="create" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        
        {/* Add Images Button - always available */}
        <TouchableOpacity 
          style={styles.addImagesButton}
          onPress={() => router.push({
            pathname: '/(main)/add-pet-images',
            params: { petId: item.id, fromMyPets: 'true' }
          })}
        >
          <Ionicons name="camera" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeletePet(item.id)}>
          <Ionicons name="trash" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Carregando pets...
          </Text>
        </View>
      );
    }

    if (pets.length > 0) {
      return (
        <FlatList
          data={pets}
          renderItem={renderPetItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="paw" size={64} color={theme.colors.text} />
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          Nenhum pet adicionado ainda
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.text }]}>
          Adicione seu primeiro pet para começar
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['left','right','bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Meus Pets</Text>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/(main)/add-pet')}
        >
          <Ionicons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  petCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  petDetails: {
    marginLeft: 12,
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14,
    marginBottom: 2,
  },
  petAge: {
    fontSize: 12,
    opacity: 0.7,
  },
  editButton: {
    padding: 8,
  },
  addImagesButton: {
    padding: 8,
  },
  imageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  imageStatusText: {
    fontSize: 12,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteButton: {
    padding: 8,
  },
});