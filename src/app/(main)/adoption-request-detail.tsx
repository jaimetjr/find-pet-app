import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
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
  const [showRejectionModal, setShowRejectionModal] = useState(false);

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

    // If rejecting, open modal to get reason
    if (newStatus === AdoptionRequestStatus.Rejected) {
      setRejectionReason('');
      setShowRejectionModal(true);
      return;
    }

    // For other statuses, proceed with confirmation
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
            const payload: { status: AdoptionRequestStatus; rejectionReason?: string } = {
              status: newStatus,
            };
            const result = await updateRequestStatus(request.id, payload);
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

  const handleSubmitRejection = async () => {
    if (!request) return;

    const trimmedReason = rejectionReason.trim();
    
    if (!trimmedReason || trimmedReason.length < 20) {
      showToast('Por favor, escreva um motivo com pelo menos 20 caracteres', 'failure');
      return;
    }

    setActionLoading(true);
    try {
      const payload: { status: AdoptionRequestStatus; rejectionReason: string } = {
        status: AdoptionRequestStatus.Rejected,
        rejectionReason: trimmedReason,
      };
      
      console.log('[handleSubmitRejection] Submitting rejection:', payload);
      const result = await updateRequestStatus(request.id, payload);

      if (result.success) {
        const statusLabel = AdoptionRequestStatusHelper.getLabel(AdoptionRequestStatus.Rejected);
        showToast(`Status atualizado para ${statusLabel}`, 'success');
        setShowRejectionModal(false);
        setRejectionReason('');
        router.back();
      } else {
        const errorMessage = result.error || 'Erro ao atualizar status';
        console.error('[handleSubmitRejection] Backend error:', errorMessage);
        showToast(errorMessage, 'failure');
      }
    } catch (err: any) {
      console.error('[handleSubmitRejection] Error:', err);
      // Try to extract error messages from the error object
      let errorMessage = 'Erro ao rejeitar solicitação';
      if (err?.response?.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages: string[] = [];
        for (const field in errors) {
          if (Array.isArray(errors[field])) {
            errorMessages.push(...errors[field]);
          }
        }
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join(', ');
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      showToast(errorMessage, 'failure');
    } finally {
      setActionLoading(false);
    }
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
    if (!request || !user) return;
    const isOwnerLocal = user.clerkId === request.ownerClerkId;
    const otherUser = isOwnerLocal ? request.adopter : request.owner;
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

      {/* Rejection Modal */}
      <Modal
        visible={showRejectionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowRejectionModal(false);
          setRejectionReason('');
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => {
              setShowRejectionModal(false);
              setRejectionReason('');
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={[styles.modalContent, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  Motivo da Rejeição
                </Text>
                <TouchableOpacity onPress={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                }}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.modalDescription, { color: theme.colors.textSecondary }]}>
                Por favor, informe o motivo da rejeição desta solicitação:
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
                placeholder="Escreva o motivo da rejeição aqui... (mínimo 20 caracteres)"
                placeholderTextColor={theme.colors.textSecondary}
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={500}
              />

              <Text style={[styles.modalCharCount, { color: theme.colors.textSecondary }]}>
                {rejectionReason.length}/500 caracteres
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalCancelButton, { borderColor: theme.colors.border }]}
                  onPress={() => {
                    setShowRejectionModal(false);
                    setRejectionReason('');
                  }}
                >
                  <Text style={[styles.modalCancelText, { color: theme.colors.text }]}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.modalSubmitButton,
                    {
                      backgroundColor: '#F44336',
                      opacity: rejectionReason.trim().length >= 20 && !actionLoading ? 1 : 0.5,
                    }
                  ]}
                  onPress={handleSubmitRejection}
                  disabled={rejectionReason.trim().length < 20 || actionLoading}
                >
                  {actionLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={[styles.modalSubmitText, { color: '#fff' }]}>Confirmar Rejeição</Text>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
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

