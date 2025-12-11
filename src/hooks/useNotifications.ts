import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NotificationDTO } from '@/dtos/notificationDto';
import * as notificationService from '@/services/notificationService';

export function useNotifications(autoRefresh: boolean = true) {
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch notifications
  const fetchNotifications = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const result = await notificationService.getNotifications(pageNum, 20);
      if (result.success) {
        if (append) {
          setNotifications(prev => [...prev, ...result.value]);
        } else {
          setNotifications(result.value);
        }
        setHasMore(result.value.length === 20);
        setPage(pageNum);
      } else {
        setError(result.errors.join(', '));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await notificationService.getUnreadNotificationCount();
      if (result.success) {
        setUnreadCount(result.value.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const result = await notificationService.markNotificationAsRead(notificationId);
      if (result.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      setLoading(true);
      const result = await notificationService.markAllNotificationsAsRead();
      if (result.success) {
        // Update local state
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load more notifications
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchNotifications(page + 1, true);
    }
  }, [loading, hasMore, page, fetchNotifications]);

  // Refresh notifications
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchNotifications(1, false),
      fetchUnreadCount()
    ]);
  }, [fetchNotifications, fetchUnreadCount]);

  // Initial load and auto-refresh on focus
  useFocusEffect(
    useCallback(() => {
      if (autoRefresh) {
        refresh();
      }
    }, [autoRefresh, refresh])
  );

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    loadMore,
    refresh,
  };
}

