import { RegisterUserDTO } from "@/dtos/user/registerUserDto";
import { UpdateUserDTO } from "@/dtos/user/updateUserDto";
import { UserDTO } from "@/dtos/user/userDto";
import { Result } from "@/dtos/result";
import { BaseService } from "./baseService";
import { API_ENDPOINTS, DEFAULTS } from "@/constants";
import { UserApiResponse, RegisterUserRequest, ApiResponse } from "@/types/api";
import { authenticatedApi } from "./api";

export const register = async (model: RegisterUserDTO, avatar?: string): Promise<Result<UserDTO>> => {
  const formData = new FormData();

  formData.append("clerkId", model.clerkId);
  formData.append("name", model.name);
  formData.append("email", model.email);
  formData.append("birthDate", model.birthDate);
  formData.append("cpf", model.cpf);
  formData.append("phone", model.phone);
  formData.append("bio", model.bio);
  formData.append("cep", model.cep);
  formData.append("address", model.address);
  formData.append("neighborhood", model.neighborhood);
  formData.append("city", model.city);
  formData.append("state", model.state);
  formData.append("number", model.number);
  formData.append("provider", model.provider.toString());
  formData.append("contactType", model.contactType.toString());
  formData.append("notifications", (model.notifications || false).toString());
  
  if (model.complement) {
    formData.append("complement", model.complement);
  }
  
  // Add avatar file if provided
  if (avatar && (avatar.startsWith('file://') || avatar.startsWith('data:'))) {
    const avatarFile = {
      uri: avatar,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any;
    
    formData.append("avatar", avatarFile);
  }
  
  return BaseService.postFormData<UserDTO>(API_ENDPOINTS.AUTH_REGISTER, formData);
};
 
export const getMe = async (clerkId: string): Promise<UserApiResponse | null> => {
  try { 
    // Use authenticatedApi directly to avoid BaseService error handling for 404s
    const response = await authenticatedApi.get(`${API_ENDPOINTS.AUTH_ME}/${clerkId}`);
    
    // Check if response is wrapped in Result format
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      // Response is in Result format
      return response.data.success ? response.data.value : null;
    } else {
      // Response is direct user data
      return response.data as UserApiResponse;
    }
  } catch (error: any) {
    // Handle 404 errors gracefully (user doesn't exist yet)
    if (error?.response?.status === 404) {
      console.log('User not found, redirecting to profile setup');
      return null;
    }
    
    // For other errors, still log but don't throw
    console.log('Error fetching user:', error);
    return null;
  }
};

export const updateProfile = async (model: UpdateUserDTO, avatar?: string): Promise<Result<UserApiResponse>> => {
  const formData = new FormData();

  formData.append("birthDate", model.birthDate);
  formData.append("cpf", model.cpf);
  formData.append("phone", model.phone);
  formData.append("bio", model.bio);
  formData.append("cep", model.cep);
  formData.append("address", model.address);
  formData.append("neighborhood", model.neighborhood);
  formData.append("city", model.city);
  formData.append("state", model.state);
  formData.append("number", model.number);
  formData.append("complement", model.complement ?? "");
  formData.append("notifications", model.notifications.toString());
  formData.append("contactType", model.contactType.toString());

  if (avatar && (avatar.startsWith('file://') || avatar.startsWith('data:'))) {
    const imageFile = {
      uri: avatar,
      type: DEFAULTS.USER.IMAGE_TYPE,
      name: `${DEFAULTS.USER.IMAGE_NAME_PREFIX}avatar.jpg`,
    } as any;
    formData.append("avatar", imageFile);
  }

  return BaseService.putFormData<UserApiResponse>(`${API_ENDPOINTS.AUTH_UPDATE}/${model.id}`, formData);
};
