import { BaseService } from './baseService';
import { API_ENDPOINTS } from '@/constants';
import { Result } from '@/dtos/result';
import { NotificationDTO, NotificationCountDTO } from '@/dtos/notificationDto';

/**
 * Get paginated notifications for the current user
 */
export const getNotifications = async (
  page: number = 1,
  limit: number = 20
): Promise<Result<NotificationDTO[]>> => {
  return BaseService.get<NotificationDTO[]>(
    `${API_ENDPOINTS.NOTIFICATIONS}?page=${page}&limit=${limit}`
  );
};

/**
 * Get the count of unread notifications
 */
export const getUnreadNotificationCount = async (): Promise<Result<NotificationCountDTO>> => {
  return BaseService.get<NotificationCountDTO>(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
};

/**
 * Mark a specific notification as read
 */
export const markNotificationAsRead = async (id: string): Promise<Result<boolean>> => {
  return BaseService.patch<boolean>(API_ENDPOINTS.NOTIFICATION_READ(id), {});
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<Result<boolean>> => {
  return BaseService.patch<boolean>(API_ENDPOINTS.NOTIFICATIONS_READ_ALL, {});
};

