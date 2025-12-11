export enum AdoptionRequestStatus {
  Submitted = 0,
  UnderReview = 1,
  Interview = 2,
  Approved = 3,
  Rejected = 4,
  Cancelled = 5
}

export class AdoptionRequestStatusHelper {
  static getLabel(status: AdoptionRequestStatus): string {
    switch (status) {
      case AdoptionRequestStatus.Submitted:
        return 'Enviado';
      case AdoptionRequestStatus.UnderReview:
        return 'Em Análise';
      case AdoptionRequestStatus.Interview:
        return 'Entrevista';
      case AdoptionRequestStatus.Approved:
        return 'Aprovado';
      case AdoptionRequestStatus.Rejected:
        return 'Rejeitado';
      case AdoptionRequestStatus.Cancelled:
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  }

  static getColor(status: AdoptionRequestStatus): string {
    switch (status) {
      case AdoptionRequestStatus.Submitted:
        return '#2196F3'; // Blue
      case AdoptionRequestStatus.UnderReview:
        return '#FF9800'; // Orange
      case AdoptionRequestStatus.Interview:
        return '#9C27B0'; // Purple
      case AdoptionRequestStatus.Approved:
        return '#4CAF50'; // Green
      case AdoptionRequestStatus.Rejected:
        return '#F44336'; // Red
      case AdoptionRequestStatus.Cancelled:
        return '#757575'; // Gray
      default:
        return '#000000';
    }
  }

  static getIcon(status: AdoptionRequestStatus): string {
    switch (status) {
      case AdoptionRequestStatus.Submitted:
        return 'send';
      case AdoptionRequestStatus.UnderReview:
        return 'hourglass';
      case AdoptionRequestStatus.Interview:
        return 'chatbubbles';
      case AdoptionRequestStatus.Approved:
        return 'checkmark-circle';
      case AdoptionRequestStatus.Rejected:
        return 'close-circle';
      case AdoptionRequestStatus.Cancelled:
        return 'ban';
      default:
        return 'help-circle';
    }
  }

  static isPending(status: AdoptionRequestStatus): boolean {
    return [
      AdoptionRequestStatus.Submitted,
      AdoptionRequestStatus.UnderReview,
      AdoptionRequestStatus.Interview
    ].includes(status);
  }

  static isFinal(status: AdoptionRequestStatus): boolean {
    return [
      AdoptionRequestStatus.Approved,
      AdoptionRequestStatus.Rejected,
      AdoptionRequestStatus.Cancelled
    ].includes(status);
  }
}

