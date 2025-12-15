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
      console.log(`[BaseService.post] ${endpoint}`, JSON.stringify(data, null, 2));
      const response = await authenticatedApi.post(endpoint, data);
      return response.data;
    } catch (error: any) {
      console.error(`[BaseService.post] Error for ${endpoint}:`, {
        status: error.response?.status,
        data: error.response?.data,
        requestData: data,
      });
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

  public static async patch<T>(endpoint: string, data?: any): Promise<Result<T>> {
    try {
      console.log(`[BaseService.patch] ${endpoint}`, JSON.stringify(data, null, 2));
      const response = await authenticatedApi.patch(endpoint, data);
      return response.data;
    } catch (error: any) {
      console.error(`[BaseService.patch] Error for ${endpoint}:`, {
        status: error.response?.status,
        data: error.response?.data,
        requestData: data,
      });
      ErrorHandler.logError(error, `PATCH ${endpoint}`);
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
    } catch (error: any) {
      console.error('[BaseService.postFormData] Error:', error.message);
      if (error.response) {
        console.error('[BaseService.postFormData] Response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        console.error('[BaseService.postFormData] Request:', error.request);
      }
      console.error('[BaseService.postFormData] Config:', error.config);
      ErrorHandler.logError(error, `POST FormData ${endpoint}`);
      throw ErrorHandler.extractErrorMessages(error);
    }
  }

  public static async putFormData<T>(endpoint: string, formData: FormData): Promise<Result<T>> {
    try {
      const response = await authenticatedApi.put(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('[BaseService.putFormData] Error:', error.message);
      if (error.response) {
        console.error('[BaseService.putFormData] Response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        console.error('[BaseService.putFormData] Request:', error.request);
      }
      console.error('[BaseService.putFormData] Config:', error.config);
      ErrorHandler.logError(error, `PUT FormData ${endpoint}`);
      throw ErrorHandler.extractErrorMessages(error);
    }
  }
} 