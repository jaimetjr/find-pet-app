import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAdoptionRequest } from '@/services/adoptionRequestService';
import { useAdoptionRequests } from '@/hooks/useAdoptionRequests';
import { AdoptionRequestDTO } from '@/dtos/adoptionRequestDto';
import { AdoptionRequestStatus, AdoptionRequestStatusHelper } from '@/enums/adoptionRequestStatus-enum';
import StatusBadge from '@/components/StatusBadge';
import { useToast } from '@/hooks/useToast';
import { useUser } from '@/hooks/useUser';
import ImageCarousel from '@/components/ImageCarousel';

export default function AdoptionRequestDetailScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const theme = useTheme();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useUser();
  const { updateRequestStatus, cancelRequest } = useAdoptionRequests();

  const [request, setRequest] = useState<AdoptionRequestDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const loadRequest = async () => {
    if (!requestId) return;
    
    try {
      setLoading(true);
      const result = await getAdoptionRequest(requestId);
      if (result.success) {
        setRequest(result.value);
      } else {
        setError(result.errors.join(', '));
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: AdoptionRequestStatus) => {
    if (!request) return;

    // If rejecting, require a reason
    if (newStatus === AdoptionRequestStatus.Rejected && !showRejectionInput) {
      setShowRejectionInput(true);
      return;
    }

    if (newStatus === AdoptionRequestStatus.Rejected && !rejectionReason.trim()) {
      showToast('Por favor, informe o motivo da rejeição', 'failure');
      return;
    }

    const statusLabel = AdoptionRequestStatusHelper.getLabel(newStatus);
    Alert.alert(
      'Confirmar ação',
      `Deseja alterar o status para "${statusLabel}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setActionLoading(true);
            const result = await updateRequestStatus(request.id, {
              status: newStatus,
              rejectionReason: newStatus === AdoptionRequestStatus.Rejected ? rejectionReason : undefined,
            });
            setActionLoading(false);

            if (result.success) {
              showToast(`Status atualizado para ${statusLabel}`, 'success');
              router.back();
            } else {
              showToast(result.error || 'Erro ao atualizar status', 'failure');
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    if (!request) return;

    Alert.alert(
      'Cancelar solicitação',
      'Tem certeza que deseja cancelar esta solicitação?',
      [
        { text: 'Não', style: 'cancel' },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            const result = await cancelRequest(request.id);
            setActionLoading(false);

            if (result.success) {
              showToast('Solicitação cancelada', 'success');
              router.back();
            } else {
              showToast(result.error || 'Erro ao cancelar solicitação', 'failure');
            }
          },
        },
      ]
    );
  };

  const handleChatWithUser = () => {
    if (!request) return;
    const otherUser = isOwner ? request.adopter : request.owner;
    router.push({
      pathname: '/chat',
      params: {
        userId: otherUser.clerkId,
        userName: otherUser.name,
        userAvatar: otherUser.avatar || '',
        petId: request.petId,
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !request) {
    return (
      <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.errorText, { color: theme.colors.text }]}>{error || 'Solicitação não encontrada'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = user?.clerkId === request.ownerClerkId;
  const isAdopter = user?.clerkId === request.adopterClerkId;
  const canApprove = isOwner && AdoptionRequestStatusHelper.isPending(request.status);
  const canCancel = isAdopter && AdoptionRequestStatusHelper.isPending(request.status);
  const otherUser = isOwner ? request.adopter : request.owner;

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView>
        {/* Pet Images */}
        {request.pet?.petImages && request.pet.petImages.length > 0 && (
          <ImageCarousel
            images={request.pet.petImages.map(img => img.imageUrl)}
            height={250}
            showControls={true}
            showIndicators={true}
            onImagePress={() => {}}
          />
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Status Card */}
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <View style={styles.statusHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Status da Solicitação</Text>
              <StatusBadge status={request.status} size="medium" />
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                Criada em {new Date(request.createdAt).toLocaleDateString('pt-BR')}
              </Text>
            </View>
            
            {request.updatedAt !== request.createdAt && (
              <View style={styles.infoRow}>
                <Ionicons name="time" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
                  Atualizada em {new Date(request.updatedAt).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}
          </View>

          {/* Pet Card */}
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Pet</Text>
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/pet-detail', params: { petId: request.petId } })}
            >
              <Text style={[styles.petName, { color: theme.colors.primary }]}>{request.pet?.name}</Text>
              <Text style={[styles.petBreed, { color: theme.colors.textSecondary }]}>
                {request.pet?.breed?.name} • {request.pet?.city}
              </Text>
            </TouchableOpacity>
          </View>

          {/* User Card */}
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {isOwner ? 'Interessado' : 'Dono do Pet'}
            </Text>
            <Text style={[styles.userName, { color: theme.colors.text }]}>{otherUser.name}</Text>
            {otherUser.email && (
              <View style={styles.infoRow}>
                <Ionicons name="mail" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{otherUser.email}</Text>
              </View>
            )}
            {otherUser.phone && (
              <View style={styles.infoRow}>
                <Ionicons name="call" size={16} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>{otherUser.phone}</Text>
              </View>
            )}
          </View>

          {/* Message Card */}
          <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Mensagem</Text>
            <Text style={[styles.message, { color: theme.colors.text }]}>{request.message}</Text>
          </View>

          {/* Rejection Reason */}
          {request.rejectionReason && (
            <View style={[styles.card, { backgroundColor: '#ff475215', borderColor: '#ff4752' }]}>
              <Text style={[styles.sectionTitle, { color: '#ff4752' }]}>Motivo da Rejeição</Text>
              <Text style={[styles.message, { color: '#ff4752' }]}>{request.rejectionReason}</Text>
            </View>
          )}

          {/* Rejection Input */}
          {showRejectionInput && (
            <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Motivo da Rejeição</Text>
              <TextInput
                style={[
                  styles.rejectionInput,
                  { 
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    color: theme.colors.text 
                  }
                ]}
                placeholder="Informe o motivo da rejeição..."
                placeholderTextColor={theme.colors.textSecondary}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Chat Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.chatButton, { borderColor: theme.colors.primary }]}
              onPress={handleChatWithUser}
            >
              <Ionicons name="chatbubble" size={20} color={theme.colors.primary} />
              <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Conversar</Text>
            </TouchableOpacity>

            {/* Owner Actions */}
            {canApprove && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.approveButton]}
                  onPress={() => handleStatusUpdate(AdoptionRequestStatus.Approved)}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={[styles.actionButtonText, { color: '#fff' }]}>Aprovar</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleStatusUpdate(AdoptionRequestStatus.Rejected)}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="close-circle" size={20} color="#fff" />
                      <Text style={[styles.actionButtonText, { color: '#fff' }]}>Rejeitar</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Adopter Actions */}
            {canCancel && (
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancel}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="close" size={20} color="#fff" />
                    <Text style={[styles.actionButtonText, { color: '#fff' }]}>Cancelar Solicitação</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    marginLeft: 8,
  },
  petName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  rejectionInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    gap: 8,
  },
  chatButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  cancelButton: {
    backgroundColor: '#757575',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
});

