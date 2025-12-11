import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from '@/components/NotificationItem';
import { useToast } from '@/hooks/useToast';
import { NotificationDTO } from '@/dtos/notificationDto';

export default function NotificationsScreen() {
  const theme = useTheme();
  const { showToast } = useToast();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    markAsRead,
    markAllAsRead,
    loadMore,
    refresh,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      showToast('Todas as notificações foram marcadas como lidas', 'success');
    } else {
      showToast('Erro ao marcar notificações como lidas', 'failure');
    }
  };

  const handleNotificationPress = async (notification: NotificationDTO) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={64} color={theme.colors.textSecondary} />
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        Nenhuma notificação
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
        Você receberá notificações sobre solicitações de adoção e mensagens
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Notificações</Text>
          {unreadCount > 0 && (
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              {unreadCount} {unreadCount === 1 ? 'não lida' : 'não lidas'}
            </Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={[styles.markAllButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleMarkAllAsRead}
          >
            <Ionicons name="checkmark-done" size={18} color={theme.colors.text} />
            <Text style={[styles.markAllText, { color: theme.colors.text }]}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error State */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: '#ff475215' }]}>
          <Ionicons name="alert-circle" size={20} color="#ff4752" />
          <Text style={[styles.errorText, { color: '#ff4752' }]}>{error}</Text>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={handleNotificationPress}
            onMarkAsRead={markAsRead}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={notifications.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});

