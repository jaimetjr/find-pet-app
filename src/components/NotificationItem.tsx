import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { NotificationDTO } from '@/dtos/notificationDto';
import { NotificationTypeHelper } from '@/enums/notificationType-enum';
import { useRouter } from 'expo-router';

interface NotificationItemProps {
  notification: NotificationDTO;
  onPress?: (notification: NotificationDTO) => void;
  onMarkAsRead?: (id: string) => void;
}

export default function NotificationItem({ notification, onPress, onMarkAsRead }: NotificationItemProps) {
  const theme = useTheme();
  const router = useRouter();

  const icon = NotificationTypeHelper.getIcon(notification.type);
  const iconColor = NotificationTypeHelper.getColor(notification.type);

  const handlePress = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    
    if (onPress) {
      onPress(notification);
    } else if (notification.actionUrl) {
      // Navigate based on actionUrl
      router.push(notification.actionUrl as any);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: notification.isRead ? theme.colors.card : `${theme.colors.primary}10`,
          borderColor: theme.colors.border 
        }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Unread Indicator */}
      {!notification.isRead && (
        <View style={[styles.unreadIndicator, { backgroundColor: theme.colors.primary }]} />
      )}

      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
        <Ionicons name={icon as any} size={24} color={iconColor} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
          {notification.title}
        </Text>
        <Text style={[styles.message, { color: theme.colors.textSecondary }]} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={[styles.timestamp, { color: theme.colors.textSecondary }]}>
          {formatDate(notification.createdAt)}
        </Text>
      </View>

      {/* Arrow Icon */}
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    position: 'relative',
  },
  unreadIndicator: {
    position: 'absolute',
    left: 4,
    top: '50%',
    transform: [{ translateY: -4 }],
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
  },
});

