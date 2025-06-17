import { RegisterUserDTO } from "@/dtos/user/registerUser";
import api from "./api";
import { UserDTO } from "@/dtos/user/userDto";
import { AxiosError } from "axios";

export const register = async (model: RegisterUserDTO): Promise<UserDTO> => {
  try {
    const response = await api.post("/auth/register", model);
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
    const response = await api.get(`/auth/${clerkId}`);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
