import { RegisterUserDTO } from "@/dtos/user/registerUserDto";
import { authenticatedApi } from "./api";
import { UserDTO } from "@/dtos/user/userDto";
import { AxiosError } from "axios";
import { Result } from "@/dtos/result";

export const register = async (model: RegisterUserDTO): Promise<Result<UserDTO>> => {
  try {
    const response = await authenticatedApi.post("/auth/register", model);
    return response.data;
  } catch (error) {
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

    throw messages; 
  }
};
 
export const getMe = async (clerkId: string): Promise<UserDTO | null> => {
  try { 
    const response = await authenticatedApi.get(`/auth/me/${clerkId}`);
    return response.data;
  } catch (error) {
    const err = error as AxiosError;
    if (err.message === 'Network Error') {
      
    }
    return null;
  }
};
