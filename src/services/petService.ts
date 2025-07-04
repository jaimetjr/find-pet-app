import { AddPetDTO } from "@/dtos/pet/addPetDto";
import authenticatedApi from "./api";
import { Result } from "@/dtos/result";
import { PetDTO } from "@/dtos/pet/petDto";

// Helper function to extract error messages from API responses
const extractErrorMessages = (error: any): string[] => {
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
};

export const addPet = async (model: AddPetDTO): Promise<Result<PetDTO>> => {
  try {
    console.log(model);
    const response = await authenticatedApi.post("/pet", model);
    return response.data;
  } catch (error) {
    throw extractErrorMessages(error);
  }
}; 

export const getPets = async (): Promise<Result<PetDTO[]>> => {
  try {
    const response = await authenticatedApi.get("/pet");
    return response.data;
  } catch (error) {
    throw extractErrorMessages(error);
  }
}

export const getPet = async (id: string): Promise<Result<PetDTO>> => {
  try {
    const response = await authenticatedApi.get(`/pet/${id}`);
    return response.data;
  } catch (error) {
    throw extractErrorMessages(error);
  }
}

export const updatePet = async (id: string, model: AddPetDTO): Promise<Result<PetDTO>> => {
  try {
    const response = await authenticatedApi.put(`/pet/${id}`, model);
    return response.data;
  } catch (error) {
    throw extractErrorMessages(error);
  }
}

export const deletePet = async (id: string): Promise<Result<boolean>> => {
  try {
    const response = await authenticatedApi.delete(`/pet/${id}`);
    return response.data;
  } catch (error) {
    throw extractErrorMessages(error);
  }
}

export const addPetImages = async (id: string, userId : string, images: string[]) => {
  try {
    const formData = new FormData();
    formData.append("petId", id);
    formData.append("userId", userId);
    
    // Append each image individually to the FormData
    images.forEach((imageUri, index) => {
      // Create a file object for React Native
      const imageFile = {
        uri: imageUri,
        type: 'image/jpeg', // Default type, you might want to detect this
        name: `pet_image_${index}.jpg`, // Default name
      } as any;
      
      formData.append("images", imageFile);
    });

    const response = await authenticatedApi.post(`/pet/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw extractErrorMessages(error);
  }
}

export const deletePetImage = async (petId: string, imageId: string): Promise<Result<boolean>> => {
  try {
    const response = await authenticatedApi.delete(`/pet/${petId}/images/${imageId}`);
    return response.data;
  } catch (error) {
    throw extractErrorMessages(error);
  }
}