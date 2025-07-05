import { authenticatedApi } from './api';
import { ErrorHandler } from '@/utils/errorHandler';
import { Result } from '@/dtos/result';

export abstract class BaseService {
  public static async get<T>(endpoint: string): Promise<Result<T>> {
    try {
      const response = await authenticatedApi.get(endpoint);
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, `GET ${endpoint}`);
      throw ErrorHandler.extractErrorMessages(error);
    }
  }

  public static async post<T>(endpoint: string, data?: any): Promise<Result<T>> {
    try {
      const response = await authenticatedApi.post(endpoint, data);
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, `POST ${endpoint}`);
      throw ErrorHandler.extractErrorMessages(error);
    }
  }

  public static async put<T>(endpoint: string, data?: any): Promise<Result<T>> {
    try {
      const response = await authenticatedApi.put(endpoint, data);
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, `PUT ${endpoint}`);
      throw ErrorHandler.extractErrorMessages(error);
    }
  }

  public static async delete<T>(endpoint: string): Promise<Result<T>> {
    try {
      const response = await authenticatedApi.delete(endpoint);
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, `DELETE ${endpoint}`);
      throw ErrorHandler.extractErrorMessages(error);
    }
  }

  public static async postFormData<T>(endpoint: string, formData: FormData): Promise<Result<T>> {
    try {
      const response = await authenticatedApi.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      ErrorHandler.logError(error, `POST FormData ${endpoint}`);
      throw ErrorHandler.extractErrorMessages(error);
    }
  }
} 