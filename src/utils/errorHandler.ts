export interface ApiError {
  message: string;
  status?: number;
  field?: string;
}

export class ErrorHandler {
  static extractErrorMessages(error: any): string[] {
    const err = error as any;
    const raw = err?.response?.data;
    let messages: string[] = [];

    if (raw?.errors && typeof raw.errors === 'object') {
      // Extract all validation error messages
      for (const field in raw.errors) {
        if (Array.isArray(raw.errors[field])) {
          messages.push(...raw.errors[field]);
        }
      }
    } else if (raw?.message) {
      messages.push(raw.message);
    } else if (raw?.title) {
      messages.push(raw.title);
    } else if (typeof raw === 'string') {
      messages.push(raw);
    } else {
      messages.push('Unknown error');
    }

    return messages;
  }

  static handleApiError(error: any): ApiError {
    const messages = this.extractErrorMessages(error);
    return {
      message: messages.join(', '),
      status: error?.response?.status,
    };
  }

  static logError(error: any, context: string): void {
    console.error(`[${context}] Error:`, error);
  }
} 