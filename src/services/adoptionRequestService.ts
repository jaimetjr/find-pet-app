import { BaseService } from './baseService';
import { API_ENDPOINTS } from '@/constants';
import { Result } from '@/dtos/result';
import { 
  AdoptionRequestDTO, 
  CreateAdoptionRequestDTO, 
  UpdateAdoptionRequestStatusDTO 
} from '@/dtos/adoptionRequestDto';

/**
 * Create a new adoption request for a pet
 */
export const createAdoptionRequest = async (
  data: CreateAdoptionRequestDTO
): Promise<Result<AdoptionRequestDTO>> => {
  // Ensure we only send petId and message (no clerkId)
  const requestBody: CreateAdoptionRequestDTO = {
    petId: data.petId,
    message: data.message,
  };
  
  console.log('[createAdoptionRequest] Sending request:', JSON.stringify(requestBody, null, 2));
  
  return BaseService.post<AdoptionRequestDTO>(API_ENDPOINTS.ADOPTION_REQUESTS, requestBody);
};

/**
 * Get all adoption requests made by the current user (as adopter)
 */
export const getMyAdoptionRequests = async (): Promise<Result<AdoptionRequestDTO[]>> => {
  return BaseService.get<AdoptionRequestDTO[]>(API_ENDPOINTS.ADOPTION_REQUESTS);
};

/**
 * Get all adoption requests received for the current user's pets (as owner)
 */
export const getReceivedAdoptionRequests = async (): Promise<Result<AdoptionRequestDTO[]>> => {
  return BaseService.get<AdoptionRequestDTO[]>(API_ENDPOINTS.ADOPTION_REQUESTS_RECEIVED);
};

/**
 * Get a specific adoption request by ID
 */
export const getAdoptionRequest = async (id: string): Promise<Result<AdoptionRequestDTO>> => {
  return BaseService.get<AdoptionRequestDTO>(`${API_ENDPOINTS.ADOPTION_REQUESTS}/${id}`);
};

/**
 * Update the status of an adoption request (owner only)
 */
export const updateAdoptionRequestStatus = async (
  id: string,
  data: UpdateAdoptionRequestStatusDTO,
  clerkId?: string
): Promise<Result<AdoptionRequestDTO>> => {
  // Build request body - backend requires ClerkId for validation
  const requestBody: any = {
    status: data.status,
  };
  if (data.rejectionReason) {
    requestBody.rejectionReason = data.rejectionReason;
  }
  // Include ClerkId if provided (backend requires it for validation)
  if (clerkId) {
    requestBody.clerkId = clerkId;
  }
  
  console.log('[updateAdoptionRequestStatus] Sending request:', JSON.stringify(requestBody, null, 2));
  
  return BaseService.patch<AdoptionRequestDTO>(
    API_ENDPOINTS.ADOPTION_REQUEST_STATUS(id),
    requestBody
  );
};

/**
 * Cancel an adoption request (adopter only)
 */
export const cancelAdoptionRequest = async (id: string): Promise<Result<boolean>> => {
  return BaseService.delete<boolean>(`${API_ENDPOINTS.ADOPTION_REQUESTS}/${id}`);
};

/**
 * Check if user has a pending request for a specific pet
 */
export const checkPendingRequestForPet = async (petId: string): Promise<Result<AdoptionRequestDTO | null>> => {
  return BaseService.get<AdoptionRequestDTO | null>(
    `${API_ENDPOINTS.ADOPTION_REQUESTS}/check/${petId}`
  );
};

