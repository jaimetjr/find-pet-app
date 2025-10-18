import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export default function FavoritesScreen() {
  const theme = useTheme();

  // Mock data for favorite pets
  const mockFavorites = [
    { 
      id: '1', 
      name: 'Max', 
      breed: 'Labrador Retriever', 
      age: '2 years', 
      location: 'São Paulo, SP',
      distance: '2.5 km',
      image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'
    },
    { 
      id: '2', 
      name: 'Luna', 
      breed: 'Persian Cat', 
      age: '1 year', 
      location: 'Rio de Janeiro, RJ',
      distance: '5.1 km',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400'
    },
  ];

  const renderFavoriteItem = ({ item }: { item: any }) => (
    <View style={[styles.favoriteCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Image source={{ uri: item.image }} style={styles.petImage} />
      <View style={styles.petInfo}>
        <View style={styles.petHeader}>
          <Text style={[styles.petName, { color: theme.colors.text }]}>{item.name}</Text>
          <TouchableOpacity style={styles.heartButton}>
            <Ionicons name="heart" size={24} color="#ff4757" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.petBreed, { color: theme.colors.text }]}>{item.breed}</Text>
        <Text style={[styles.petAge, { color: theme.colors.text }]}>{item.age}</Text>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color={theme.colors.primary} />
          <Text style={[styles.locationText, { color: theme.colors.text }]}>{item.location}</Text>
        </View>
        <View style={styles.distanceContainer}>
          <Ionicons name="navigate" size={16} color={theme.colors.primary} />
          <Text style={[styles.distanceText, { color: theme.colors.text }]}>{item.distance}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['left','right','bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Favorites</Text>
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          {mockFavorites.length} pets saved
        </Text>
      </View>

      {mockFavorites.length > 0 ? (
        <FlatList
          data={mockFavorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart" size={64} color={theme.colors.text} />
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            No favorites yet
          </Text>
          <Text style={[styles.emptySubtext, { color: theme.colors.text }]}>
            Start browsing pets and save your favorites
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  listContainer: {
    padding: 16,
  },
  favoriteCard: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  petImage: {
    width: 100,
    height: 100,
  },
  petInfo: {
    flex: 1,
    padding: 12,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  heartButton: {
    padding: 4,
  },
  petBreed: {
    fontSize: 14,
    marginBottom: 2,
  },
  petAge: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
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
}); 