import { NotificationType } from "@/enums/notificationType-enum";

export interface NotificationDTO {
  id: string;
  userClerkId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: string;
  actionUrl?: string;
  isRead: boolean;
  active: boolean; // Soft delete flag (true = active, false = deleted)
  createdAt: string;
}

export interface NotificationCountDTO {
  unreadCount: number;
  totalCount: number;
}

export interface MarkNotificationReadDTO {
  notificationId: string;
}

