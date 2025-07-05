import { RegisterUserDTO } from "@/dtos/user/registerUserDto";
import { UserDTO } from "@/dtos/user/userDto";
import { Result } from "@/dtos/result";
import { BaseService } from "./baseService";
import { API_ENDPOINTS } from "@/constants";

export const register = async (model: RegisterUserDTO): Promise<Result<UserDTO>> => {
  return BaseService.post<UserDTO>(API_ENDPOINTS.AUTH_REGISTER, model);
};
 
export const getMe = async (clerkId: string): Promise<UserDTO | null> => {
  try { 
    const response = await BaseService.get<any>(`${API_ENDPOINTS.AUTH_ME}/${clerkId}`);
    
    // Check if response is wrapped in Result format
    if (response && typeof response === 'object' && 'success' in response) {
      // Response is in Result format
      return response.success ? response.value : null;
    } else {
      // Response is direct user data
      return response as UserDTO;
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};
