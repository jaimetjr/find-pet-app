import { AddPetDTO } from "@/dtos/pet/addPetDto";
import { Result } from "@/dtos/result";
import { PetDTO } from "@/dtos/pet/petDto";
import { BaseService } from "./baseService";
import { API_ENDPOINTS, DEFAULTS } from "@/constants";

export const addPet = async (model: AddPetDTO): Promise<Result<PetDTO>> => {
  console.log(model);
  return BaseService.post<PetDTO>(API_ENDPOINTS.PETS, model);
}; 

export const getPets = async (): Promise<Result<PetDTO[]>> => {
  return BaseService.get<PetDTO[]>(API_ENDPOINTS.PETS);
}

export const getPet = async (id: string): Promise<Result<PetDTO>> => {
  return BaseService.get<PetDTO>(`${API_ENDPOINTS.PETS}/${id}`);
}

export const updatePet = async (id: string, model: AddPetDTO): Promise<Result<PetDTO>> => {
  return BaseService.put<PetDTO>(`${API_ENDPOINTS.PETS}/${id}`, model);
}

export const deletePet = async (id: string): Promise<Result<boolean>> => {
  return BaseService.delete<boolean>(`${API_ENDPOINTS.PETS}/${id}`);
}

export const addPetImages = async (id: string, userId : string, images: string[]) => {
  const formData = new FormData();
  formData.append("petId", id);
  formData.append("userId", userId);
  
  // Append each image individually to the FormData
  images.forEach((imageUri, index) => {
    // Create a file object for React Native
    const imageFile = {
      uri: imageUri,
      type: DEFAULTS.PET.IMAGE_TYPE,
      name: `${DEFAULTS.PET.IMAGE_NAME_PREFIX}${index}.jpg`,
    } as any;
    
    formData.append("images", imageFile);
  });

  return BaseService.postFormData(API_ENDPOINTS.PET_IMAGES, formData);
}

export const deletePetImage = async (petId: string, imageId: string): Promise<Result<boolean>> => {
  return BaseService.delete<boolean>(`${API_ENDPOINTS.PETS}/${petId}/images/${imageId}`);
}