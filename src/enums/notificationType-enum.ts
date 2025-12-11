export enum NotificationType {
  RequestReceived = 0,
  RequestApproved = 1,
  RequestRejected = 2,
  RequestInterview = 3,
  RequestUnderReview = 4,
  RequestCancelled = 5,
  ChatMessage = 6,
  General = 7
}

export class NotificationTypeHelper {
  static getIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.RequestReceived:
        return 'mail';
      case NotificationType.RequestApproved:
        return 'checkmark-circle';
      case NotificationType.RequestRejected:
        return 'close-circle';
      case NotificationType.RequestInterview:
        return 'chatbubbles';
      case NotificationType.RequestUnderReview:
        return 'hourglass';
      case NotificationType.RequestCancelled:
        return 'ban';
      case NotificationType.ChatMessage:
        return 'chatbox';
      case NotificationType.General:
        return 'information-circle';
      default:
        return 'notifications';
    }
  }

  static getColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.RequestReceived:
        return '#2196F3';
      case NotificationType.RequestApproved:
        return '#4CAF50';
      case NotificationType.RequestRejected:
        return '#F44336';
      case NotificationType.RequestInterview:
        return '#9C27B0';
      case NotificationType.RequestUnderReview:
        return '#FF9800';
      case NotificationType.RequestCancelled:
        return '#757575';
      case NotificationType.ChatMessage:
        return '#00BCD4';
      case NotificationType.General:
        return '#607D8B';
      default:
        return '#000000';
    }
  }
}

