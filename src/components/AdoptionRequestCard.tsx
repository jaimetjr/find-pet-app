import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { AdoptionRequestDTO } from '@/dtos/adoptionRequestDto';
import StatusBadge from './StatusBadge';
import { useRouter } from 'expo-router';

interface AdoptionRequestCardProps {
  request: AdoptionRequestDTO;
  viewMode: 'adopter' | 'owner';
  onPress?: (request: AdoptionRequestDTO) => void;
}

export default function AdoptionRequestCard({ request, viewMode, onPress }: AdoptionRequestCardProps) {
  const theme = useTheme();
  const router = useRouter();

  const isAdopter = viewMode === 'adopter';
  const displayUser = isAdopter ? request.owner : request.adopter;
  const displayPet = request.pet;

  const handlePress = () => {
    if (onPress) {
      onPress(request);
    } else {
      router.push({
        pathname: '/adoption-request-detail',
        params: { requestId: request.id }
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const petImageUrl = displayPet?.petImages?.[0]?.imageUrl;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Pet Image */}
      <View style={styles.imageContainer}>
        {petImageUrl ? (
          <Image source={{ uri: petImageUrl }} style={styles.petImage} resizeMode="cover" />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: theme.colors.border }]}>
            <Ionicons name="paw" size={32} color={theme.colors.textSecondary} />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.petName, { color: theme.colors.text }]} numberOfLines={1}>
            {displayPet?.name || 'Pet'}
          </Text>
          <StatusBadge status={request.status} size="small" showIcon={false} />
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Ionicons 
            name={isAdopter ? "person" : "person-add"} 
            size={14} 
            color={theme.colors.textSecondary} 
          />
          <Text style={[styles.userName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {isAdopter ? 'Dono: ' : 'Interessado: '}
            {displayUser?.name || 'Usuário'}
          </Text>
        </View>

        {/* Message Preview */}
        {request.message && (
          <Text style={[styles.message, { color: theme.colors.text }]} numberOfLines={2}>
            {request.message}
          </Text>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={12} color={theme.colors.textSecondary} />
            <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
              {formatDate(request.createdAt)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    width: 100,
    height: 120,
  },
  petImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 13,
    marginLeft: 4,
    flex: 1,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 11,
    marginLeft: 4,
  },
});

